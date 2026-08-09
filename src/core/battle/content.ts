import { type CurrencyAmounts, type CurrencyId, type Rates } from '../currency';
import { type Numeric, ONE, parseOr, ZERO } from '../numeric';
import { ATB_THRESHOLD } from './clock';
import { MAX_ENERGY, toEnergyRules } from './energy';
import { toLineupRules } from './lineup';
import {
  type AuthoredAmount,
  type AuthoredCurrencies,
  type Combatant,
  type CombatantData,
  type CombatRules,
  type CombatRulesData,
  type CombatStats,
  type Row,
  type RowBonusData,
  type Skill,
  type SkillData,
  STAGE_CURRENCY_IDS,
  type StatBlockData,
} from './types';

/**
 * The boundary between authored content and the simulation.
 *
 * `data/` holds plain numbers and strings; the simulation needs `Numeric` quantities and
 * bounded scheduling weights. Everything crosses through here.
 *
 * Unlike the save layer, this does not report what it repaired: content is authored in this
 * repo rather than read off a player's device, so a bad stat block is a bug for a spec to
 * catch, not damage to recover and explain. The clamping exists because **the simulation's
 * termination argument depends on it**:
 *
 * - a `haste` of 0 would leave a combatant unable to ever act, and a `haste` above the gauge
 *   threshold would let one bank two actions in a single tick and break turn ordering;
 * - a `dodge` of 1 would make a combatant unhittable, and a fight nobody can win is a fight
 *   that runs to the tick cap;
 * - penetration at 1 would erase a defensive stat outright rather than diminish it;
 * - a resist at 1 would make a combatant immune to a damage type, which is the unwinnable
 *   fight arriving by a third route.
 *
 * None of those are balance opinions. They are the conditions under which `simulateBattle` is
 * guaranteed to return.
 */

/**
 * Smallest HP a combatant can be authored with. Zero HP means dead before the first tick,
 * which produces a battle log nobody can read.
 */
const MIN_HP: Numeric = ONE;

/**
 * Hard ceiling on `physicalPierce` and `magicPierce`.
 *
 * A shredder should make a wall feel like a body, not like an empty square. Leaving a tenth of
 * DEF standing keeps the diminishing-return curve doing its job at the top end, which is what
 * stops "stack penetration" from collapsing every defensive archetype at once.
 *
 * Content authors its own ceiling in `CombatRulesData.maxPenetration` and that is the one the
 * simulation applies; this is the floor under *that*, so no amount of retuning can produce a
 * penetration value that erases a defence outright.
 */
export const MAX_PENETRATION = 0.9;

/**
 * Hard ceiling on `physicalResist` and `magicResist`.
 *
 * ⚠️ The termination argument, not a balance opinion. Resist multiplies damage by `1 - resist`
 * **after** the defence curve has already diminished it, so unlike `def` it can reach zero
 * rather than merely approaching it. A combatant at resist 1 cannot be hurt by that damage
 * type at all, and a fight against one runs to `MAX_BATTLE_TICKS` every time.
 *
 * Same value as {@link MAX_PENETRATION} and same reasoning: a tenth of the damage still
 * getting through is what keeps a resist a discount rather than an immunity. As with
 * penetration, content authors its own ceiling and this is the floor under it.
 */
export const MAX_RESIST = 0.9;

/**
 * Ceiling on `accuracy`.
 *
 * Above 1 on purpose: hit chance is `accuracy - dodge`, so an accuracy stat capped at
 * certainty could never answer an evasion build and the only counter to dodge would be more
 * dodge. Two is enough to out-run any authorable dodge pool and still be a real cost.
 */
export const MAX_ACCURACY = 2;

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, min), max);
}

/** Clamps an optional authored number, treating absent and damaged identically. */
function optional(value: number | undefined, min: number, max: number, fallback: number): number {
  return value === undefined ? fallback : clamp(value, min, max, fallback);
}

/** Clamps an optional authored count to a non-negative whole number. */
function counter(value: number | undefined): number {
  return Math.floor(optional(value, 0, Number.MAX_SAFE_INTEGER, 0));
}

function atLeast(value: Numeric, floor: Numeric): Numeric {
  return value.lt(floor) ? floor : value;
}

/**
 * Parses and clamps an authored stat block into the form the simulation uses.
 *
 * `maxPenetration` and `maxResist` are parameters rather than constants read from here because
 * they are balance numbers, and balance numbers live in `data/`. They default to
 * {@link MAX_PENETRATION} and {@link MAX_RESIST} so a spec or a fixture can parse a stat block
 * without assembling a whole rule set; `toCombatant` passes the authored ceilings, which is the
 * path every real combatant takes.
 */
export function toCombatStats(
  raw: StatBlockData,
  maxPenetration: number = MAX_PENETRATION,
  maxResist: number = MAX_RESIST,
): CombatStats {
  const penCap = clamp(maxPenetration, 0, MAX_PENETRATION, MAX_PENETRATION);
  const resistCap = clamp(maxResist, 0, MAX_RESIST, MAX_RESIST);
  return {
    hp: atLeast(parseOr(raw.hp, MIN_HP), MIN_HP),
    atk: atLeast(parseOr(raw.atk, ZERO), ZERO),
    def: atLeast(parseOr(raw.def, ZERO), ZERO),
    recovery: raw.recovery === undefined ? ZERO : atLeast(parseOr(raw.recovery, ZERO), ZERO),
    haste: clamp(raw.haste, 1, ATB_THRESHOLD, 1),
    // Bounded by the gauge threshold on its own as well as jointly with haste, so a damaged
    // value cannot overflow the sum before `effectiveSpeed` gets to re-clamp it.
    attackSpeed: optional(raw.attackSpeed, 0, ATB_THRESHOLD, 0),
    critChance: clamp(raw.critChance, 0, 1, 0),
    // A point value rather than a multiplier: a crit deals `1 + max(amp - resist, 0)` times
    // normal, so zero here is a crit that does nothing extra rather than one that halves the hit.
    critDamageAmp: clamp(raw.critDamageAmp, 0, Number.MAX_SAFE_INTEGER, 0),
    critDamageResist: optional(raw.critDamageResist, 0, Number.MAX_SAFE_INTEGER, 0),
    critBlock: optional(raw.critBlock, 0, 1, 0),
    // Bounded by the bar it fills. A regen above `MAX_ENERGY` would mean "charged every turn
    // regardless", which is a cooldown of one turn wearing a meter's clothes — and clamping it
    // here is what stops a damaged stat block from expressing that by accident.
    energyRegen: optional(raw.energyRegen, 0, MAX_ENERGY, 0),
    lifeLeech: optional(raw.lifeLeech, 0, 1, 0),
    insight: optional(raw.insight, 0, 1, 0),
    tenacity: optional(raw.tenacity, 0, 1, 0),
    physicalPierce: optional(raw.physicalPierce, 0, penCap, 0),
    magicPierce: optional(raw.magicPierce, 0, penCap, 0),
    physicalResist: optional(raw.physicalResist, 0, resistCap, 0),
    magicResist: optional(raw.magicResist, 0, resistCap, 0),
    healthRegen: optional(raw.healthRegen, 0, Number.MAX_SAFE_INTEGER, 0),
    receivedHealing: optional(raw.receivedHealing, 0, Number.MAX_SAFE_INTEGER, 0),
    dodge: optional(raw.dodge, 0, 1, 0),
    accuracy: optional(raw.accuracy, 0, MAX_ACCURACY, 1),
  };
}

/**
 * Applies what standing in a row is worth.
 *
 * Each rank sharpens the role it already has. The front row is the gate ordinary attacks work
 * through, so it gets defence and the answer to a crit build; the back row is where damage is
 * fielded, so it gets attack and the amplification to go with it.
 *
 * The crit halves are **point additions** rather than multipliers, because that is how the
 * opposed pair resolves — `1 + max(amp - resist, 0)`. Multiplying a combatant's zero
 * amplification by 1.05 would pay nothing at all, which is the failure mode a percentage on a
 * point value always has.
 */
export function applyRowBonus(stats: CombatStats, row: Row, rows: RowBonusData): CombatStats {
  if (row === 'front') {
    return {
      ...stats,
      def: stats.def.mul(Math.max(rows.frontDefence, 0)),
      critDamageResist: stats.critDamageResist + Math.max(rows.frontCritDamageResist, 0),
    };
  }

  return {
    ...stats,
    atk: stats.atk.mul(Math.max(rows.backAttack, 0)),
    critDamageAmp: stats.critDamageAmp + Math.max(rows.backCritDamageAmp, 0),
  };
}

/**
 * Parses an authored skill, defaulting everything a terse kit leaves out.
 *
 * **An ultimate's cooldown is discarded rather than honoured.** The two meters are exclusive by
 * design — see {@link SkillData.ultimate} — and enforcing that here rather than trusting content
 * means a kit cannot acquire a second gate by accident. `data/skills.spec.ts` asserts no ultimate
 * authors one in the first place; this is the guard under that, in the same spirit as every other
 * clamp in this file.
 */
export function toSkill(raw: SkillData): Skill {
  const ultimate = raw.ultimate === true;
  return {
    id: raw.id,
    name: raw.name,
    target: raw.target,
    effects: raw.effects,
    ultimate,
    cooldown: ultimate ? 0 : counter(raw.cooldown),
    condition: raw.condition ?? { kind: 'always' },
    priority: optional(raw.priority, -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1),
  };
}

/**
 * Parses an authored combatant onto the field.
 *
 * Skills are sorted by descending priority here rather than at selection time, so choosing an
 * action is a linear scan over a list whose order is fixed for the whole battle. `sort` is
 * stable, so ties keep their authored order and the choice stays reproducible.
 */
export function toCombatant(raw: CombatantData, rules: CombatRules, row: Row): Combatant {
  return {
    id: raw.id,
    name: raw.name,
    faction: raw.faction,
    stats: applyRowBonus(
      toCombatStats(raw.stats, rules.maxPenetration, rules.maxResist),
      row,
      rules.rows,
    ),
    basic: raw.basic === undefined ? rules.basicAttack : toSkill(raw.basic),
    skills: (raw.skills ?? []).map(toSkill).sort((a, b) => b.priority - a.priority),
    opening: raw.opening ?? [],
  };
}

/** The lookup key for one ordered faction pairing. */
export function matchupKey(attacker: string, defender: string): string {
  return `${attacker}>${defender}`;
}

/**
 * Parses the authored combat rules.
 *
 * The matchup list becomes a map because it is read on every single attack. A later duplicate
 * pairing wins, which makes an override at the bottom of the authored table behave the way
 * anyone reading it would expect.
 */
export function toCombatRules(raw: CombatRulesData): CombatRules {
  const matchups = new Map<string, number>();
  for (const { attacker, defender, multiplier } of raw.matchups) {
    matchups.set(matchupKey(attacker, defender), clamp(multiplier, 0, Number.MAX_SAFE_INTEGER, 1));
  }

  return {
    rows: {
      frontDefence: clamp(raw.rows.frontDefence, 0, Number.MAX_SAFE_INTEGER, 1),
      frontCritDamageResist: clamp(raw.rows.frontCritDamageResist, 0, Number.MAX_SAFE_INTEGER, 0),
      backAttack: clamp(raw.rows.backAttack, 0, Number.MAX_SAFE_INTEGER, 1),
      backCritDamageAmp: clamp(raw.rows.backCritDamageAmp, 0, Number.MAX_SAFE_INTEGER, 0),
    },
    matchups,
    lineup: toLineupRules(raw.lineup),
    energy: toEnergyRules(raw.energy),
    // Not clamped here, unlike everything else in this function. A growth coefficient is guarded
    // where it is used — `growthAt` screens a non-finite or below-one rate down to 1 — because
    // the guard has to run per tier and this parse has no tier in hand.
    growth: raw.growth,
    // Never zero. A hit chance that can reach zero is a battle that can never end.
    minHitChance: clamp(raw.minHitChance, Number.MIN_VALUE, 1, 0.1),
    maxPenetration: clamp(raw.maxPenetration, 0, MAX_PENETRATION, MAX_PENETRATION),
    // Never 1, for the same reason: a combatant nothing can damage is a battle that can never
    // end, whether the immunity came from dodging or from soaking.
    maxResist: clamp(raw.maxResist, 0, MAX_RESIST, MAX_RESIST),
    basicAttack: toSkill(raw.basicAttack),
  };
}

/** Parses an authored quantity, treating anything unusable as nothing. */
export function toAmount(raw: AuthoredAmount | undefined): Numeric {
  return raw === undefined ? ZERO : atLeast(parseOr(raw, ZERO), ZERO);
}

/**
 * Parses an authored per-currency block.
 *
 * Absent keys are left absent rather than defaulted to zero, so a payout carries only what a
 * stage actually grants — which is what lets the "while you were away" panel list the two
 * currencies that moved instead of five, three of them zero.
 */
export function toCurrencyAmounts(raw: AuthoredCurrencies): CurrencyAmounts {
  const parsed: Partial<Record<CurrencyId, Numeric>> = {};
  // `STAGE_CURRENCY_IDS` rather than `RATE_CURRENCY_IDS`: the two stopped being the same list in
  // milestone 16, when `emblem` gained a rate that no stage may author. See `AuthoredCurrencies`.
  for (const id of STAGE_CURRENCY_IDS) {
    const value = raw[id];
    if (value !== undefined) {
      parsed[id] = toAmount(value);
    }
  }
  return parsed;
}

/** Parses an authored rate block. Same shape, different destination. */
export function toRates(raw: AuthoredCurrencies): Readonly<Partial<Rates>> {
  return toCurrencyAmounts(raw);
}

/**
 * Ticks a combatant needs to fill its gauge from empty.
 *
 * The clearest way to read what a haste value actually buys, which is why it is exported
 * rather than inlined: balance work and specs both reason in actions, not in gauge points.
 */
export function ticksPerAction(haste: number): number {
  return Math.ceil(ATB_THRESHOLD / clamp(haste, 1, ATB_THRESHOLD, 1));
}

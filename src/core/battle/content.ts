import { type CurrencyAmounts, type CurrencyId, type Rates, RATE_CURRENCY_IDS } from '../currency';
import { type Numeric, ONE, parseOr, ZERO } from '../numeric';
import { ATB_THRESHOLD } from './clock';
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
 * - a `spd` of 0 would leave a combatant unable to ever act, and a `spd` above the gauge
 *   threshold would let one bank two actions in a single tick and break turn ordering;
 * - a `dodge` of 1 would make a combatant unhittable, and a fight nobody can win is a fight
 *   that runs to the tick cap;
 * - penetration at 1 would erase a defensive stat outright rather than diminish it.
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
 * Hard ceiling on `armorPen` and `magicPen`.
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
 * `maxPenetration` is a parameter rather than a constant read from here because it is a balance
 * number, and balance numbers live in `data/`. It defaults to {@link MAX_PENETRATION} so a spec
 * or a fixture can parse a stat block without assembling a whole rule set; `toCombatant` passes
 * the authored ceiling, which is the path every real combatant takes.
 */
export function toCombatStats(
  raw: StatBlockData,
  maxPenetration: number = MAX_PENETRATION,
): CombatStats {
  const penCap = clamp(maxPenetration, 0, MAX_PENETRATION, MAX_PENETRATION);
  return {
    hp: atLeast(parseOr(raw.hp, MIN_HP), MIN_HP),
    patk: atLeast(parseOr(raw.patk, ZERO), ZERO),
    matk: atLeast(parseOr(raw.matk, ZERO), ZERO),
    pdef: atLeast(parseOr(raw.pdef, ZERO), ZERO),
    mdef: atLeast(parseOr(raw.mdef, ZERO), ZERO),
    spd: clamp(raw.spd, 1, ATB_THRESHOLD, 1),
    critChance: clamp(raw.critChance, 0, 1, 0),
    critMultiplier: clamp(raw.critMultiplier, 1, Number.MAX_SAFE_INTEGER, 1),
    // Whole points: MP is a budget counted against authored costs, and a pool of 40.5 would
    // make "three casts at 13" depend on floating-point luck.
    mp: counter(raw.mp),
    mpRegen: counter(raw.mpRegen),
    lifesteal: optional(raw.lifesteal, 0, 1, 0),
    effectHit: optional(raw.effectHit, 0, 1, 0),
    tenacity: optional(raw.tenacity, 0, 1, 0),
    armorPen: optional(raw.armorPen, 0, penCap, 0),
    magicPen: optional(raw.magicPen, 0, penCap, 0),
    dodge: optional(raw.dodge, 0, 1, 0),
    accuracy: optional(raw.accuracy, 0, MAX_ACCURACY, 1),
  };
}

/**
 * Applies what standing in a row is worth.
 *
 * The front row's bonus is symmetric across both defences, so putting a body forward is worth
 * the same amount regardless of what is being thrown at it.
 *
 * The back row's is deliberately **not** symmetric: it lands on whichever offensive stat is
 * already higher, and on nothing else. A caster in the back gets the whole of it on `matk`,
 * which only its skills use, and none of it on the physical basic attack it spends most of
 * its turns making — so the bonus rewards standing where a character's damage actually comes
 * from rather than rewarding the back row itself. Ties go to `patk`, the stat the basic
 * attack reads, which is the conservative half of an arbitrary choice.
 */
export function applyRowBonus(stats: CombatStats, row: Row, rows: RowBonusData): CombatStats {
  if (row === 'front') {
    const multiplier = Math.max(rows.frontDefence, 0);
    return { ...stats, pdef: stats.pdef.mul(multiplier), mdef: stats.mdef.mul(multiplier) };
  }

  const multiplier = Math.max(rows.backOffence, 0);
  return stats.matk.gt(stats.patk)
    ? { ...stats, matk: stats.matk.mul(multiplier) }
    : { ...stats, patk: stats.patk.mul(multiplier) };
}

/** Parses an authored skill, defaulting everything a terse kit leaves out. */
export function toSkill(raw: SkillData): Skill {
  const kind = raw.cost?.kind ?? 'none';
  return {
    id: raw.id,
    name: raw.name,
    target: raw.target,
    effects: raw.effects,
    costKind: kind,
    // A cost of zero on an `mp` or `hp` skill is not an error — it is a free skill a later
    // balance pass can price without touching the kit's shape.
    costAmount: kind === 'none' ? 0 : counter(raw.cost?.amount),
    cooldown: counter(raw.cooldown),
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
    stats: applyRowBonus(toCombatStats(raw.stats, rules.maxPenetration), row, rules.rows),
    basic: raw.basic === undefined ? rules.basicAttack : toSkill(raw.basic),
    skills: (raw.skills ?? []).map(toSkill).sort((a, b) => b.priority - a.priority),
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
      backOffence: clamp(raw.rows.backOffence, 0, Number.MAX_SAFE_INTEGER, 1),
    },
    matchups,
    // Never zero. A hit chance that can reach zero is a battle that can never end.
    minHitChance: clamp(raw.minHitChance, Number.MIN_VALUE, 1, 0.1),
    maxPenetration: clamp(raw.maxPenetration, 0, MAX_PENETRATION, MAX_PENETRATION),
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
  for (const id of RATE_CURRENCY_IDS) {
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
 * The clearest way to read what a speed value actually buys, which is why it is exported
 * rather than inlined: balance work and specs both reason in actions, not in gauge points.
 */
export function ticksPerAction(spd: number): number {
  return Math.ceil(ATB_THRESHOLD / clamp(spd, 1, ATB_THRESHOLD, 1));
}

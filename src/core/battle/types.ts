import { type CurrencyAmounts, type Rates } from '../currency';
import { type CharacterTier, type GrowthData } from '../growth';
import { type Numeric } from '../numeric';

/**
 * The combat vocabulary, in two layers.
 *
 * **`...Data` types are the plain, JSON-safe shapes authored in `data/`.** Quantities are
 * `number | string` rather than `Numeric`, because a `Numeric` is a `Decimal` instance and
 * constructing one would mean `data/` importing `core/` — which the layering forbids and
 * which would stop content from ever being loaded from a file. Strings are accepted so a
 * late-game stat block can exceed float64 without losing digits.
 *
 * **The runtime types are what the simulation works in.** `core/battle/content.ts` converts
 * one into the other, clamping anything unusable, in the same spirit as the save layer's
 * repair pass.
 *
 * Nothing here imports from `data/`: content arrives as an argument, which is what lets the
 * simulation be driven with test fixtures instead of shipped content.
 */

/** Which team a combatant fights for. */
export type Side = 'ally' | 'enemy';

/**
 * Which rank a combatant stands in.
 *
 * The front row is a **gate**: ordinary attacks work through it before they can reach the
 * back row, which is what makes a back-line healer a lock rather than just another body.
 * Placement is free — any character can stand anywhere — so a roster of nothing but Elves and
 * Angels can still field a front row, just a bad one. Role-locking rows would let an unlucky
 * run reach a state where no legal party exists, which is not a failure a game with no way to
 * buy characters should be able to produce.
 */
export type Row = 'front' | 'back';

/** Both rows, in the order they are drawn and in the order slots are numbered. */
export const ROWS = ['front', 'back'] as const;

/** Which defence a hit is measured against. */
export type DamageType = 'physical' | 'magical';

/**
 * A stat a buff or debuff can move.
 *
 * Deliberately only the three that are multiplied into a damage or scheduling calculation.
 * Crit chance, life leech and the accuracy pair are excluded because a multiplier on a
 * probability is far harder to read than one on a quantity, and because a stacking crit buff
 * is the fastest route to a fight decided entirely by one lucky opening turn.
 *
 * It was five before milestone 8a. Collapsing `patk`/`matk` into `atk` and `pdef`/`mdef` into
 * `def` made the magical half of each opposed status the same status twice, so `CURSE`, `WARD`
 * and `FOCUS` went with them rather than surviving as duplicates under different names.
 */
export type ModifiableStat = 'atk' | 'def' | 'haste';

/**
 * The plain stat block authored in `data/`.
 *
 * The six required fields are what a combatant **is**. The rest default to nothing (or, for
 * {@link accuracy}, to certainty), so a stat block only mentions a stat when that stat is part
 * of the character's identity — a Dwarf does not need to declare `physicalPierce: 0` to say it
 * is not a shredder.
 *
 * ## One attack, one defence
 *
 * Damage type is a property of the **skill**, not of the stat it reads. A skill declares
 * physical or magical, reads the single {@link atk}, and is reduced by {@link def} less the
 * matching pierce and then by the matching resist. Four stats became two, and the axis they
 * used to carry moved onto {@link physicalResist} and {@link magicResist} — which is what keeps
 * a Golem a wall against swords and a liability against spells.
 */
export interface StatBlockData {
  readonly hp: number | string;
  /**
   * Attack. **One stat.** Every damaging skill reads it whatever type it declares, so a
   * caster's basic swing and its spells come off the same number.
   */
  readonly atk: number | string;
  /** Defence. **One stat.** Reduces both damage types, before the matching resist applies. */
  readonly def: number | string;
  /**
   * Health recovered at the top of each of this combatant's own turns, before
   * {@link healthRegen} amplifies it.
   *
   * The one new stat that **must** scale. It is measured against `hp`, so a fixed value is a
   * no-op the moment health outgrows it — the same argument that keeps a budget stat fixed,
   * run backwards.
   */
  readonly recovery?: number | string;
  /**
   * ATB gauge gained per battle tick. Was `spd`. A plain `number` because it is bounded —
   * haste is a scheduling weight, not a quantity that grows exponentially, and the simulation
   * relies on it staying at or below `ATB_THRESHOLD`.
   */
  readonly haste: number;
  /**
   * Extra gauge, accruing **only when the combatant's last action was a basic attack**.
   *
   * The split between this and {@link haste} is the one mapping in the block with no precedent
   * in the codebase. In a real-time game casting frequency and swing speed are genuinely
   * different things; in an ATB system `gauge += haste` makes both just gauge fill, so the
   * separation has to be manufactured. This is the manufactured half: a high-attack-speed
   * combatant machine-guns basics between its skill windows, and a cast drops it back to plain
   * haste for one turn.
   *
   * **Keyed off the action already taken rather than the one about to be chosen.** Predicting
   * the next action means running `chooseSkill`, which the scheduling loop cannot afford; and
   * approximating it as "nothing in the kit is off cooldown" silently suppresses the bonus for
   * a whole fight whenever a skill is gated on a condition that is not currently met, because
   * such a skill never goes on cooldown. See `effectiveSpeed` and `docs/attributes.md`.
   */
  readonly attackSpeed?: number;
  /** Probability of a critical hit before the target's {@link critBlock}, 0–1. */
  readonly critChance: number;
  /**
   * Crit damage amplification, in points above the base hit.
   *
   * A crit deals `1 + max(critDamageAmp − target.critDamageResist, 0)` times normal. Opposed
   * rather than flat, which is what makes {@link critDamageResist} an authorable answer to a
   * crit build instead of leaving dodge as the only one. `0.6` here is the old
   * `critMultiplier: 1.6`.
   */
  readonly critDamageAmp: number;
  /** Subtracted from an attacker's {@link critDamageAmp} when this combatant is crit. */
  readonly critDamageResist?: number;
  /** Subtracted from an attacker's {@link critChance} when this combatant is the target. */
  readonly critBlock?: number;

  /**
   * Energy regained at the top of each of this combatant's own turns.
   *
   * The drip half of the energy meter. The other half — landing a hit, taking one, healing an
   * ally — is the same for everybody and lives in {@link EnergyRulesData}, because it describes
   * what fighting is worth rather than what a character is like. This is the half that is
   * authorable, and it is where "casts often" is said: a support with 14 here reaches its
   * ultimate on the drip alone, and a Monster with none reaches it only by fighting.
   *
   * Absent means zero, which is a combatant that charges purely from combat.
   *
   * A plain `number`, and deliberately unscaled: it is a budget measured against a fixed
   * `MAX_ENERGY` bar, so growing it with level would quietly delete the metering — the
   * same argument that kept `mp` flat before energy replaced it.
   */
  readonly energyRegen?: number;
  /** Fraction of damage dealt returned to the attacker as healing, 0–1. Was `lifesteal`. */
  readonly lifeLeech?: number;
  /**
   * Added to a status effect's authored application chance when this combatant applies it.
   * Was `effectHit`.
   */
  readonly insight?: number;
  /** Subtracted from a status effect's application chance when this combatant is the target. */
  readonly tenacity?: number;
  /** Fraction of the target's `def` ignored by a physical hit. Was `armorPen`. */
  readonly physicalPierce?: number;
  /**
   * Fraction of the target's `def` ignored by a magical hit. Was `magicPen`.
   *
   * **Never abbreviate this to MP.** That spelling belonged to the skill-point pool, which 8b
   * deleted, and now belongs to nothing — which makes it free to be misread rather than safe.
   */
  readonly magicPierce?: number;
  /** Fraction of incoming physical damage removed, applied after `def`. */
  readonly physicalResist?: number;
  /** Fraction of incoming magical damage removed, applied after `def`. */
  readonly magicResist?: number;
  /** Percentage amplifier on {@link recovery}. */
  readonly healthRegen?: number;
  /** Percentage amplifier on healing received **from somebody else**. */
  readonly receivedHealing?: number;
  /** Subtracted from an incoming attack's hit chance. */
  readonly dodge?: number;
  /** Base hit chance before the target's dodge. Absent means 1 — a certain hit. */
  readonly accuracy?: number;
}

/**
 * Who a skill reaches.
 *
 * The single-target enemy rules are the whole reason rows exist. `enemy-front` is the gate
 * every ordinary attack goes through; `enemy-back` is the bypass a sniper or a mage is bought
 * for; `enemy-lowest` ignores rank entirely and is the executioner's rule.
 */
export type SkillTarget =
  /** Front row first, falling through to the back row only once the front is empty. */
  | 'enemy-front'
  /** Back row first, falling through to the front row only once the back is empty. */
  | 'enemy-back'
  /** Lowest remaining HP on the opposing side, ignoring rank. */
  | 'enemy-lowest'
  /** Highest remaining HP on the opposing side, ignoring rank. */
  | 'enemy-highest'
  /** Every living opponent in the front row. */
  | 'enemy-row-front'
  /** Every living opponent in the back row. */
  | 'enemy-row-back'
  /** Every living opponent. */
  | 'enemy-all'
  /** The ally with the lowest remaining HP fraction, which may be the caster. */
  | 'ally-lowest'
  /** The ally carrying the most hostile statuses, which may be the caster. */
  | 'ally-afflicted'
  /** Every living ally, including the caster. */
  | 'ally-all'
  | 'self';

/** When a skill is worth using, checked before its cost and cooldown. */
export type SkillConditionData =
  /** Always eligible. The default when a skill declares no condition. */
  | { readonly kind: 'always' }
  /** Some living ally, caster included, is below `fraction` of its maximum HP. */
  | { readonly kind: 'ally-hurt'; readonly fraction: number }
  /** Some living ally, caster included, carries at least one hostile status. */
  | { readonly kind: 'ally-afflicted' }
  /** The caster is below `fraction` of its maximum HP. */
  | { readonly kind: 'self-hurt'; readonly fraction: number }
  /** At least `count` opponents are still standing. */
  | { readonly kind: 'enemies-at-least'; readonly count: number }
  /** No living opponent already carries the status `statusId`. */
  | { readonly kind: 'status-absent'; readonly statusId: string };

/**
 * A lasting effect on one combatant.
 *
 * Durations are in **battle ticks** rather than turns. Turns are not a shared unit — a Wisp
 * takes three for every one a Golem takes — so a debuff quoted in turns would last three
 * times as long on the slow target it was least needed against. Ticks are the only clock both
 * sides share.
 *
 * `hostile` is what a cleanse keys off. It is authored rather than inferred from the kind,
 * because a slow is a debuff and a haste is not even though both are a `stat-mod`.
 */
export type StatusData =
  | {
      readonly kind: 'stat-mod';
      readonly id: string;
      readonly name: string;
      readonly hostile: boolean;
      readonly duration: number;
      readonly stat: ModifiableStat;
      /** Multiplier applied to the stat while this is active. Below 1 is a debuff. */
      readonly multiplier: number;
    }
  | {
      readonly kind: 'dot';
      readonly id: string;
      readonly name: string;
      readonly hostile: true;
      readonly duration: number;
      readonly damageType: DamageType;
      /** Fraction of the applier's `atk` dealt on each affected turn. */
      readonly power: number;
    }
  | {
      readonly kind: 'regen';
      readonly id: string;
      readonly name: string;
      readonly hostile: false;
      readonly duration: number;
      /** Fraction of the applier's `atk` healed on each affected turn. */
      readonly power: number;
    }
  | {
      readonly kind: 'shield';
      readonly id: string;
      readonly name: string;
      readonly hostile: false;
      readonly duration: number;
      /** Fraction of the applier's `atk` banked as an absorb pool. */
      readonly power: number;
    }
  | {
      readonly kind: 'stun';
      readonly id: string;
      readonly name: string;
      readonly hostile: true;
      readonly duration: number;
    };

/**
 * One clause of what a skill does, resolved in authored order.
 *
 * `power` is applied to the **result** of the damage formula rather than to the attack stat
 * feeding it. Scaling the input would make a 2× skill hit for roughly 4×, because the formula
 * is quadratic in ATK — which turns every skill multiplier into a balance trap.
 */
export type SkillEffectData =
  | { readonly kind: 'damage'; readonly damageType: DamageType; readonly power: number }
  | {
      readonly kind: 'drain';
      readonly damageType: DamageType;
      readonly power: number;
      /** Fraction of the damage dealt healed back, on top of the caster's lifesteal. */
      readonly siphon: number;
    }
  | { readonly kind: 'heal'; readonly power: number }
  | {
      readonly kind: 'status';
      readonly status: StatusData;
      /**
       * Base application chance before `effectHit` and `tenacity`. Absent means certainty.
       *
       * Debuffs are meant to land. The answer to one is a cleanse, not a resistance stat
       * race: the contest exists so that a dedicated debuffer and a dedicated bulwark are
       * both authorable, not so that most applications are coin flips.
       */
      readonly chance?: number;
    }
  | { readonly kind: 'cleanse'; readonly count: number };

/** A skill as authored in `data/`. */
export interface SkillData {
  readonly id: string;
  readonly name: string;
  readonly target: SkillTarget;
  readonly effects: readonly SkillEffectData[];
  /**
   * Whether this is the kit's **ultimate**: metered by a full energy bar rather than by a
   * cooldown, and emptying that bar when it fires.
   *
   * There are exactly two ways to meter a skill, and this flag is the whole of the distinction.
   * An ultimate is always available once charged and never otherwise; everything else is always
   * affordable and gated by its cooldown alone. `data/characters.spec.ts` asserts every playable
   * character declares exactly one, which is what makes "the ultimate" a thing the roster screen
   * and milestone 8c's skill gating can both point at.
   *
   * An ultimate carries no cooldown. Two meters on one skill would make "when does this come
   * up" the product of a bar and a timer, which is the unreadability energy replaced MP to fix.
   */
  readonly ultimate?: boolean;
  /**
   * Battle ticks before this skill can be used again, counted from the turn it was used.
   *
   * Absent means no cooldown, which is only sane on an {@link ultimate} — anything else would
   * be a strictly better basic attack available every single turn.
   */
  readonly cooldown?: number;
  readonly condition?: SkillConditionData;
  /**
   * Selection order. The highest-priority eligible skill is used; the basic attack is the
   * floor at priority 0, so any skill worth authoring sits above it.
   */
  readonly priority?: number;
}

/** A character or enemy as authored in `data/`. */
export interface CombatantData {
  readonly id: string;
  readonly name: string;
  /**
   * Which faction this fights for, driving the matchup matrix in {@link CombatRulesData}.
   *
   * A plain string rather than a union, because factions are content: `data/` authors them
   * and `core/` only ever looks them up. An unknown faction simply has no matchups, which is
   * the same as being neutral against everything.
   */
  readonly faction: string;
  readonly stats: StatBlockData;
  /**
   * The attack used when nothing better is available. Absent means the rules' default: a
   * single-target **physical** hit into the front row.
   *
   * Physical for everybody is deliberate, and it still is after the collapse to one `atk`.
   * The type no longer decides which attack stat is read — it decides which pierce and which
   * resist apply — so a basic attack is the swing every physical-resist wall is authored
   * against, and a magical kit is what gets past one.
   */
  readonly basic?: SkillData;
  /** Everything above the basic attack, in any order; parsing sorts them by priority. */
  readonly skills?: readonly SkillData[];
  /**
   * Statuses this combatant is already carrying when the first tick runs.
   *
   * Added in milestone 16 as the **passive** half of the signature-ability vocabulary, and
   * expressed as ordinary {@link StatusData} rather than as a new passive language. Everything a
   * passive would want to say — a lasting stat multiplier, a regeneration, a shield, an aura — is
   * already a status, and statuses already carry a duration, a hostile flag, a cleanse
   * interaction, and a display name every screen knows how to draw.
   *
   * ⚠️ **A permanent passive is written as a duration longer than a fight can last.** There is
   * deliberately no "forever" value: `MAX_BATTLE_TICKS` bounds every battle, so a duration above it
   * is permanent in every sense the simulation can observe — and keeping this a plain number means
   * nothing downstream has to special-case an infinity.
   *
   * Applied at tick 0 against the combatant's **own** stats, which matters for the kinds that
   * price off the applier: a shield or a regeneration granted here is sized by the wearer, because
   * the wearer is who granted it.
   *
   * General rather than signature-specific: an enemy archetype could declare one, and nothing here
   * knows what a signature item is. That is the same latitude `basic` and `skills` have.
   */
  readonly opening?: readonly StatusData[];
}

/** One side's line-up, in two rows. */
export interface FormationData {
  readonly front: readonly CombatantData[];
  readonly back: readonly CombatantData[];
}

/**
 * An enemy archetype as authored in `data/`: a combatant, plus the slope it climbs.
 *
 * The stat block here is the archetype at **level 1**, exactly as a character's is, and what a
 * stage fields is that archetype at {@link StageData.level}. Before milestone 10 there was no
 * such distinction — an enemy was a finished stat block, sized by hand for the band of the
 * ladder it appeared in — and the cost of that was the thing this milestone had to fix: a lock
 * is a puzzle the player solves once and then outgrows, so every question the ladder asks
 * decays into an empty square as the party's own curve runs away from it.
 *
 * A tier is the same three slopes a character has and means the same thing here. Fodder is
 * `common`, a lock is `legendary`, a gate is `ascended` — so a boss pulls away from the escort
 * standing in front of it as the ladder climbs, rather than the two keeping a fixed distance
 * forever. It is not a difficulty dial: at level 1 the three slopes are identical, and the
 * budget in the block is what says how big the thing is.
 */
export interface EnemyData extends CombatantData {
  readonly tier: CharacterTier;
}

/** An encounter's line-up, in two rows. The enemy-side mirror of {@link FormationData}. */
export interface EnemyFormationData {
  readonly front: readonly EnemyData[];
  readonly back: readonly EnemyData[];
}

/** A quantity as authored in `data/`, before it becomes a `Numeric`. */
export type AuthoredAmount = number | string;

/**
 * Per-currency quantities as authored in `data/`. Absent keys mean zero.
 *
 * ⚠️ **This is deliberately narrower than the set of currencies that have a rate.** Since
 * milestone 16 `RATE_CURRENCY_IDS` also carries `emblem`, and `emblem` is **not** here: an emblem
 * is never authored onto a stage, as a lump or as a rate. Its two sources are the chapter-stepped
 * idle curve and a drop chance, both of which are functions of *where the run has got to* rather
 * than of any one encounter.
 *
 * Adding `emblem` here would be a third mechanism on the same currency, and a silent one — because
 * `raiseRates` takes the larger of what it is offered and what a run already earns, whichever
 * source happened to be bigger would quietly win with nothing on screen to say which. That is the
 * same trap milestone 11 removed from gold, xp and essence when it stopped stages authoring their
 * own payouts.
 */
export interface AuthoredCurrencies {
  readonly gold?: AuthoredAmount;
  readonly xp?: AuthoredAmount;
  readonly essence?: AuthoredAmount;
  readonly summons?: AuthoredAmount;
}

/**
 * The currencies a stage may author, as a list to iterate.
 *
 * Exists so that {@link AuthoredCurrencies} being narrower than `RATE_CURRENCY_IDS` is a fact the
 * parsers read rather than one they can fall out of step with. It is `satisfies` against the
 * interface's own keys, so adding a field there without adding it here — or the reverse — is a
 * compile error rather than an authored quantity that is silently never parsed.
 */
export const STAGE_CURRENCY_IDS = [
  'gold',
  'xp',
  'essence',
  'summons',
] as const satisfies readonly (keyof AuthoredCurrencies)[];

/** One faction's edge over another, as authored in `data/`. */
export interface FactionMatchupData {
  readonly attacker: string;
  readonly defender: string;
  /** Damage multiplier applied when `attacker` hits `defender`. */
  readonly multiplier: number;
}

/**
 * What standing in each rank is worth.
 *
 * Each rank **sharpens the role it already has** rather than paying a flat tax on the other.
 * The front row is the gate ordinary attacks work through, so it gets defence and the answer
 * to a crit build; the back row is where damage is fielded, so it gets attack and the crit
 * amplification to go with it.
 *
 * This replaced milestone 4's "+5% to whichever offensive stat is already higher, and only
 * that one", which had no meaning once `patk` and `matk` collapsed into one stat. The
 * front/back asymmetry it existed to protect is what makes the front rank a real cost, so it
 * needed replacing rather than dropping.
 */
export interface RowBonusData {
  /** Multiplier on `def` for a front-row combatant. */
  readonly frontDefence: number;
  /** Points of `critDamageResist` added for a front-row combatant. */
  readonly frontCritDamageResist: number;
  /** Multiplier on `atk` for a back-row combatant. */
  readonly backAttack: number;
  /** Points of `critDamageAmp` added for a back-row combatant. */
  readonly backCritDamageAmp: number;
}

/**
 * One rung of the composition ladder: a shape a party can have, and what it pays.
 *
 * A **shape** rather than a faction. `{ largest: 3, second: 2 }` reads "three of one faction and
 * two of another", and says nothing about which — that is what makes the ladder seven teams
 * rather than one, and it is the whole of why this is sanctioned where a flat synergy bonus is
 * not. See {@link LineupRulesData}.
 */
export interface LineupTierData {
  /** Members of a single faction this rung asks for. */
  readonly largest: number;
  /** Members of a **second** faction it also asks for. Zero means it asks for nothing else. */
  readonly second: number;
  /** Fractional points added to `atk`. `0.1` is +10%. */
  readonly attack: number;
  /** Fractional points added to `hp`. */
  readonly health: number;
}

/**
 * One step of the ladder faction's own track, awarded for the *n*th member of that faction.
 *
 * Cumulative: a party fielding three gets steps one, two and three. Every field is optional
 * because a step says only what it adds, in the same spirit as a stat block mentioning a stat
 * only when that stat is part of the character's identity.
 */
export interface LineupLadderStepData {
  /** Fractional points added to `def`. */
  readonly defence?: number;
  /**
   * Fractional points added to `energyRegen`, and **only while the combatant is injured** —
   * below {@link LineupRulesData.injuredBelow} of its maximum health.
   *
   * The one bonus in the file that is not a constant for the whole fight, which is why it is
   * carried on the fighter rather than folded into its stat block. See `lineup.ts`.
   */
  readonly injuredEnergyRegen?: number;
  /** Points of `critChance`. A rating is a probability, so this is added, not multiplied. */
  readonly critChance?: number;
  /**
   * Points of `critDamageAmp`.
   *
   * Points rather than a multiplier, for the reason the row bonus is: a crit is worth
   * `1 + max(amp − resist, 0)`, so a percentage of a roster that mostly sits low would pay
   * almost nothing.
   */
  readonly critDamageAmp?: number;
  /**
   * Points of `haste`.
   *
   * ⚠️ Re-clamped into `[1, ATB_THRESHOLD]` after it is added, for the same termination reason
   * the authored value is: above the threshold a combatant banks two actions in one tick.
   */
  readonly haste?: number;
}

/**
 * What a party's own faction composition is worth.
 *
 * ## This is the pattern the project rules name and reject, overridden knowingly
 *
 * "+10% if two Fire units… those just create a new optimal team" is the thing a matchup
 * multiplier was chosen over, and this is that thing. The reason it survives in substance:
 * **a mono-faction bonus does not create one optimal team, it creates seven** — one per faction —
 * and which of them to bring is decided by the encounter's own matchup. That is still a statement
 * about the fight in front of you, which was the entire distinction the rule was drawing.
 *
 * Note what the player is *not* choosing between. They keep the top of the ladder and switch
 * which mono-faction team fields it; the lineup bonus and the matchup matrix are complementary,
 * not competing.
 *
 * ## Three mechanisms, and they stack
 *
 * - **The ladder** ({@link tiers}): shapes, not factions. Best-paying met rung wins.
 * - **The wildcard** ({@link wildcard}): a faction whose members count as any faction *on the
 *   ladder only*. It deliberately does not count towards {@link rally} or {@link ladder} — a
 *   wildcard that filled in everywhere would be strictly the best character in the game.
 * - **The rally** ({@link rally}) and **the ladder faction** ({@link ladder}): flat per-member
 *   tracks, paid to every ally, that add on top of whatever rung the composition reached.
 *
 * Every faction here is a plain string for the reason {@link CombatantData.faction} is: factions
 * are content, `data/` authors them, and `core/` only ever looks them up. A rule naming a faction
 * that does not exist simply never fires.
 */
export interface LineupRulesData {
  /**
   * The composition ladder, as shapes and their payouts.
   *
   * Order is presentation only. The resolver takes the **best-paying** rung a party qualifies
   * for — most attack, then most health — rather than the last one in the list, so a reordered
   * table cannot silently change what a party is worth.
   */
  readonly tiers: readonly LineupTierData[];
  /** Faction counting as any faction on {@link tiers}, and on nothing else. */
  readonly wildcard: string;
  /** A faction paying every ally a flat share per member fielded. */
  readonly rally: {
    readonly faction: string;
    /** Fractional points of `atk` per member. */
    readonly attack: number;
    /** Fractional points of `hp` per member. */
    readonly health: number;
  };
  /** A faction with a cumulative track of its own, stacking with everything above. */
  readonly ladder: {
    readonly faction: string;
    /** Step *n* is awarded for the *n*th member fielded. Steps past the party size never fire. */
    readonly steps: readonly LineupLadderStepData[];
  };
  /**
   * Health fraction below which a combatant counts as injured, for
   * {@link LineupLadderStepData.injuredEnergyRegen}.
   */
  readonly injuredBelow: number;
}

/** The lineup rules after clamping. Same shape; the guard is that it has been through `lineup.ts`. */
export interface LineupRules extends LineupRulesData {
  readonly tiers: readonly LineupTierData[];
  readonly ladder: {
    readonly faction: string;
    readonly steps: readonly LineupLadderStepData[];
  };
}

/**
 * What one party's composition resolved to, as numbers to fold into a stat block.
 *
 * Everything is **added from zero**, so a party that qualified for nothing is all zeroes and
 * "did anything apply" is a plain check rather than a comparison against 1.
 */
export interface LineupBonus {
  /** Fractional points on `atk`: `0.35` is ×1.35. */
  readonly attack: number;
  /** Fractional points on `hp`. */
  readonly health: number;
  /** Fractional points on `def`. */
  readonly defence: number;
  /** Points of `critChance`, before the `[0, 1]` clamp. */
  readonly critChance: number;
  /** Points of `critDamageAmp`. */
  readonly critDamageAmp: number;
  /** Points of `haste`, before the `[1, ATB_THRESHOLD]` re-clamp. */
  readonly haste: number;
  /**
   * Fractional points on `energyRegen`, applied **only while the combatant is injured**.
   *
   * The one field that cannot be folded into a stat block, because the condition is on current
   * health and a stat block is fixed for the fight.
   */
  readonly injuredEnergyRegen: number;
}

/** One faction, and how many of it a party actually fielded. */
export interface LineupFactionCount {
  readonly faction: string;
  readonly count: number;
}

/** Which rung a party reached, and on whom. Everything a screen needs to explain the bonus. */
export interface LineupTierMatch {
  /** The faction the rung resolved on, wildcards included. */
  readonly faction: string;
  /** How many count as it. */
  readonly count: number;
  /** The second faction of a split rung, or `null` on a mono rung. */
  readonly secondFaction: string | null;
  readonly secondCount: number;
  readonly attack: number;
  readonly health: number;
}

/**
 * A resolved composition: the numbers, and enough of the reasoning to put on a screen.
 *
 * The simulation reads {@link bonus} and nothing else. The rest exists because "+15% attack" with
 * no explanation is a number a player cannot chase — a formation screen has to be able to say
 * *four Undead*, which is the decision the bonus is trying to provoke.
 */
export interface LineupSummary {
  readonly bonus: LineupBonus;
  /** The best-paying rung met, or `null` when the composition reached none. */
  readonly tier: LineupTierMatch | null;
  /**
   * What was actually fielded, per faction, in the order the factions were fielded.
   *
   * **Not the same numbers as {@link tier}, and the difference is the point.** A rung counts a
   * wildcard as the faction it stood in for, so three Demons and two Angels reach `Demons ×5`
   * while this still reports three Demons and two Angels — and the Demon track pays three rungs,
   * because it counts real members. A screen that had only the rung to work from would have to
   * present a bonus it could not attribute.
   */
  readonly counts: readonly LineupFactionCount[];
  /** Members of {@link LineupRulesData.rally} fielded. */
  readonly rallyCount: number;
  /** Members of {@link LineupRulesData.ladder} fielded. */
  readonly ladderCount: number;
}

/**
 * What fighting is worth in energy.
 *
 * The half of the meter that is the same for everybody. A character's own contribution is
 * {@link StatBlockData.energyRegen}; this is what the fight itself pays, and it is why a
 * combatant nobody is hitting and who is hitting nobody charges slowly however it was authored.
 *
 * All three are **flat points, not fractions of anything**. A gain proportional to damage dealt
 * would read as fair and would quietly stop working: milestone 10 aims at health bars around
 * ×10⁹, and any quantity compared against a scaling one becomes a no-op or a landslide. Points
 * against a fixed bar survive a rescale untouched — the same reasoning that keeps `haste`
 * bounded and `recovery` scaling.
 */
export interface EnergyRulesData {
  /**
   * Awarded to the actor **once per action** in which at least one damaging hit landed.
   *
   * Once per action rather than once per hit, because per hit would make a row nuke charge its
   * own caster five times over and turn every wide ultimate into an engine that refuels itself.
   */
  readonly onHit: number;
  /**
   * Awarded to a combatant for **each** damaging hit it takes.
   *
   * Per hit rather than per action, and the asymmetry with {@link onHit} is deliberate: being
   * focused is what should charge a bar fastest, and a wide attack genuinely does hit five
   * separate people. It is also what gives the Undead their meter — the faction with the largest
   * pools and almost no armour is the faction that gets hit.
   */
  readonly onHurt: number;
  /**
   * Awarded to the actor **once per action** in which it healed somebody else.
   *
   * Somebody else, on the same reasoning as `receivedHealing`: a life leech and the natural
   * recovery at the top of a turn are a combatant healing itself, and paying energy for those
   * would charge every bruiser in the game for standing still.
   */
  readonly onHeal: number;
}

/**
 * The energy gains after clamping.
 *
 * Structurally identical to {@link EnergyRulesData} — every field there is already required — and
 * named separately for the same reason {@link CombatRules} is: the two sit either side of the
 * parse in `energy.ts`, and a signature saying which one it takes says whether it has been
 * clamped yet.
 */
export type EnergyRules = EnergyRulesData;

/**
 * Everything about combat that is a balance number rather than a rule.
 *
 * Passed into the simulation rather than imported, for the reason everything else in this
 * file is: `core/` cannot see `data/`, and a balance sweep wants to drive the whole thing
 * from fixtures.
 */
export interface CombatRulesData {
  readonly rows: RowBonusData;
  readonly matchups: readonly FactionMatchupData[];
  /**
   * The curve both sides of the board climb.
   *
   * The same table `ui/` scales the party with, arriving here because the simulation resolves the
   * *enemy* side itself — a stage authors archetypes and a level, and nothing outside `core/`
   * should be able to hand it a formation scaled to the wrong one. Milestone 9 made the same
   * argument about a character's effective level and answered it the other way, with a required
   * parameter; the difference is that a party is assembled by the caller and an encounter is not.
   *
   * It sits in the rules rather than in a sixth parameter because it is exactly what this
   * interface is for: a balance number, authored in `data/`, that combat reads and never decides.
   */
  readonly growth: GrowthData;
  /**
   * What a **party's own** composition is worth.
   *
   * Applied to the player's side alone — see `buildSide` in `simulate.ts` for why an enemy
   * formation deliberately does not get one.
   */
  readonly lineup: LineupRulesData;
  readonly energy: EnergyRulesData;
  /**
   * Floor under any attack's hit chance.
   *
   * A termination guard before it is a balance lever. The simulation's promise that a battle
   * always ends rests on damage landing eventually; without a floor, a stacked dodge pool
   * could make a combatant unhittable, and every fight against it would be decided by the clock
   * rather than by either side.
   */
  readonly minHitChance: number;
  /** Ceiling on penetration, so a defensive stat can never be erased outright. */
  readonly maxPenetration: number;
  /**
   * Ceiling on `physicalResist` and `magicResist`.
   *
   * ⚠️ A termination guard, not a balance knob. A resist reaching 1 is a combatant nothing can
   * damage, and a fight nobody can win runs to the tick cap — the same failure the hit-chance
   * floor and the penetration cap exist to prevent, arriving by a third route.
   */
  readonly maxResist: number;
  /** The attack used by any combatant that does not author its own. */
  readonly basicAttack: SkillData;
}

/**
 * How a stage sits in its chapter's rhythm.
 *
 * Lives here beside the rest of the stage vocabulary rather than in `core/ladder.ts`, which is
 * where the *rule* that decides it lives — `stageKindAt`. Putting the type there and the stage
 * here would make the two files import each other for nothing.
 */
export type StageKind =
  /** An ordinary stage. */
  | 'normal'
  /** Every tenth stage of a chapter. */
  | 'mini-boss'
  /** The last stage of a chapter. */
  | 'boss';

/**
 * A stage as authored in `data/`: one encounter, and how hard it is.
 *
 * **What is authored is the fight, and nothing about the payout.** Since milestone 11 the rates,
 * the lump and the first-clear crystals are a function of where the stage sits on the ladder —
 * see `core/ladder.ts` — so a stage is a line naming archetypes and a number, which is what makes
 * a hundred of them an afternoon rather than a career. `resolveStage` turns one of these into the
 * {@link StageData} the simulation takes.
 */
export interface StageEncounterData {
  readonly id: string;
  readonly name: string;
  /** The opposing side, in two rows. Repeating an archetype gives multiple copies. */
  readonly enemies: EnemyFormationData;
  /**
   * The level every enemy in this encounter fights at.
   *
   * **The stage's difficulty dial, and since milestone 10 very nearly the whole of it.** An
   * archetype is authored once at level 1 and fielded wherever it is wanted; what makes stage 19
   * harder than stage 6 is this number, not a second, bigger stat block. That is what lets a lock
   * stay a lock — a Marsh Acolyte at the level of the party in front of it is the same question
   * it was two hundred stages ago — and it is what makes a hand-authored ladder of hundreds of
   * stages an afternoon's work rather than a career.
   *
   * Read it as roughly **the level of the party the stage was tuned for**, running somewhat above
   * it. Both sides climb the same curve, so scaling them together leaves a fight identical; what
   * the enemy side does not have is ascension rungs, and the player's have to be absorbed
   * somewhere. In the shipped ladder that is worth about a third — stage 12 is level 40 against a
   * party at level 40 with one rung, stage 24 is level 126 against level 90 with four.
   *
   * A reading aid rather than an invariant. Nothing enforces it, and a stage is free to be tuned
   * wherever the sweep says it lands.
   */
  readonly level: number;
}

/**
 * An encounter, resolved against its place on the ladder: what the simulation is handed.
 *
 * The three payout fields are **derived, not authored** — `resolveStage` evaluates them from the
 * stage's linear index and the reward curve in `data/`. They stay on this interface rather than
 * being passed alongside it because `simulateBattle` builds a {@link BattleReward} out of them,
 * and a fight that had to be told separately what it was worth would be one more thing a caller
 * could get out of step.
 */
export interface StageData extends StageEncounterData {
  /**
   * Whether this is an ordinary stage, a mini-boss, or its chapter's boss.
   *
   * A rule rather than an authored field: every tenth stage of a chapter is a mini-boss and the
   * last one is a boss, so the rhythm is the same in a fifty-stage chapter and a two-hundred
   * stage one. What `data/` authors is a line-up worthy of the slot it lands in, and
   * `chapters.spec.ts` is what checks it did.
   */
  readonly kind: StageKind;
  /** One-off payout for the clear, every time it is cleared. */
  readonly reward: AuthoredCurrencies;
  /**
   * Idle income the run is raised to by clearing this stage, per second.
   *
   * The real prize. A run starts at zero on every currency and earns nothing while idle, so the
   * first stage is what switches the idle game on, and every stage after it is a permanent
   * raise. The one-off {@link reward} is the smaller half of the deal on purpose — a rate
   * compounds with time away, a lump sum does not.
   */
  readonly rates: AuthoredCurrencies;
  /**
   * Extra summon crystals paid the **first** time this stage is cleared, and never again.
   *
   * The one reward in the game tied to progress rather than to patience. It exists so that
   * pushing the ladder is worth something immediately, and it is deliberately additive to the
   * idle crystal rate rather than a replacement for it: a player stuck on a stage keeps earning
   * pulls, which is the opposite of how a paid game would tune this.
   */
  readonly firstClearSummons?: AuthoredAmount;
}

/** A stat block after parsing and clamping, as the simulation uses it. */
export interface CombatStats {
  readonly hp: Numeric;
  readonly atk: Numeric;
  readonly def: Numeric;
  /** Health restored at the top of each own turn, before {@link healthRegen}. */
  readonly recovery: Numeric;
  /** Guaranteed to be in `[1, ATB_THRESHOLD]`, so nobody is ever stuck and nobody ever
   * banks two actions in a single tick. */
  readonly haste: number;
  /** Guaranteed to be in `[0, ATB_THRESHOLD]`. Folded into the gauge and re-clamped with
   * {@link haste}, so the pair can never breach the scheduling bound between them. */
  readonly attackSpeed: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly critChance: number;
  /** Guaranteed to be non-negative, so a "critical" hit never reduces damage. */
  readonly critDamageAmp: number;
  /** Guaranteed to be non-negative. */
  readonly critDamageResist: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly critBlock: number;
  /** Guaranteed to be in `[0, MAX_ENERGY]`. Zero means this combatant charges only by fighting. */
  readonly energyRegen: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly lifeLeech: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly insight: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly tenacity: number;
  /** Guaranteed to be in `[0, MAX_PENETRATION]`. */
  readonly physicalPierce: number;
  /** Guaranteed to be in `[0, MAX_PENETRATION]`. */
  readonly magicPierce: number;
  /** Guaranteed to be in `[0, MAX_RESIST]`, so damage is never reduced to nothing. */
  readonly physicalResist: number;
  /** Guaranteed to be in `[0, MAX_RESIST]`, for the same reason. */
  readonly magicResist: number;
  /** Guaranteed to be non-negative. */
  readonly healthRegen: number;
  /** Guaranteed to be non-negative. */
  readonly receivedHealing: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly dodge: number;
  /** Guaranteed to be in `[0, MAX_ACCURACY]`, so accuracy can out-run a dodge stack. */
  readonly accuracy: number;
}

/** A skill after parsing, ready to be used. */
export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly target: SkillTarget;
  readonly effects: readonly SkillEffectData[];
  /** Metered by a full energy bar rather than by {@link cooldown}. Never both. */
  readonly ultimate: boolean;
  readonly cooldown: number;
  readonly condition: SkillConditionData;
  readonly priority: number;
}

/** A combatant after parsing, ready to be placed in a battle. */
export interface Combatant {
  readonly id: string;
  readonly name: string;
  readonly faction: string;
  readonly stats: CombatStats;
  readonly basic: Skill;
  /** Sorted by descending priority, so selection is a linear scan. */
  readonly skills: readonly Skill[];
  /**
   * Statuses this combatant starts the fight already carrying.
   *
   * Carried through **unparsed**, unlike every other field here, and the asymmetry is deliberate:
   * a status is parsed by `toActiveStatus` at the moment it is applied, against the stats of
   * whoever applied it. Parsing it here would mean doing it twice, or doing it against stats that
   * have not had the row bonus applied yet.
   */
  readonly opening: readonly StatusData[];
}

/** The combat rules, with the matchup matrix resolved for lookup. */
export interface CombatRules {
  readonly rows: RowBonusData;
  /** Keyed `attacker>defender`. A missing pair is neutral. */
  readonly matchups: ReadonlyMap<string, number>;
  readonly lineup: LineupRules;
  readonly energy: EnergyRules;
  /** Carried through unparsed: {@link growthAt} guards its own coefficients. */
  readonly growth: GrowthData;
  readonly minHitChance: number;
  readonly maxPenetration: number;
  readonly maxResist: number;
  readonly basicAttack: Skill;
}

/** A status as it exists on a combatant mid-battle. */
export interface ActiveStatus {
  readonly id: string;
  readonly name: string;
  readonly kind: StatusData['kind'];
  readonly hostile: boolean;
  /** Absolute battle tick at which this stops applying. */
  readonly expiresAt: number;
  readonly stat?: ModifiableStat;
  readonly multiplier?: number;
  readonly damageType?: DamageType;
  /**
   * The resolved quantity, fixed when the status was applied.
   *
   * Snapshotted rather than recomputed per tick because the applier can die before the status
   * expires — a poison that stopped hurting the moment its caster fell would make killing the
   * debuffer the answer to every debuff, which is the same lock twice over. For a shield this
   * is the remaining absorb pool, and is the one field that changes after application.
   */
  readonly amount?: Numeric;
}

/**
 * One combatant's state at a moment in the battle.
 *
 * `BattleResult` carries these twice — once as the opening line-up and once as the final
 * standings — which together with the event log is everything the UI needs to replay the
 * fight without re-running the simulation.
 */
export interface CombatantSnapshot {
  /**
   * Unique within the battle (`ally-0`, `enemy-2`). Events reference combatants by this
   * rather than by name, so two copies of the same enemy stay distinguishable.
   */
  readonly key: string;
  readonly side: Side;
  readonly row: Row;
  /** Slot within its own side, front row first, in the order the side was supplied. */
  readonly slot: number;
  /** The `data/` id this was built from. Several fighters can share one. */
  readonly defId: string;
  /** Display name, numbered when a side holds more than one of the same definition. */
  readonly name: string;
  readonly faction: string;
  readonly maxHp: Numeric;
  readonly hp: Numeric;
  /** Current energy, in `[0, MAX_ENERGY]`. The bar's maximum is universal, so it is not carried. */
  readonly energy: number;
  /**
   * Whether this combatant has an ultimate at all.
   *
   * Carried rather than inferred because the snapshot is the whole of what the UI gets, and a
   * combatant with no ultimate has a bar that can fill and can never be spent — which is a
   * meter the player should not be shown. Every combatant has energy; not everything has
   * something to do with it.
   */
  readonly ultimate: boolean;
  /** Current gauge fill per tick: haste, plus attack speed when the last action was a swing. */
  readonly haste: number;
  /** Remaining absorb pool across every active shield. Zero when unshielded. */
  readonly shield: Numeric;
  readonly statuses: readonly ActiveStatus[];
}

/**
 * How a fight ended, as the player reads it. **Two answers, not three.**
 *
 * There was a `stalemate` here until the battle timer landed. It meant "neither side could finish
 * inside the tick cap", which was a true statement about the simulation and a useless one to the
 * player: they did not clear the stage, they were paid nothing, and auto-battle stopped — which is
 * a defeat wearing a word that suggested otherwise. Running the clock out is now losing, so it is
 * reported as losing.
 *
 * **The distinction did not disappear, it moved to {@link BattleResult.timedOut}**, which is where
 * it was always more useful. A timeout is a fact about the fight, not an outcome of it: the balance
 * sweep needs it to catch an over-tuned sustain kit, and nothing on screen needs it at all.
 */
export type BattleOutcome = 'victory' | 'defeat';

/**
 * A single thing that happened, tagged with the battle tick it happened on.
 *
 * The log is the entire interface between the simulation and the presentation layer. It is
 * append-only, ordered, and complete: applying every event in sequence to the opening
 * line-up reproduces the final standings exactly. That completeness is why status expiry and
 * turn starts are events too — without them the animator would have to re-derive state the
 * simulation already knew, which is a second implementation of combat by another name.
 */
export type BattleEvent =
  /**
   * A combatant's turn begins. Carries energy after regeneration, which is the only place the
   * drip half of the meter moves, so an animator never has to model regen itself.
   */
  | {
      readonly kind: 'turn';
      readonly tick: number;
      readonly combatant: string;
      readonly energy: number;
    }
  /**
   * A skill above the basic attack is used.
   *
   * Carries the caster's energy **after** the cost is paid, so an ultimate reads as a bar
   * emptying rather than as a bar the animator has to know to clear. An ordinary skill carries
   * it unchanged, which costs one number and saves the reader a rule.
   */
  | {
      readonly kind: 'cast';
      readonly tick: number;
      readonly source: string;
      readonly skillId: string;
      readonly skillName: string;
      readonly energy: number;
    }
  /**
   * A damaging hit that landed.
   *
   * Carries **both** sides' energy, because one hit moves both meters — the attacker's for
   * landing it and the target's for taking it. Two numbers on the event that already exists
   * rather than a fifteenth event kind: the log's promise is that replaying it reproduces the
   * final standings, and an animator that had to correlate a separate energy event with the hit
   * that caused it would be re-deriving state the simulation already knew.
   */
  | {
      readonly kind: 'attack';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
      readonly damageType: DamageType;
      /** Damage that reached HP, after any shield absorbed its share. */
      readonly damage: Numeric;
      /** Damage swallowed by a shield rather than taken. */
      readonly absorbed: Numeric;
      readonly crit: boolean;
      /** The target's remaining HP after the hit, so a replay never recomputes damage. */
      readonly targetHp: Numeric;
      /** The attacker's energy after being credited for landing this hit. */
      readonly sourceEnergy: number;
      /** The target's energy after being credited for taking it. */
      readonly targetEnergy: number;
    }
  | {
      readonly kind: 'miss';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
    }
  /**
   * Health restored. Covers a healing skill, a life leech, and the natural recovery at the top
   * of a turn — the last two arriving with the actor as its own source.
   */
  | {
      readonly kind: 'heal';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
      readonly amount: Numeric;
      readonly targetHp: Numeric;
      /**
       * The healer's energy afterwards. Unchanged when it healed itself, which is the same line
       * `receivedHealing` draws and for the same reason.
       */
      readonly sourceEnergy: number;
    }
  | {
      readonly kind: 'status';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
      readonly status: ActiveStatus;
    }
  | {
      readonly kind: 'status-resisted';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
      readonly statusId: string;
      readonly statusName: string;
    }
  | {
      readonly kind: 'status-expired';
      readonly tick: number;
      readonly target: string;
      readonly statusId: string;
      readonly statusName: string;
    }
  | {
      readonly kind: 'cleanse';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
      /**
       * The ids that were removed, not merely how many.
       *
       * The log's promise is that replaying it reproduces the final standings, and a count
       * cannot do that: an animator holding two debuffs and told "one was removed" has to guess
       * which badge to drop, and from then on its board and the simulation disagree.
       */
      readonly removed: readonly string[];
    }
  /** A damage-over-time status landing on its host's turn. */
  | {
      readonly kind: 'tick-damage';
      readonly tick: number;
      readonly target: string;
      readonly statusId: string;
      readonly statusName: string;
      /** Damage that reached HP, after any shield absorbed its share. */
      readonly damage: Numeric;
      /**
       * Damage swallowed by a shield rather than taken.
       *
       * Carried for the same reason the `attack` event carries it: a poison ticking against a
       * barrier drains the barrier, and an event that reported only the HP it failed to remove
       * would leave the animator's shield full while the simulation's emptied.
       */
      readonly absorbed: Numeric;
      readonly targetHp: Numeric;
    }
  /** A regeneration status landing on its host's turn. */
  | {
      readonly kind: 'tick-heal';
      readonly tick: number;
      readonly target: string;
      readonly statusId: string;
      readonly statusName: string;
      readonly amount: Numeric;
      readonly targetHp: Numeric;
    }
  /** A turn spent stunned. The gauge is still consumed, which is what bounds a stun lock. */
  | { readonly kind: 'stunned'; readonly tick: number; readonly combatant: string }
  | { readonly kind: 'defeat'; readonly tick: number; readonly combatant: string }
  | { readonly kind: 'end'; readonly tick: number; readonly outcome: BattleOutcome };

/** What clearing a stage pays. Empty on anything but a victory. */
export interface BattleReward {
  /** One-off amounts banked for the clear. */
  readonly gained: CurrencyAmounts;
  /**
   * Idle income the run is raised to. Never lowers an existing rate — see `applyBattleResult`.
   */
  readonly rates: Readonly<Partial<Rates>>;
  /**
   * Summon crystals owed if this is the first time the stage has been cleared.
   *
   * Carried unconditionally on a victory and spent conditionally by `applyBattleResult`, which
   * is the only place that can see `clearedStages`. The simulation resolves a fight; whether
   * the run has been here before is not its business.
   */
  readonly firstClearSummons: Numeric;
}

/**
 * A fully resolved battle.
 *
 * Produced synchronously and in full. The UI animates {@link events} afterwards; it never
 * drives the fight, which is what makes playback speed and skipping free.
 */
export interface BattleResult {
  readonly stageId: string;
  readonly outcome: BattleOutcome;
  /**
   * Whether the fight ended because the ninety-second timer ran out rather than because a side
   * died. Always paired with a `defeat` outcome — see {@link BattleOutcome}.
   *
   * ⚠️ **This is the successor to the zero-stalemates balance assertion**, and it carries that
   * job alone now that a timeout is indistinguishable on screen from being killed. Milestone 8b
   * deleted the MP pool that guaranteed a fight against a healer resolves; the sweep in
   * `data/stages.balance.ts` is what replaced it, and this flag is what the sweep reads. A kit
   * that out-sustains the ladder shows up here or nowhere.
   *
   * Nothing in `ui/` reads it. A player who ran out of time lost, and the reason is a tuning
   * question rather than something to explain on a results screen.
   */
  readonly timedOut: boolean;
  /** Battle ticks elapsed. */
  readonly ticks: number;
  /** Game milliseconds the fight represents. Used for display and for balance sweeps. */
  readonly durationMs: number;
  /** The opening line-up, both sides, at full HP. */
  readonly roster: readonly CombatantSnapshot[];
  /** The final standings, both sides. Allies at 0 HP lost; survivors are above 0. */
  readonly final: readonly CombatantSnapshot[];
  readonly events: readonly BattleEvent[];
  readonly reward: BattleReward;
}

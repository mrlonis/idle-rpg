import { type CurrencyAmounts, type Rates } from '../currency';
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
 * Deliberately only the five that are multiplied into a damage or scheduling calculation.
 * Crit chance, lifesteal and the accuracy pair are excluded because a multiplier on a
 * probability is far harder to read than one on a quantity, and because a stacking crit buff
 * is the fastest route to a fight decided entirely by one lucky opening turn.
 */
export type ModifiableStat = 'patk' | 'matk' | 'pdef' | 'mdef' | 'spd';

/**
 * The plain stat block authored in `data/`.
 *
 * The eight required fields are what a combatant **is**. The rest default to nothing (or, for
 * {@link accuracy}, to certainty), so a stat block only mentions a stat when that stat is part
 * of the character's identity — a Dwarf does not need to declare `armorPen: 0` to say it is
 * not a shredder.
 */
export interface StatBlockData {
  readonly hp: number | string;
  /** Physical attack. Basic attacks are physical for everybody; skills declare their own type. */
  readonly patk: number | string;
  readonly matk: number | string;
  readonly pdef: number | string;
  readonly mdef: number | string;
  /**
   * ATB gauge gained per battle tick. A plain `number` because it is bounded — speed is a
   * scheduling weight, not a quantity that grows exponentially, and the simulation relies on
   * it staying at or below `ATB_THRESHOLD`.
   */
  readonly spd: number;
  /** Probability of a critical hit, 0–1. */
  readonly critChance: number;
  /** Damage multiplier on a critical hit. */
  readonly critMultiplier: number;

  /**
   * Maximum skill points. Absent or zero means this combatant pays no MP at all.
   *
   * Not every kit is metered the same way, and that is the point: a cooldown-only kit is
   * always available and therefore has to be individually weaker, an MP kit front-loads and
   * then runs dry, and an HP-cost kit converts its own life into tempo. A healer's pool is
   * finite on purpose — it is what guarantees a fight against one resolves rather than
   * grinding against a heal that never stops.
   *
   * A plain `number`, and deliberately unscaled: MP is a budget measured against authored
   * skill costs, so growing it with level would quietly delete the metering.
   */
  readonly mp?: number;
  /** MP regained at the start of each of this combatant's own turns. */
  readonly mpRegen?: number;
  /** Fraction of damage dealt returned to the attacker as healing, 0–1. */
  readonly lifesteal?: number;
  /** Added to a status effect's authored application chance when this combatant applies it. */
  readonly effectHit?: number;
  /** Subtracted from a status effect's application chance when this combatant is the target. */
  readonly tenacity?: number;
  /** Fraction of the target's `pdef` ignored. */
  readonly armorPen?: number;
  /** Fraction of the target's `mdef` ignored. */
  readonly magicPen?: number;
  /** Subtracted from an incoming attack's hit chance. */
  readonly dodge?: number;
  /** Base hit chance before the target's dodge. Absent means 1 — a certain hit. */
  readonly accuracy?: number;
}

/** How a skill is paid for. */
export type SkillCostKind =
  /** Free. Metered by its cooldown alone, which is why such skills are individually weaker. */
  | 'none'
  | 'mp'
  /** Paid in the caster's own HP, and never lethal — see `payCost` in `skills.ts`. */
  | 'hp';

/** What a skill costs to use. */
export interface SkillCostData {
  readonly kind: SkillCostKind;
  /** Ignored when `kind` is `none`. */
  readonly amount?: number;
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
      /** Fraction of the applier's matching attack stat dealt on each affected turn. */
      readonly power: number;
    }
  | {
      readonly kind: 'regen';
      readonly id: string;
      readonly name: string;
      readonly hostile: false;
      readonly duration: number;
      /** Fraction of the applier's `matk` healed on each affected turn. */
      readonly power: number;
    }
  | {
      readonly kind: 'shield';
      readonly id: string;
      readonly name: string;
      readonly hostile: false;
      readonly duration: number;
      /** Fraction of the applier's `matk` banked as an absorb pool. */
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
  readonly cost?: SkillCostData;
  /**
   * Battle ticks before this skill can be used again, counted from the turn it was used.
   *
   * Absent means no cooldown, which is only sane on a skill that costs something.
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
   * Physical for everybody is deliberate. It is what makes the back row's offensive bonus a
   * real choice for a caster — the bonus lands on `matk`, which only the skills use, so a
   * mage that spends most of its turns swinging gets far less out of the back row than its
   * stat sheet suggests.
   */
  readonly basic?: SkillData;
  /** Everything above the basic attack, in any order; parsing sorts them by priority. */
  readonly skills?: readonly SkillData[];
}

/** One side's line-up, in two rows. */
export interface FormationData {
  readonly front: readonly CombatantData[];
  readonly back: readonly CombatantData[];
}

/** A quantity as authored in `data/`, before it becomes a `Numeric`. */
export type AuthoredAmount = number | string;

/** Per-currency quantities as authored in `data/`. Absent keys mean zero. */
export interface AuthoredCurrencies {
  readonly gold?: AuthoredAmount;
  readonly xp?: AuthoredAmount;
  readonly essence?: AuthoredAmount;
  readonly summons?: AuthoredAmount;
}

/** One faction's edge over another, as authored in `data/`. */
export interface FactionMatchupData {
  readonly attacker: string;
  readonly defender: string;
  /** Damage multiplier applied when `attacker` hits `defender`. */
  readonly multiplier: number;
}

/** What standing in each row is worth. */
export interface RowBonusData {
  /** Multiplier on **both** defences for a front-row combatant. */
  readonly frontDefence: number;
  /**
   * Multiplier on a back-row combatant's **higher** offensive stat, and only that one.
   *
   * Not a flat attack bonus. A mage in the back row gets the whole of it on `matk` and none
   * of it on the physical basic attack it spends most of its turns using; a bruiser gets it
   * on `patk` and nothing on the spells it does not have. The bonus therefore rewards putting
   * a character where its damage actually comes from, rather than rewarding the back row.
   */
  readonly backOffence: number;
}

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
   * Floor under any attack's hit chance.
   *
   * A termination guard before it is a balance lever. The simulation's promise that a battle
   * always ends rests on damage landing eventually; without a floor, a stacked dodge pool
   * could make a combatant unhittable and turn every fight against it into a stalemate.
   */
  readonly minHitChance: number;
  /** Ceiling on penetration, so a defensive stat can never be erased outright. */
  readonly maxPenetration: number;
  /** The attack used by any combatant that does not author its own. */
  readonly basicAttack: SkillData;
}

/** A stage as authored in `data/`: one encounter, plus what clearing it pays. */
export interface StageData {
  readonly id: string;
  readonly name: string;
  /** The opposing side, in two rows. Repeating a combatant gives multiple copies. */
  readonly enemies: FormationData;
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
  readonly patk: Numeric;
  readonly matk: Numeric;
  readonly pdef: Numeric;
  readonly mdef: Numeric;
  /** Guaranteed to be in `[1, ATB_THRESHOLD]`, so nobody is ever stuck and nobody ever
   * banks two actions in a single tick. */
  readonly spd: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly critChance: number;
  /** Guaranteed to be at least 1, so a "critical" hit never reduces damage. */
  readonly critMultiplier: number;
  /** Guaranteed to be a non-negative integer. Zero means this combatant pays no MP. */
  readonly mp: number;
  /** Guaranteed to be a non-negative integer. */
  readonly mpRegen: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly lifesteal: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly effectHit: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly tenacity: number;
  /** Guaranteed to be in `[0, MAX_PENETRATION]`. */
  readonly armorPen: number;
  /** Guaranteed to be in `[0, MAX_PENETRATION]`. */
  readonly magicPen: number;
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
  readonly costKind: SkillCostKind;
  readonly costAmount: number;
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
}

/** The combat rules, with the matchup matrix resolved for lookup. */
export interface CombatRules {
  readonly rows: RowBonusData;
  /** Keyed `attacker>defender`. A missing pair is neutral. */
  readonly matchups: ReadonlyMap<string, number>;
  readonly minHitChance: number;
  readonly maxPenetration: number;
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
  readonly maxMp: number;
  readonly mp: number;
  readonly spd: number;
  /** Remaining absorb pool across every active shield. Zero when unshielded. */
  readonly shield: Numeric;
  readonly statuses: readonly ActiveStatus[];
}

export type BattleOutcome = 'victory' | 'defeat' | 'stalemate';

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
   * A combatant's turn begins. Carries MP after regeneration, which is the only place it
   * moves up, so an animator never has to model regen itself.
   */
  | {
      readonly kind: 'turn';
      readonly tick: number;
      readonly combatant: string;
      readonly mp: number;
    }
  /**
   * A skill above the basic attack is used.
   *
   * Carries both of the caster's resources **after** the cost is paid, because a skill can be
   * priced in either. An HP-cost kit that moved its own health with no event to show for it
   * would leave the animator's board disagreeing with the simulation for the rest of the
   * fight.
   */
  | {
      readonly kind: 'cast';
      readonly tick: number;
      readonly source: string;
      readonly skillId: string;
      readonly skillName: string;
      readonly mp: number;
      readonly hp: Numeric;
    }
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
    }
  | {
      readonly kind: 'miss';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
    }
  | {
      readonly kind: 'heal';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
      readonly amount: Numeric;
      readonly targetHp: Numeric;
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
  /** Battle ticks elapsed. */
  readonly ticks: number;
  /** Game milliseconds the fight represents — the raw material for `timeToClear`. */
  readonly durationMs: number;
  /** The opening line-up, both sides, at full HP. */
  readonly roster: readonly CombatantSnapshot[];
  /** The final standings, both sides. Allies at 0 HP lost; survivors are above 0. */
  readonly final: readonly CombatantSnapshot[];
  readonly events: readonly BattleEvent[];
  readonly reward: BattleReward;
}

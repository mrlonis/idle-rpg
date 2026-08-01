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

/** The plain stat block authored in `data/`. */
export interface StatBlockData {
  readonly hp: number | string;
  readonly atk: number | string;
  readonly def: number | string;
  /**
   * ATB gauge gained per battle tick. A plain `number` because it is bounded — speed is a
   * scheduling weight, not a quantity that grows exponentially, and the simulation relies on
   * it staying at or below `ATB_THRESHOLD`.
   */
  readonly spd: number;
  /** Probability of a critical hit, 0–1. The only thing combat draws RNG for. */
  readonly critChance: number;
  /** Damage multiplier on a critical hit. */
  readonly critMultiplier: number;
}

/** A character or enemy as authored in `data/`. */
export interface CombatantData {
  readonly id: string;
  readonly name: string;
  readonly stats: StatBlockData;
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

/** A stage as authored in `data/`: one encounter, plus what clearing it pays. */
export interface StageData {
  readonly id: string;
  readonly name: string;
  /** The opposing side, in slot order. Repeating a combatant gives multiple copies. */
  readonly enemies: readonly CombatantData[];
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
  /** Guaranteed to be in `[1, ATB_THRESHOLD]`, so nobody is ever stuck and nobody ever
   * banks two actions in a single tick. */
  readonly spd: number;
  /** Guaranteed to be in `[0, 1]`. */
  readonly critChance: number;
  /** Guaranteed to be at least 1, so a "critical" hit never reduces damage. */
  readonly critMultiplier: number;
}

/** A combatant after parsing, ready to be placed in a battle. */
export interface Combatant {
  readonly id: string;
  readonly name: string;
  readonly stats: CombatStats;
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
  /** Slot within its own side, in the order the side was supplied. */
  readonly slot: number;
  /** The `data/` id this was built from. Several fighters can share one. */
  readonly defId: string;
  /** Display name, numbered when a side holds more than one of the same definition. */
  readonly name: string;
  readonly maxHp: Numeric;
  readonly hp: Numeric;
  readonly spd: number;
}

export type BattleOutcome = 'victory' | 'defeat' | 'stalemate';

/**
 * A single thing that happened, tagged with the battle tick it happened on.
 *
 * The log is the entire interface between the simulation and the presentation layer. It is
 * append-only, ordered, and complete: applying every event in sequence to the opening
 * line-up reproduces the final standings exactly.
 */
export type BattleEvent =
  | {
      readonly kind: 'attack';
      readonly tick: number;
      readonly source: string;
      readonly target: string;
      readonly damage: Numeric;
      readonly crit: boolean;
      /** The target's remaining HP after the hit, so a replay never recomputes damage. */
      readonly targetHp: Numeric;
    }
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

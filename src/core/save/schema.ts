/**
 * The on-disk save shape.
 *
 * JSON-safe: `Numeric` values are stored as exponential-notation strings, which round-trip
 * exactly and stay readable when inspecting a save from a bug report.
 *
 * ## There is one shape here, and it has been re-based to one four times
 *
 * The first re-base folded five pre-release shapes — the gold counter, combat progression, the
 * keyed wallet and roster, the two ranks, and chapters — into a v0 baseline. Six more accumulated
 * on top of it: gear (`alloy`, the loadouts, the bag, the mint counter and the shop ledger), the
 * ladder gaining a bottom (no field, only a change in what `roster[].rarity` denotes), the
 * achievement ledger, the quest windows, the bounty board and the legendary pity counter. **All six
 * were folded back into this one shape**, on the argument that licenses every re-base and nothing
 * else: nobody outside development has ever loaded a save written by any of them.
 * [saves](../../../docs/saves.md) records the reset and the condition that closes the door on doing
 * it again.
 *
 * The third re-base is milestone 16's, and it is the smallest: `wallet.emblem`, `rates.emblem` and
 * `roster[].signature`. Three fields, all of which default correctly to zero — an emblem balance
 * nobody has earned and a signature item nobody has unlocked — so the migration it did not need
 * would have been three assignments of the value the decoder already produces for a missing key.
 * It rides on the same licence as the other two, and it is worth naming that this is the **least**
 * defensible use of that licence precisely because it was the cheapest: a version bump here would
 * have cost almost nothing, and the reason not to take it is consistency with a chain that is
 * still empty rather than any property of these three fields.
 *
 * The fourth is milestone 22's, and it is two fields: `descent` and `descentRuns`. Both default
 * correctly to the value the decoder already produces for a missing key — no run in flight, and no
 * runs finished — so the migration they did not need would again have been assignments of nothing.
 * It rides on the same licence as the other three, because the licence is a fact about the audience
 * rather than about the fields.
 *
 * The fifth is milestone 23's, and it is two fields again: `expedition` and `expeditions`. Both
 * default to nothing — no attempt in flight, no map ever touched. ⚠️ **The fourth re-base called
 * itself the last, and the premise it rested on moved rather than the rule**: it reasoned from
 * milestone 22 being the roadmap's last numbered system, and milestone 23 — written down as the one
 * a solo developer might decide not to want — was then built, still before any build has reached a
 * player. The licence is unchanged and still honest; the lesson is that "this is the last one" is a
 * claim about the roadmap, and the roadmap is softer than the rule. What actually closes this door
 * is a player loading a save, and nothing else ever will.
 *
 * **From here the old rule applies without exception: never edit or delete a shipped shape.** A
 * migration is written against the shape that existed when it was authored, and changing one
 * retroactively invalidates every migration downstream of it.
 *
 * ⚠️ **The next version is 1, and it is permanent.** The one thing the four re-bases have in common
 * is that none had an audience; the moment one exists, this file grows an interface rather than
 * gaining a field.
 *
 * **Every gear field is typed as loosely here as JSON allows** — `slot` and `archetype` are plain
 * `string`, `grade` a plain `number` — and that is on purpose rather than laziness. A shipped
 * schema describes bytes that exist on devices, and typing it against the runtime unions would tie
 * it to content: re-authoring the archetype list would change what this shape *means* for saves
 * written before the change, which is the exact failure the never-edit rule exists to prevent.
 * `repairLoadouts` is what checks these against the content a build actually ships.
 */
export interface SaveDataV0 {
  version: 0;
  wallet: {
    gold: string;
    xp: string;
    essence: string;
    summons: string;
    spark: string;
    alloy: string;
    emblem: string;
  };
  rates: { gold: string; xp: string; essence: string; summons: string; emblem: string };
  lastTickAt: number;
  rng: { seed: number; calls: number };
  chapter: number;
  /** The stage **within** `chapter`, not a position on the whole ladder. */
  stage: number;
  clearedStages: number;
  battleCount: number;
  roster: {
    defId: string;
    rarity: number;
    level: number;
    copies: number;
    /** Slot id to gear item id. Absent slots are empty. */
    gear: Record<string, string>;
    /** Signature item level. Zero is locked, which is what every ineligible character stores. */
    signature: number;
  }[];
  /**
   * Activity id to the crew standing for it. Absent activities have never been crewed.
   *
   * A record rather than the single `formation` object this was until milestone 15a. A save
   * written before that carries the old field instead, and the decoder reads it into the campaign
   * key — load-time repair rather than a migration, which is what keeps `SAVE_VERSION` at 0.
   */
  formations: Record<string, { front: string[]; back: string[] }>;
  /** Pulls since the last ascended-tier character. */
  pity: number;
  /** Pulls since the last legendary tier **or better**. A different question, not a finer one. */
  legendaryPity: number;
  pullCount: number;
  /** Every piece owned, equipped or not. `roster[].gear` holds ids into this. */
  gear: {
    id: string;
    slot: string;
    archetype: string;
    grade: number;
    /** Faction id, or absent for an unaligned piece. */
    alignment?: string;
    level: number;
  }[];
  /** How many pieces have ever been minted, and so what the next id is. */
  gearMinted: number;
  /** Which shop stocking this run last bought from, and which offers it took. */
  gearShop: { slot: number; purchased: number[] };
  /**
   * Tower id to the highest floor cleared. Absent towers have not been entered.
   *
   * Deliberately not folded into `clearedStages` — see `core/towers.ts` for the arithmetic that
   * forbids it. Absent decodes to `{}`, so no migration and no `SAVE_VERSION` bump.
   */
  towers: Record<string, number>;
  /** Track id to awards claimed. Absent tracks have claimed nothing. */
  achievements: Record<string, number>;
  /**
   * A window is an index, a baseline of counters this save already stores, and the ids claimed
   * inside it. **No quest has a progress field**, because progress is `counter - baseline` — see
   * `core/quests.ts` for why that keeps the whole system out of the battle path.
   */
  quests: {
    daily: { index: number; baseline: Record<string, number>; claimed: string[] };
    weekly: { index: number; baseline: Record<string, number>; claimed: string[] };
  };
  /**
   * Running bounty missions. There is no "finished" flag and no remaining-time field, because both
   * are arithmetic against a `nowMs` the caller supplies — storing either would be a second source
   * of truth that a device clock could put out of step with the first.
   */
  dispatches: { bountyId: string; members: string[]; startedAt: number }[];
  /**
   * The Descent run in flight, or `null` when there is none.
   *
   * ⚠️ **The `day` is the whole of the daily reset and there is no expiry field beside it.** A run
   * dated to yesterday is simply not today's run, so it can be left where it is: nothing continues
   * it, nothing blocks on it, and everything it earned was banked fight by fight. Storing "finished"
   * or "abandoned" would be a second answer to a question one integer already answers, free to
   * disagree with it after a repair.
   *
   * `health` is a **fraction of maximum** per character id, not a quantity — see
   * `core/descent/types.ts` for why an absolute figure cannot survive a level bought between two
   * fights of one run. `cards` are `${familyId}:${rank}` ids; an id this build no longer ships pays
   * nothing rather than invalidating the run.
   *
   * There is no board list and no pending offer here. Both are pure functions of the seed, the day
   * and what the run has already taken, which is what makes rerolling impossible rather than merely
   * detectable.
   */
  descent: {
    day: number;
    cleared: number;
    party: { front: string[]; back: string[] };
    health: Record<string, number>;
    energy: Record<string, number>;
    cards: string[];
    lives: number;
  } | null;
  /** Descent runs finished end to end. The only mark a run leaves once its day has passed. */
  descentRuns: number;
  /**
   * The Expedition attempt in flight, or `null` when there is none.
   *
   * No day and no lives — an attempt persists until finished or abandoned, and restarts are free.
   * `camps` are the cells beaten this attempt, in the order fought; stamina spent is their summed
   * cost, derived rather than stored so the two cannot disagree. `attempt` salts the card draw so a
   * fresh attempt redraws while a force-quit cannot. `health` is a fraction of maximum per
   * character id, for the Descent's reason.
   */
  expedition: {
    mapId: string;
    attempt: number;
    party: { front: string[]; back: string[] };
    health: Record<string, number>;
    energy: Record<string, number>;
    cards: string[];
    camps: string[];
  } | null;
  /**
   * Map id to what that map remembers forever: which camps and chests have paid their one-time
   * rewards, whether completion has paid, and how many attempts have ever been started.
   *
   * ⚠️ **This ledger is the whole of what makes the mode's rewards finite** — see
   * `core/expedition/run.ts`. An entry for a map this build does not ship is kept, exactly as an
   * unknown formation key is: dropping it would pay a returning player's rewards twice.
   */
  expeditions: Record<
    string,
    { camps: string[]; chests: string[]; completed: boolean; attempts: number }
  >;
}

/** The shape written by the current `SAVE_VERSION`. */
export type CurrentSaveData = SaveDataV0;

/** Any historical save shape. Widen this union as versions are added. */
export type AnySaveData = SaveDataV0;

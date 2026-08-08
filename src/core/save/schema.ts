/**
 * The on-disk save shape.
 *
 * JSON-safe: `Numeric` values are stored as exponential-notation strings, which round-trip
 * exactly and stay readable when inspecting a save from a bug report.
 *
 * ## There is one shape here, and it has been re-based to one twice
 *
 * The first re-base folded five pre-release shapes — the gold counter, combat progression, the
 * keyed wallet and roster, the two ranks, and chapters — into a v0 baseline. Six more accumulated
 * on top of it: gear (`alloy`, the loadouts, the bag, the mint counter and the shop ledger), the
 * ladder gaining a bottom (no field, only a change in what `roster[].rarity` denotes), the
 * achievement ledger, the quest windows, the bounty board and the legendary pity counter. **All six
 * were folded back into this one shape**, on the argument that licenses either re-base and nothing
 * else: nobody outside development has ever loaded a save written by any of them.
 * [saves](../../../docs/saves.md) records the reset and the condition that closes the door on doing
 * it again.
 *
 * **From here the old rule applies without exception: never edit or delete a shipped shape.** A
 * migration is written against the shape that existed when it was authored, and changing one
 * retroactively invalidates every migration downstream of it.
 *
 * ⚠️ **The next version is 1, and it is permanent.** The one thing the two re-bases have in common
 * is that neither had an audience; the moment one exists, this file grows an interface rather than
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
  };
  rates: { gold: string; xp: string; essence: string; summons: string };
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
}

/** The shape written by the current `SAVE_VERSION`. */
export type CurrentSaveData = SaveDataV0;

/** Any historical save shape. Widen this union as versions are added. */
export type AnySaveData = SaveDataV0;

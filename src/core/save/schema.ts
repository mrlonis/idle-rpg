/**
 * The on-disk save shape.
 *
 * JSON-safe: `Numeric` values are stored as exponential-notation strings, which round-trip
 * exactly and stay readable when inspecting a save from a bug report.
 *
 * ## There is one shape here, and there used to be five
 *
 * v1 through v5 were the gold counter, combat progression, the keyed wallet and roster, the two
 * ranks, and chapters. **They were collapsed into this v0 baseline while the game was still
 * pre-release**, because nobody outside development had ever loaded a save written by any of them
 * — so the whole chain was five historical shapes and four migrations maintained for an audience
 * of zero. [saves](../../../docs/saves.md) records the reset and the condition that closes the
 * door on doing it again.
 *
 * **From here the old rule applies without exception: never edit or delete a shipped shape.** A
 * migration is written against the shape that existed when it was authored, and changing one
 * retroactively invalidates every migration downstream of it.
 *
 * **v1 is that next version and it arrived with gear**, exactly as this file said it would: purely
 * additive, and the first entry the chain walker has ever actually had to walk. The alternative was
 * to widen v0 in place — nobody outside development has loaded one, so it would have been legal
 * under the same argument the reset itself ran on — and it was declined. The walker has been sitting
 * proven and unused since the reset specifically so that the first real migration would land on
 * tested code, and taking the free option here would have deferred that to a day when it was
 * urgent.
 */
export interface SaveDataV0 {
  version: 0;
  wallet: { gold: string; xp: string; essence: string; summons: string; spark: string };
  rates: { gold: string; xp: string; essence: string; summons: string };
  lastTickAt: number;
  rng: { seed: number; calls: number };
  chapter: number;
  /** The stage **within** `chapter`, not a position on the whole ladder. */
  stage: number;
  clearedStages: number;
  battleCount: number;
  roster: { defId: string; rarity: number; level: number; copies: number }[];
  formation: { front: string[]; back: string[] };
  pity: number;
  pullCount: number;
}

/**
 * v1 — gear.
 *
 * Additive in every field. `alloy` joins the wallet, the roster entry gains what it is wearing, and
 * three top-level fields carry the bag, the id counter and the shop ledger.
 *
 * **Every gear field is typed as loosely here as JSON allows** — `slot` and `archetype` are plain
 * `string`, `grade` a plain `number` — and that is on purpose rather than laziness. A shipped
 * schema describes bytes that exist on devices, and typing it against the runtime unions would tie
 * it to content: re-authoring the archetype list would change what this shape *means* for saves
 * written before the change, which is the exact failure the never-edit rule exists to prevent.
 * `repairLoadouts` is what checks these against the content a build actually ships.
 */
export interface SaveDataV1 {
  version: 1;
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
  formation: { front: string[]; back: string[] };
  pity: number;
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
}

/**
 * v2 — the ladder grew a bottom.
 *
 * **Structurally identical to {@link SaveDataV1}, and that is the point worth reading.** No field
 * was added, removed or retyped. What changed is what `roster[].rarity` *denotes*: `common` and
 * `common-plus` were inserted below `rare` in `RARITIES`, so index 2 stopped meaning `elite` and
 * started meaning `rare`, and every index a v1 save holds is a claim about a rung two places
 * lower than the player earned.
 *
 * That makes this the first version here whose migration cannot be checked by looking at the
 * shape. A v1 save fed to a v2 reader parses perfectly, validates perfectly, and demotes the
 * entire roster — so **a version bump was mandatory precisely because the schema did not change**.
 * There is no structural signal to detect it by; the version number is the only evidence.
 *
 * Declared as its own interface rather than aliased to `SaveDataV1` deliberately. The alias would
 * be correct today and would silently stop being correct the moment v2 gains a field, which is
 * how a shipped shape gets edited by accident.
 */
export interface SaveDataV2 extends Omit<SaveDataV1, 'version'> {
  version: 2;
}

/**
 * v3 — the achievement claim ledger.
 *
 * Purely additive, and the smallest field this save has ever gained: one integer per track, keyed
 * by track id. Everything the screen shows is derived from counters v2 already stored, so what is
 * recorded here is only *what has been taken* — see `core/achievements.ts` for why the earned side
 * is deliberately not stored alongside it.
 *
 * A record rather than a field per track is what stops the next track being another version bump.
 */
export interface SaveDataV3 extends Omit<SaveDataV2, 'version'> {
  version: 3;
  /** Track id to awards claimed. Absent tracks have claimed nothing. */
  achievements: Record<string, number>;
}

/**
 * v4 — the daily and weekly quest windows.
 *
 * Additive, and additive in the cheapest possible way: a window is an index, a baseline of
 * counters this save already stores, and the ids claimed inside it. **No quest has a progress
 * field**, because progress is `counter - baseline` — see `core/quests.ts` for why that keeps the
 * whole system out of the battle path.
 */
export interface SaveDataV4 extends Omit<SaveDataV3, 'version'> {
  version: 4;
  quests: {
    daily: { index: number; baseline: Record<string, number>; claimed: string[] };
    weekly: { index: number; baseline: Record<string, number>; claimed: string[] };
  };
}

/**
 * v5 — the bounty board.
 *
 * Additive: one list of running missions, each an id, a crew and the epoch millisecond it started
 * at. There is no "finished" flag and no remaining-time field, because both are arithmetic against
 * a `nowMs` the caller supplies — storing either would be a second source of truth that a device
 * clock could put out of step with the first.
 */
export interface SaveDataV5 extends Omit<SaveDataV4, 'version'> {
  version: 5;
  dispatches: { bountyId: string; members: string[]; startedAt: number }[];
}

/** The shape written by the current `SAVE_VERSION`. */
export type CurrentSaveData = SaveDataV5;

/** Any historical save shape. Widen this union as versions are added. */
export type AnySaveData =
  SaveDataV0 | SaveDataV1 | SaveDataV2 | SaveDataV3 | SaveDataV4 | SaveDataV5;

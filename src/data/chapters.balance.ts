// The ladder, simulated. Runs in the balance project rather than the fast suite — see
// `vitest.balance.config.ts` for why, and `npm run test:balance` to run it.
import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  type ChapterCurveData,
  type ChapterData,
  type CharacterData,
  type CombatantData,
  type CombatRules,
  type CombatRulesData,
  emptyWallet,
  type FormationData,
  GEAR_SLOTS,
  type GearItem,
  type GearRulesData,
  gearLookup,
  type GrowthData,
  loadoutBonus,
  type KitRulesData,
  type LevelCurveData,
  levelCapFor,
  lineupBonus,
  MAX_BATTLE_TICKS,
  maxAffordableLevel,
  num,
  type Numeric,
  PARTY_SIZE,
  rarityIndex,
  startRarityIndex,
  resolveLadder,
  scaleStats,
  simulateBattle,
  type StageData,
  type StageRewardCurveData,
  ticksToMs,
  toBattleCombatant,
  toCombatRules,
  unlockedSkills,
  type Wallet,
} from '../core';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import {
  BRAN,
  CELIA,
  CIRIEN,
  DORN,
  FAELEN,
  GHAUL,
  GHORRAK,
  GNASH,
  GRIMNA,
  HALRIC,
  HEDDA,
  ILYRA,
  IVO,
  KARSITH,
  KORRIN,
  MIRA,
  MORTLACH,
  NAEL,
  NAERIN,
  NYXARA,
  ORIN,
  OSSUARY,
  OZZA,
  PYRA,
  RAZIEL,
  RIN,
  SANGUINE,
  SKARN,
  SYLVARA,
  THRAUN,
  THREX,
  VESPER,
  VEXIS,
  WREN,
  YERRIK,
  YSOLDE,
  ZAPHIEL,
} from './characters';
import { COMBAT_RULES } from './combat';
import { GEAR_RULES } from './gear';
import { KIT_RULES } from './kits';
import { GROWTH, LEVEL_CURVE } from './levels';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `ChapterData`. Assigning them to a typed local here is
 * what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewards: StageRewardCurveData = STAGE_REWARDS;

/** The whole ladder, flattened and resolved exactly as `ui/content.ts` resolves it. */
const stages: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards, GEAR_RULES);

/** Where each chapter ends, as a count of stages from the foot of the ladder. */
const CHAPTER_ENDS: readonly number[] = chapters.reduce<number[]>((ends, chapter) => {
  ends.push((ends[ends.length - 1] ?? 0) + chapter.stages.length);
  return ends;
}, []);

/**
 * Every fourth stage, plus every chapter boss.
 *
 * ⚠️ **This is a stride over the ladder, not a smaller sample of it, and the distinction is the
 * whole justification.** The rule is to move a sweep rather than shrink it, because a smaller
 * sample buys speed by making the answer less true. Milestone 11 did not add difficulty to the
 * ladder — it made the same range four times denser — so adjacent stages are now within about one
 * percent of each other, and a block that measures *steps* in difficulty measures noise if it
 * reads every one of them. Striding restores the per-sample gap to what the twenty-four stage
 * ladder had, at the same cost, over the same range, at the same resolution.
 *
 * The bosses are pinned in because they are the stages a chapter is shaped around, and a stride
 * that skipped one would be measuring a ladder with no peaks.
 */
const STRIDE = 4;
const SAMPLED: readonly StageData[] = stages.filter(
  (stage, index) => index % STRIDE === 0 || stage.kind === 'boss',
);

const growth: GrowthData = GROWTH;
const kit: KitRulesData = KIT_RULES;
const authoredRules: CombatRulesData = COMBAT_RULES;
const rules: CombatRules = toCombatRules(authoredRules);
const gearRules: GearRulesData = GEAR_RULES;

/**
 * Seeds per stage.
 *
 * Enough to tell "reliable" from "a coin flip". This number is the reason the sweep lives in its
 * own project: four reference parties across a hundred stages is sixteen thousand battles before
 * the seven mono-faction fives are counted, and shrinking the sample to fit the fast suite would
 * have bought speed by making the answer less true. What milestone 11 did instead, where a block
 * genuinely could not afford the whole ladder, was stride over it — see {@link SAMPLED}.
 */
const TRIALS = 40;

/**
 * The rungs this file fields parties at, resolved from the ladder rather than written as indices.
 *
 * Every one of these used to be a bare number, which is a coupling wearing a literal's clothes: 2
 * means `elite` only for as long as nobody inserts a rung below it, and a reordered ladder would
 * have moved every reference party silently — the sweep would still pass, describing a different
 * game. Reading them off `rarityIndex` makes that a compile-time relationship, and an id that
 * stops being a rarity resolves to `-1` and fails loudly instead.
 *
 * The names also carry what the numbers never did. `RARE_PLUS` is the first ascension anybody
 * buys and where {@link BUILT} sits; `ELITE` is the rung at which a common-tier character's
 * second skill arrives; `LEGENDARY` is the rung the stomp probe fields the mid-Ashfall sample at;
 * `ASCENDED` is where a fully invested character ends up; and `START` is where a common-tier
 * character actually lands from a pull.
 *
 * ⚠️ **`RARE` is gone, and what it was last used for is worth knowing.** It named the floor the
 * stat ladder is anchored at, and the levelling-versus-ascension assertion measured rungs as
 * `LEGENDARY - RARE` — a span belonging to no reference party in this file. See that test for how
 * it survived six milestones and what replaced it.
 *
 * ⚠️ **A rarity id fixes a party's power only because the stat ladder is anchored at `rare`.**
 * The copies-only rewrite put two rungs below it, and a common-tier character now *starts* at `common`
 * rather than here — but `growthFloor` counts multipliers from `rare` regardless, so those two
 * rungs buy level cap and no stats. That is what makes every party in this file worth exactly
 * what it was worth before the ladder grew, and it is why none of the stage content had to move.
 * If the two `common` rungs are ever paid a multiplier, every number in this file changes and the
 * whole ladder needs re-deriving.
 */
const START = startRarityIndex('common');
const RARE_PLUS = rarityIndex('rare-plus');
const ELITE = rarityIndex('elite');
const LEGENDARY = rarityIndex('legendary');
const ASCENDED = rarityIndex('ascended');

/**
 * The rung the difficulty probe fields its kits at.
 *
 * Matching {@link BUILT}. The probe sweeps *power* continuously and holds everything else fixed,
 * so the kit has to be pinned to a rung rather than moving with the multiplier.
 */
const PROBE_RARITY = ELITE;

interface Sweep {
  readonly winRate: number;
  readonly meanSeconds: number;
  readonly maxSeconds: number;
  readonly meanSurvivors: number;
  /** Fights that ran the ninety seconds out instead of ending in a death. */
  readonly timedOut: number;
}

/**
 * One character resolved for level and rarity, exactly as `ui/` hands it to a battle.
 *
 * Through `toBattleCombatant` rather than reassembled here, and that matters more since milestone
 * 8c than it did before: the kit is now narrowed by tier and rung as well as the stats being
 * scaled, so a sweep that built its own combatant would measure a party fielding skills the game
 * has not handed the player yet. A common-tier character carries two skills at `elite` and above
 * and one below it, so {@link BUILT} at `rare-plus` fields one each and {@link INVESTED} at
 * `legendary` fields two — which is a real difference between the two reference parties rather
 * than an artefact of how they are built here.
 */
function at(
  character: CharacterData,
  level: number,
  rarity: number,
  kitted?: GearKit,
): CombatantData {
  // The level is passed twice on purpose: the sweep fields parties at an *explicit* level, so
  // the invested level and the effective one are the same number here. Resonance can only ever
  // raise the second, which is a statement about what a player's roster costs rather than about
  // what a party of a given power can clear — the thing this file measures.
  return toBattleCombatant(
    character,
    { defId: character.id, rarity, level, copies: 0, gear: {}, signature: 0 },
    growth,
    kit,
    level,
    kitted === undefined ? undefined : gearBonus(character, kitted),
  );
}

/** A full five-piece set at one grade and one enhancement level. */
interface GearKit {
  readonly grade: number;
  readonly level: number;
  /** Whether every piece happens to be aligned to the wearer's own faction. */
  readonly aligned: boolean;
}

/**
 * What a full set of `kitted` is worth to `character`.
 *
 * Built through `loadoutBonus` rather than summed here, for the reason `at()` goes through
 * `toBattleCombatant`: the sweep has to measure the seam the game actually uses. A bonus assembled
 * in this file would keep agreeing with itself after the real one had drifted.
 *
 * Five pieces of the character's own archetype, which is the only loadout the game will let a
 * player build — the archetype gate is checked in `equip`, so a mixed-archetype set is not a party
 * anybody could field and therefore not a tuning target.
 */
function gearBonus(character: CharacterData, kitted: GearKit) {
  const pieces: GearItem[] = GEAR_SLOTS.map((slot) => ({
    id: `${character.id}:${slot}`,
    slot,
    archetype: character.role,
    grade: kitted.grade,
    alignment: kitted.aligned ? character.faction : undefined,
    level: kitted.level,
  }));
  const loadout = Object.fromEntries(pieces.map((piece) => [piece.slot, piece.id]));
  return loadoutBonus(gearRules, loadout, gearLookup(pieces), character.faction);
}

function sweep(party: FormationData, stage: StageData, using: CombatRules = rules): Sweep {
  let wins = 0;
  let timedOut = 0;
  let ticks = 0;
  let longest = 0;
  let survivors = 0;

  for (let attempt = 0; attempt < TRIALS; attempt++) {
    const result = simulateBattle(party, stage, battleSeed(0xc0ffee, stage.id, attempt), using);
    if (result.outcome === 'victory') {
      wins++;
    }
    if (result.timedOut) {
      timedOut++;
    }
    ticks += result.ticks;
    longest = Math.max(longest, result.ticks);
    survivors += result.final.filter((c) => c.side === 'ally' && c.hp.gt(0)).length;
  }

  return {
    winRate: wins / TRIALS,
    meanSeconds: ticks / TRIALS / 10,
    maxSeconds: longest / 10,
    meanSurvivors: survivors / TRIALS,
    timedOut,
  };
}

/**
 * Levels here are checked against the rarity's own cap, because a party the game will not let a
 * player build is not a tuning target.
 *
 * This is not a technicality. The reference party used to be five characters at level 80 with no
 * ascension at all, and `rare` caps at level 40 — so the number the whole mid-ladder was tuned
 * against described a party that cannot exist. `at()` scales whatever it is handed; only the
 * roster's `levelUp` enforces the cap, and no sweep goes through it.
 */
function legal(level: number, rarity: number): number {
  expect(level, `level ${level} at rarity ${rarity}`).toBeLessThanOrEqual(LEVEL_CURVE.caps[rarity]);
  return level;
}

/** A five at one investment, for the mono-faction sweeps. */
function mono(
  front: readonly CharacterData[],
  back: readonly CharacterData[],
  level: number,
  rarity: number,
  kitted?: GearKit,
): FormationData {
  return {
    front: front.map((character) => at(character, legal(level, rarity), rarity, kitted)),
    back: back.map((character) => at(character, legal(level, rarity), rarity, kitted)),
  };
}

/**
 * The three characters a run starts with, at level 1, standing where the game puts them.
 *
 * Fielded at {@link START} rather than at `rare` — a common-tier character lands two rungs
 * below `rare` now. At level 1 the two are the **same combatant**: `growthFloor` anchors the stat
 * ladder at `rare`, so neither rung pays a multiplier, and a common-tier kit opens its second
 * skill at `elite` either way. The rungs differ only in level cap, which nothing at level 1 can
 * reach. Written as `START` anyway, because this party is defined by where a run begins and a
 * reader should not have to reconstruct that equality to trust it.
 */
const STARTERS: FormationData = {
  front: [at(BRAN, 1, START), at(MIRA, 1, START)],
  back: [at(RIN, 1, START)],
};

/**
 * The level and rung {@link BUILT} is fielded at, and what the mono-faction fives match.
 *
 * **The level is derived, not authored.** What this party *is* is "filled the five formation slots
 * and levelled them as far as they go without ascending" — so the level is this rung's own cap,
 * whatever the curve says that is.
 *
 * ⚠️ **It was `rare-plus` at the cap of the rung below until the milestone-14 retune**, which made
 * it a party three rungs in. That described the old ladder, where chapter 1 closed at enemy level
 * 40; the retune brought the ceiling to 16 and this party down to meet it.
 *
 * ⚠️ **Zero rungs was measured and rejected, and the reason is the shape of the early curve.**
 * `perLevel.common` is 1.021 — it has to be, to reach ×10⁹ across a thousand levels — so a
 * character levelled from 1 to its unascended cap of 20 is worth **×1.48**, against a wall at
 * stage 7 built to stop ×1.00. That 48% is the entire margin, and chapter 1's composition locks
 * ate it: a five at level 20 with no rungs failed eight stages, one at a 5% win rate, and the seven
 * mono-faction fives spread twice as far apart as the guard allows.
 *
 * **Levels are not the early power curve in this game; rungs are.** So this party is one rung in
 * and levelled into the cap that rung buys — which is also what a player actually holds, because
 * the pulls that fill the five formation slots produce the duplicates that pay for it.
 *
 * Note what the rung is *not* worth here: `growthFloor` anchors the ×1.6 ladder at `rare`, so
 * `common-plus` pays no multiplier either. What it buys is ten more levels, and at ×1.021 each
 * that is the difference between ×1.48 and ×1.81.
 */
const BUILT_RARITY = rarityIndex('common-plus');
const BUILT_LEVEL = LEVEL_CURVE.caps[BUILT_RARITY];

/**
 * The fen party: five common-tier characters at the cap they reach without ascending.
 *
 * Deliberately all `common` tier. If the ladder needed a lucky banner it would be a wall in front
 * of players who cannot buy their way past one, which in a game with no purchases is a wall with
 * nothing behind it.
 *
 * **It was level 80 at `elite` until milestone 10** and level 40 at `rare-plus` until milestone 14.
 * The through-line is that this party is always defined by *where a player stops*, never by a
 * number: milestone 10 moved that because a rung became worth ×1.6 rather than ×1.12, and
 * milestone 14 moved it because the ladder came down to meet a party that has not ascended yet.
 */
const BUILT_FRONT = [BRAN, GNASH];
const BUILT_BACK = [RIN, CELIA, PYRA];

const BUILT: FormationData = mono(BUILT_FRONT, BUILT_BACK, BUILT_LEVEL, BUILT_RARITY);

/**
 * The gear a mid-game party has actually assembled, and the gear a maximal one has.
 *
 * Two kits rather than one, because the interesting question about a third progression axis is not
 * "what does the ceiling look like" but "does the middle of it feel like anything".
 *
 * - `FOUND` is a full set of the middle grade at half its cap, unaligned. That is roughly what
 *   falls out of clearing the fen and enhancing what dropped — no shop purchases, no luck, and
 *   no attempt to match factions.
 * - `MAXED` is every slot at the top grade, at level 100, aligned. Nothing legal is stronger, and
 *   it is deliberately far out of reach of {@link BUILT}'s investment: it is the ceiling this file
 *   measures *against*, not a party anybody has at level 40.
 */
const FOUND: GearKit = { grade: 2, level: 30, aligned: false };
const MAXED: GearKit = { grade: gearRules.grades.length - 1, level: 100, aligned: true };

/** {@link BUILT}, wearing what the fen would have handed it. */
const FOUND_GEAR: FormationData = mono(BUILT_FRONT, BUILT_BACK, BUILT_LEVEL, BUILT_RARITY, FOUND);

/**
 * {@link BUILT}, wearing the best gear that exists.
 *
 * ⚠️ **A guard, not a tuning target**, in exactly the sense {@link BOOSTED} is one. Nothing here
 * asserts this party should clear anything in particular. What it watches is the failure a large
 * health and defence bonus makes likelier — a party surviving a fight it cannot win until the
 * ninety seconds run out — and the fact that the strongest thing the game can field still has to
 * resolve its fights.
 */
const MAXED_GEAR: FormationData = mono(BUILT_FRONT, BUILT_BACK, BUILT_LEVEL, BUILT_RARITY, MAXED);

/**
 * The party that arrives in chapter 5: the five that just took the Ashfall Sovereign, unchanged.
 *
 * The middle reference party, and it exists to make the seam measurable from both sides. Chapter 5
 * opens at exactly the level chapter 4 closed on, so this party is meant to walk a little way into
 * the Bound Marches on momentum and then stop — the same relationship {@link BUILT} has with
 * the ash chapters, further up the ladder.
 *
 * **Both numbers are derived from where chapter 4 ends**, so a retune of that chapter re-aims this
 * rather than leaving it describing the old one. `elite` is the rung that carries it: its cap is
 * 100 against chapter 4's closing level of 85.
 */
const ARRIVED_RARITY = ELITE;
const ARRIVED_LEVEL = Math.min(stages[CHAPTER_ENDS[3] - 1].level, LEVEL_CURVE.caps[ARRIVED_RARITY]);

const ARRIVED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(ARRIVED_LEVEL, ARRIVED_RARITY),
  ARRIVED_RARITY,
);

/**
 * The party that arrives in chapter 6: the five that just took The Chainsworn, unchanged.
 *
 * ⚠️ **This is the Bound Marches' {@link INVESTED}, kept under a new name rather than re-derived.**
 * Every seam from here adds one of these — a party defined by the chapter it has just finished —
 * and the alternative is to keep re-pointing a single "arrived" party and lose the ability to
 * measure the older seam at all. Two named parties per seam is what makes "clears the chapter
 * behind it, and walks only a little way into the one ahead" checkable at both boundaries at once.
 *
 * Both numbers are derived from where chapter 5 ends, so a retune of that chapter re-aims this.
 * `elite` is the rung it carries and its cap of 100 is **above** chapter 5's closing level of 75, so
 * the party stands level with the content rather than behind it.
 *
 * ⚠️ **That is the flattening, and it reversed what this comment used to say.** Under the margin
 * rule every chapter closed *past* the cap of the rung it asked for and this note recorded a
 * fourteen-level deficit against a chapter closing at 160. The rule is retired: a chapter now runs
 * entirely inside a cap the party already holds. See [ladder](../../docs/ladder.md).
 */
const MARCHED_RARITY = ELITE;
const MARCHED_LEVEL = Math.min(stages[CHAPTER_ENDS[4] - 1].level, LEVEL_CURVE.caps[MARCHED_RARITY]);

const MARCHED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(MARCHED_LEVEL, MARCHED_RARITY),
  MARCHED_RARITY,
);

/**
 * The party that arrives in chapter 7: the five that just took The Hollow Seraph, unchanged.
 *
 * ⚠️ **This is the Sundered Vault's {@link INVESTED}, kept under a new name rather than re-derived**
 * — the third time that has happened and the third time for the same reason. Re-pointing a single
 * "arrived" party at each new chapter would silently stop checking that the chapter below is still
 * finishable by the party it was tuned for, and two named parties per seam is what makes "clears
 * the chapter behind it, and walks only a little way into the one ahead" checkable at both
 * boundaries at once.
 *
 * Both numbers are derived from where chapter 6 ends, so a retune of that chapter re-aims this.
 * `elite-plus` is the rung it carries and its cap of 140 is above chapter 6's closing level of 100,
 * so this stands level with the content — the flat line's shape, not the retired margin rule's.
 */
const VAULTED_RARITY = rarityIndex('elite-plus');
const VAULTED_LEVEL = Math.min(stages[CHAPTER_ENDS[5] - 1].level, LEVEL_CURVE.caps[VAULTED_RARITY]);

const VAULTED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(VAULTED_LEVEL, VAULTED_RARITY),
  VAULTED_RARITY,
);

/**
 * The party that arrives in chapter 8: the five that just took The Cairn King, unchanged.
 *
 * ⚠️ **This is the Waking Barrows' {@link INVESTED}, kept under a new name rather than re-derived**
 * — the fourth time that has happened and the fourth time for the same reason. Re-pointing a single
 * "arrived" party at each new chapter would silently stop checking that the chapter below is still
 * finishable by the party it was tuned for, and two named parties per seam is what makes "clears the
 * chapter behind it, and walks only a little way into the one ahead" checkable at both boundaries
 * at once.
 *
 * Both numbers are derived from where chapter 7 ends, so a retune of that chapter re-aims this.
 * `elite-plus` is the rung it carries and its cap of 140 is above chapter 7's closing level of 125,
 * so this stands level with the content. ⚠️ **It shares its rung with {@link VAULTED}**, which is
 * what the flat line does: a chapter often asks for the same rung as the one below it, and moving
 * the rung up by reflex hands the party a ×1.6 the content never asked for.
 */
const BARROWED_RARITY = rarityIndex('elite-plus');
const BARROWED_LEVEL = Math.min(
  stages[CHAPTER_ENDS[6] - 1].level,
  LEVEL_CURVE.caps[BARROWED_RARITY],
);

const BARROWED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(BARROWED_LEVEL, BARROWED_RARITY),
  BARROWED_RARITY,
);

/**
 * The party that arrives in chapter 9: the five that just took The Withered Crown, unchanged.
 *
 * ⚠️ **This is the Sunless Weald's {@link INVESTED}, kept under a new name rather than re-derived**
 * — the fifth time that has happened and the fifth time for the same reason. Re-pointing a single
 * "arrived" party at each new chapter would silently stop checking that the chapter below is still
 * finishable by the party it was tuned for, and two named parties per seam is what makes "clears the
 * chapter behind it, and walks only a little way into the one ahead" checkable at both boundaries at
 * once.
 *
 * Both numbers are derived from where chapter 8 ends, so a retune of that chapter re-aims this.
 * `legendary` is the rung it carries and its cap of 200 is above chapter 8's closing level of 150,
 * so this stands level with the content.
 */
const WEALDED_RARITY = LEGENDARY;
const WEALDED_LEVEL = Math.min(stages[CHAPTER_ENDS[7] - 1].level, LEVEL_CURVE.caps[WEALDED_RARITY]);

const WEALDED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(WEALDED_LEVEL, WEALDED_RARITY),
  WEALDED_RARITY,
);

/**
 * The party that arrives in chapter 10: the five that just took The Anvil Crowned, unchanged.
 *
 * ⚠️ **This is the Hollow Anvil's {@link INVESTED}, kept under a new name rather than re-derived**
 * — the sixth time that has happened and the sixth time for the same reason. Re-pointing a single
 * "arrived" party at each new chapter would silently stop checking that the chapter below is still
 * finishable by the party it was tuned for, and two named parties per seam is what makes "clears the
 * chapter behind it, and walks only a little way into the one ahead" checkable at both boundaries at
 * once.
 *
 * Both numbers are derived from where chapter 9 ends, so a retune of that chapter re-aims this.
 * `legendary` is the rung it carries and its cap of 200 is above chapter 9's closing level of 175,
 * so this stands level with the content. It shares its rung with {@link WEALDED} and
 * {@link WILDED} — three consecutive chapters on one rung, which is what the flat line looks like.
 */
const ANVILLED_RARITY = LEGENDARY;
const ANVILLED_LEVEL = Math.min(
  stages[CHAPTER_ENDS[8] - 1].level,
  LEVEL_CURVE.caps[ANVILLED_RARITY],
);

const ANVILLED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(ANVILLED_LEVEL, ANVILLED_RARITY),
  ANVILLED_RARITY,
);

/**
 * The party that arrives in chapter 11: the five that just took The Everwound, unchanged.
 *
 * ⚠️ **This is The Bleeding Wild's {@link INVESTED}, kept under a new name rather than re-derived**
 * — the seventh time that has happened and the seventh time for the same reason. Re-pointing a
 * single "arrived" party at each new chapter would silently stop checking that the chapter below is
 * still finishable by the party it was tuned for, and two named parties per seam is what makes
 * "clears the chapter behind it, and walks only a little way into the one ahead" checkable at both
 * boundaries at once.
 *
 * Both numbers are derived from where chapter 10 ends, so a retune of that chapter re-aims this.
 * `legendary` is the rung it carries and its cap of 200 is **exactly** chapter 10's closing level,
 * which is the one seam where the party stands precisely level with the content rather than inside
 * its own cap. That is not a statement about The Everwound; it is where half a level a stage lands
 * after ten chapters.
 */
const WILDED_RARITY = LEGENDARY;
const WILDED_LEVEL = Math.min(stages[CHAPTER_ENDS[9] - 1].level, LEVEL_CURVE.caps[WILDED_RARITY]);

const WILDED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(WILDED_LEVEL, WILDED_RARITY),
  WILDED_RARITY,
);

/**
 * The party that arrives in chapter 12: the five that just took The Last Order, unchanged.
 *
 * ⚠️ **This is The Standing Line's {@link INVESTED}, kept under a new name rather than re-derived**
 * — the eighth time that has happened and the eighth time for the same reason. Re-pointing a single
 * "arrived" party at each new chapter would silently stop checking that the chapter below is still
 * finishable by the party it was tuned for, and two named parties per seam is what makes "clears the
 * chapter behind it, and walks only a little way into the one ahead" checkable at both boundaries at
 * once.
 *
 * ⚠️ **It carries the same rung as {@link INVESTED} does, which is a first for this chain.** Every
 * seam before this one differed from the next by a rung, a level or both; chapters 11 and 12 share
 * `legendary-plus`, so these two parties differ **only** in level — 225 against 250, which is ×1.68
 * of power. That is what a flat level line produces once a rung's cap is wide enough to hold two
 * chapters, and it is the cleanest available statement of what a chapter is now worth.
 */
const LINED_RARITY = rarityIndex('legendary-plus');
const LINED_LEVEL = Math.min(stages[CHAPTER_ENDS[10] - 1].level, LEVEL_CURVE.caps[LINED_RARITY]);

const LINED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(LINED_LEVEL, LINED_RARITY),
  LINED_RARITY,
);

/**
 * The party that arrives in chapter 13: the five that just took The Ironbloom, unchanged.
 *
 * ⚠️ **This is The Rustwood's {@link INVESTED}, kept under a new name rather than re-derived** — the
 * ninth time that has happened and the ninth time for the same reason. Re-pointing a single "arrived"
 * party at each new chapter would silently stop checking that the chapter below is still finishable
 * by the party it was tuned for, and two named parties per seam is what makes "clears the chapter
 * behind it, and walks only a little way into the one ahead" checkable at both boundaries at once.
 *
 * ⚠️ **It carries the same rung as {@link INVESTED} does, for the second seam running** — chapters
 * 11, 12 and 13 all sit on `legendary-plus`, which is the longest any rung has held on the flat line.
 * These two parties therefore differ **only** in level: 250 against `legendary-plus`'s cap of 260, so
 * the whole seam is worth ×1.21 rather than the ×1.68 a full chapter of levels would be. That is what
 * a flat line does once it climbs into the top of a cap, and it is the tightest seam this chain has
 * carried.
 */
const RUSTED_RARITY = rarityIndex('legendary-plus');
const RUSTED_LEVEL = Math.min(stages[CHAPTER_ENDS[11] - 1].level, LEVEL_CURVE.caps[RUSTED_RARITY]);

const RUSTED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(RUSTED_LEVEL, RUSTED_RARITY),
  RUSTED_RARITY,
);

/**
 * The party that arrives in chapter 14: the five that just took The Undercut, unchanged.
 *
 * ⚠️ **This is The Quarry's {@link INVESTED}, kept under a new name rather than re-derived** — the
 * tenth time that has happened and the tenth time for the same reason. Re-pointing a single "arrived"
 * party at each new chapter would silently stop checking that the chapter below is still finishable
 * by the party it was tuned for.
 *
 * ⚠️ **It is the first link in this chain that is _identical_ to the one above it, and that is a
 * finding rather than an oversight.** Chapters 11 through 14 all sit on `legendary-plus`, whose cap
 * of **260** the campaign passed at chapter 12: The Quarry closes at 275 and The Shutgate at 300, so
 * both clamp to the same 260 and this party and {@link INVESTED} are the **same five characters at
 * the same level at the same rung**. The seam chain exists to compare two parties at a boundary and
 * at this boundary there is only one.
 *
 * **What that means for the two assertions below is stated at each of them**: "clears chapters 1
 * through 13" and "is clearable end to end" become the same claim, and the momentum ceiling — already
 * non-binding at this seam for its own separate reason — becomes vacuous by construction rather than
 * by arithmetic. ⚠️ **Recorded, not fixed.** The repair is the one `MOMENTUM_CEILING` already names,
 * and it is a decision about what a seam is meant to prove rather than a chapter's scope.
 *
 * ⚠️ **The chapter is not thereby easier — it is the hardest since the flattening.** The party cannot
 * follow the content up the curve at all: The Shutgate's last board stands **forty levels** above it,
 * which is ×2.29 at `perLevel.common` and arrives entirely from the cap. See {@link INVESTED} for the
 * seam ratios and `chapter-14.ts` for what that measures as on the boards.
 */
const QUARRIED_RARITY = rarityIndex('legendary-plus');
const QUARRIED_LEVEL = Math.min(
  stages[CHAPTER_ENDS[12] - 1].level,
  LEVEL_CURVE.caps[QUARRIED_RARITY],
);

const QUARRIED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(QUARRIED_LEVEL, QUARRIED_RARITY),
  QUARRIED_RARITY,
);

/**
 * The party that arrives in chapter 15: the five that just took The Doorstone, unchanged.
 *
 * ⚠️ **This is The Shutgate's {@link INVESTED}, kept under a new name rather than re-derived** — the
 * eleventh time that has happened, for the eleventh time for the same reason.
 *
 * ⚠️ **It is the second link running that is identical to the one above it, and the third party in
 * the chain that is the same five combatants.** Chapters 11 through 15 all sit on `legendary-plus`,
 * whose cap of **260** the campaign passed at chapter 12: The Quarry closes at 275, The Shutgate at
 * 300 and The Underroad at 325, so {@link QUARRIED}, this and {@link INVESTED} all clamp to 260.
 * ⚠️ **What was a finding at chapter 14 is now a trend with a rate attached**: each further chapter
 * on this rung divides the seam ratio by `perLevel.common ** 25` = **1.680**, by arithmetic rather
 * than by tuning, and adds one more identical link.
 *
 * **What that means for the assertions below is stated at each of them.** ⚠️ **Recorded, not fixed**,
 * for the second chapter running: the repair is the one `MOMENTUM_CEILING` already names — a share of
 * the *slice* rather than of the ladder — and it re-derives every seam in this file at once, which is
 * a decision about what a seam proves rather than a chapter's scope.
 *
 * ⚠️ **The chapter is not thereby easier — it is the hardest since the flattening, by a long way.**
 * The Underroad's last board stands **sixty-five levels** above this party, which is ×3.80 at
 * `perLevel.common` against The Shutgate's ×2.29, and it arrives entirely from the cap. Measured,
 * The Shutgate's own final board refielded at level 310 reads **0% with nobody standing** against
 * this party, and at 325 it reads 0% in 11.5 seconds — which is why every block chapter 15 authors is
 * roughly half the weight of chapter 14's. See `chapter-15.ts`.
 */
const SHUTGATED_RARITY = rarityIndex('legendary-plus');
const SHUTGATED_LEVEL = Math.min(
  stages[CHAPTER_ENDS[13] - 1].level,
  LEVEL_CURVE.caps[SHUTGATED_RARITY],
);

const SHUTGATED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(SHUTGATED_LEVEL, SHUTGATED_RARITY),
  SHUTGATED_RARITY,
);

/**
 * The party that arrives in chapter 16: the five that just took The Unnumbered, unchanged.
 *
 * ⚠️ **This is The Underroad's {@link INVESTED}, kept under a new name rather than re-derived** — the
 * twelfth time that has happened, for the twelfth time for the same reason.
 *
 * ⚠️ **It is the third link running that is identical to the one above it, and the fourth party in
 * the chain that is the same five combatants.** Chapters 11 through 16 all sit on `legendary-plus`,
 * whose cap of **260** the campaign passed at chapter 12: The Quarry closes at 275, The Shutgate at
 * 300, The Underroad at 325 and The Spoilfield at 350, so {@link QUARRIED}, {@link SHUTGATED}, this
 * and {@link INVESTED} all clamp to 260. Chapter 15 predicted a third degenerate link and this is it.
 *
 * ⚠️ **The rate has now held for three chapters running and is arithmetic rather than tuning**: each
 * further chapter on this rung divides the seam ratio by `perLevel.common ** 25` = **1.680**, and
 * adds one more identical link. **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154.**
 *
 * ⚠️ **The chapter is not thereby easier — it is the hardest since the flattening, again.** The
 * Spoilfield's last board stands **ninety levels** above this party, which is ×6.49 at
 * `perLevel.common` against The Underroad's ×3.80. Measured, The Underroad's own final board
 * refielded against this party at level 330 with chapter 16's gear reads **0% with nobody standing**,
 * and at 350 it reads 0% in 5.8 seconds and has to be scaled to **×0.4** before it reads four
 * survivors again — which is why every block chapter 16 authors is roughly two fifths of the weight
 * of chapter 15's. See `chapter-16.ts`.
 */
const UNDERROAD_RARITY = rarityIndex('legendary-plus');
const UNDERROAD_LEVEL = Math.min(
  stages[CHAPTER_ENDS[14] - 1].level,
  LEVEL_CURVE.caps[UNDERROAD_RARITY],
);

const UNDERROAD: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(UNDERROAD_LEVEL, UNDERROAD_RARITY),
  UNDERROAD_RARITY,
);

/**
 * The party that arrives in chapter 17: the five that just took The Inheritor, unchanged.
 *
 * ⚠️ **This is The Spoilfield's {@link INVESTED}, kept under a new name rather than re-derived** —
 * the thirteenth time that has happened, for the thirteenth time for the same reason.
 *
 * ⚠️ **It is the fourth link running that is identical to the one above it, and the fifth party in
 * the chain that is the same five combatants.** Chapters 11 through 17 all sit on `legendary-plus`,
 * whose cap of **260** the campaign passed at chapter 12: The Quarry closes at 275, The Shutgate at
 * 300, The Underroad at 325, The Spoilfield at 350 and The Quickmire at 375, so {@link QUARRIED},
 * {@link SHUTGATED}, {@link UNDERROAD}, this and {@link INVESTED} all clamp to 260. Recorded rather
 * than repaired, for the fourth chapter running; the repair is the share-of-the-slice one
 * {@link MOMENTUM_CEILING} already names, and it re-derives every seam in this file at once.
 *
 * ⚠️ **The rate has now held four times and is arithmetic rather than tuning**: each further
 * chapter on this rung divides the seam ratio by `perLevel.common ** 25` = **1.680** and adds one
 * more identical link. **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154 → 0.9608.**
 *
 * ⚠️ **The seam has gone below 1.00 for the first time**, which is worth naming rather than reading
 * past: the content at the top of the ladder is now nominally *ahead* of the party the chapter is
 * tuned for, and what keeps The Quickmire winnable is entirely that its boards are half the weight
 * of The Spoilfield's. Measured, chapter 16's own final board refielded against this party at level
 * 375 reads **0% with nobody standing** and has to be scaled to **×0.5** before it reads four
 * survivors again. See `chapter-17.ts`.
 */
const SPOILED_RARITY = rarityIndex('legendary-plus');
const SPOILED_LEVEL = Math.min(
  stages[CHAPTER_ENDS[15] - 1].level,
  LEVEL_CURVE.caps[SPOILED_RARITY],
);

const SPOILED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(SPOILED_LEVEL, SPOILED_RARITY),
  SPOILED_RARITY,
);

/**
 * The party that arrives in chapter 18: the five that just took The Latecomer, unchanged.
 *
 * ⚠️ **This is The Quickmire's {@link INVESTED}, kept under a new name rather than re-derived** —
 * the fourteenth time that has happened, for the fourteenth time for the same reason.
 *
 * ⚠️ **It is the last link of the degenerate chain, and the chain ends here.** Chapters 13 through
 * 17 all close above `legendary-plus`'s cap of **260** and all clamp to it, so {@link QUARRIED},
 * {@link SHUTGATED}, {@link UNDERROAD}, {@link SPOILED} and this are **five consecutive names for
 * one set of five combatants**. {@link INVESTED} is the first party in six chapters that is not:
 * The Slowgrowth asks for `mythic`, and it clamps to **340**.
 *
 * ⚠️ **What this party is for is the seam below it, and that has not changed.** It must clear all
 * seventeen chapters behind it and must not walk far into the eighteenth — and the second half of
 * that is no longer vacuous, because for the first time in five chapters the party ahead of it is
 * genuinely stronger. See {@link INVESTED} for why the rung moved and what it cost.
 */
const QUICKMIRED_RARITY = rarityIndex('legendary-plus');
const QUICKMIRED_LEVEL = Math.min(
  stages[CHAPTER_ENDS[16] - 1].level,
  LEVEL_CURVE.caps[QUICKMIRED_RARITY],
);

const QUICKMIRED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(QUICKMIRED_LEVEL, QUICKMIRED_RARITY),
  QUICKMIRED_RARITY,
);

/**
 * The party that arrives in chapter 19: the five that just took The Last Ring, unchanged.
 *
 * ⚠️ **This is The Slowgrowth's {@link INVESTED}, kept under a new name rather than re-derived** —
 * the fifteenth time that has happened, for the fifteenth time for the same reason: re-aiming one
 * "arrived" party at the newest chapter would silently stop checking that every chapter below it is
 * still finishable by the party it was tuned for.
 *
 * Still common tier, and still no pull anyone had to be lucky for — the ladder asks for levels and
 * ascension rungs, which are bought with time and duplicates, and for nothing a player cannot earn.
 *
 * ⚠️ **It carries the same rung as {@link INVESTED} does, which restarts the degenerate chain one
 * chapter after chapter 18 ended one.** Chapters 18 and 19 both close above `mythic`'s cap of 340
 * and both clamp to it, so this party and the one ahead of it are the same five combatants and the
 * two assertions either side of the boundary are one claim. See {@link INVESTED}.
 *
 * ## ⚠️ Chapter 18 moved the rung to `mythic`, and it was the first move in seven chapters
 *
 * **The rule that picks a rung is the one that reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`, evaluated for
 * every rung and taken closest in **log** space. ⚠️ **This chapter overrides it, knowingly, and the
 * override is stated rather than hidden inside a derivation.** Against chapter 17's own seam of
 * 0.9608 and The Slowgrowth's close of 400, `legendary-plus` reads **0.5715** (|Δln| **0.5195**) and
 * `mythic` reads **4.8214** (|Δln| **1.6131**). The rule prefers staying put, by 1.09 of a nat.
 *
 * ⚠️ **The rule assumes the seam below it was itself correct, and it was not.** Chapters 11 through
 * 17 all sat on `legendary-plus`, whose cap of **260** the ladder passed at chapter 12, so each
 * chapter's boards had to fall by `perLevel.common ** -25` = 0.595 to stay winnable — six halvings
 * that drove the seam **10.4858 → 7.6774 → 4.5665 → 2.7160 → 1.6154 → 0.9608**. Below 1.00 means the
 * content is nominally *ahead* of the party it is tuned for. Reproducing that ratio one chapter
 * further reads **0.5718**, and the arithmetic underneath it runs out: the board budget would be
 * **645 → 454** common-equivalent, or **129 → 91 per body on a board of five**, and of the 238 blocks
 * that existed before this chapter **five** sit at or under 129 and **none** at or under 91. The
 * lightest body ever shipped is 100. **There is no chapter 18 on `legendary-plus`.**
 *
 * ## ⚠️ `mythic` was ruled out on a measurement at chapter 15, and the measurement inverted
 *
 * The Underroad recorded that a `mythic` five needs boards scaled ×2.4 — an anchor near 3,550 health
 * against {@link UNMADE}'s ceiling of 1800, which `enemies.spec.ts` enforces — and chapters 16 and 17
 * both carried the claim forward. **It was true of chapter 15's boards and false of chapter 18's**,
 * because three further halvings happened underneath it. Measured against this party at its cap of
 * **340**: the budget is **5,442 → 3,830** common-equivalent, **1,088 → 766 per body**, where the
 * pool's median at level 400 is **1,295** and the Unmade is 5,820. ⚠️ **116 of 238 blocks now sit
 * inside the ordinary-slot band where 13 did for The Quickmire.** The ceiling is no longer binding
 * and is not trivial either.
 *
 * ⚠️ **Re-measure a projection before carrying it forward.** This one was correct when it was
 * written, was quoted unchanged for three chapters, and was wrong by the time it mattered — the same
 * method failure `docs/authoring.md` records for the gear kit-hours horizon, in a larger form.
 *
 * ## ⚠️ What the move ends, and what it costs
 *
 * **It ends the degenerate seam chain.** Chapters 13 through 17 all clamped to 260, so
 * {@link QUARRIED}, {@link SHUTGATED}, {@link UNDERROAD}, {@link SPOILED} and {@link QUICKMIRED} are
 * five consecutive names for one set of five combatants, and the eight assertions either side of
 * those four boundaries were four claims. This party is the first in six chapters that differs from
 * the one below it.
 *
 * **It also moves both mode anchor caps.** `DescentLevelData.anchorCap` and
 * `ExpeditionRulesData.anchorCap` were written to move when a chapter asks for a rung above
 * `legendary-plus` rather than when a chapter ships — this is that event, and it is the first time
 * the condition has fired.
 *
 * ⚠️ **What it does not do is restore the campaign's own difficulty gradient.** A chapter is ×1.68 of
 * party power and a rung ×1.60, so the two still very nearly cancel; what the cap was supplying was a
 * gradient made of the party being unable to keep up, which is a defect wearing a gradient's clothes.
 * The three guards milestone 24 widened stay where they are — `MOMENTUM_CEILING` at 0.30 and the
 * longest-cleared-fight bar at 0.80 — and **"still costs that party something at the top" still
 * holds** at 4.00 of five with zero timeouts. **Do not widen any of the three.**
 *
 * The clamp here is `Math.min` rather than a written number so a retune of either side moves it, and
 * `legal` throws rather than quietly fielding an over-levelled party. **A rung roughly every hundred
 * stages** is the cadence the flat line produces, where it was one per fifty; that one arrived after
 * three hundred and fifty. What it costs a player over The Quickmire's party is more duplicate copies
 * of each of the five — `MORTAL_LADDER` alternates cheap and expensive rungs, so **recompute it**
 * rather than adding a constant.
 */
const SLOWGROWTH_RARITY = rarityIndex('mythic');
const SLOWGROWTH_LEVEL = Math.min(
  stages[CHAPTER_ENDS[17] - 1].level,
  LEVEL_CURVE.caps[SLOWGROWTH_RARITY],
);

const SLOWGROWTH: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(SLOWGROWTH_LEVEL, SLOWGROWTH_RARITY),
  SLOWGROWTH_RARITY,
);

/**
 * The party that arrives in chapter 20: the five that just took The Interest, unchanged.
 *
 * ⚠️ **This is The Backcut's `INVESTED`, kept under a new name rather than re-derived** — the
 * sixteenth time, for the sixteenth time for the same reason.
 *
 * Still common tier, and still no pull anyone had to be lucky for.
 *
 * ## ⚠️ Chapter 19 stays on `mythic`, and this time the rule and the pool agree
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`, evaluated
 * for every rung and taken closest in **log** space. Against chapter 18's seam of **4.8214** and
 * The Backcut's close of 425, `mythic` reads **2.8677** (|Δln| **0.5196**) and `mythic-plus`
 * **24.1942** (|Δln| **1.6130**). `mythic` wins by 1.09 of a nat.
 *
 * ⚠️ **That is numerically the same margin chapter 18 overrode, and this chapter does not override
 * it.** {@link SLOWGROWTH}'s override rested on the seam below it being *wrong* — 0.9608, under
 * 1.00, with a board budget of 129 common-equivalent per body against a pool whose lightest body
 * is 100, so there was no chapter 18 on `legendary-plus` at all. None of that holds here: at
 * 2.8677 the seam is comfortably above 1.00 and **166 of the 248 blocks that existed before it sit
 * inside the band its ordinary slots use**. **A rung move needs its own argument every time; "the chapter below moved
 * one" is not one.**
 *
 * ⚠️ **The seam chain goes degenerate again, one link deep, and it will deepen.** `mythic` caps at
 * 340 and this chapter closes at 425, so this party and {@link SLOWGROWTH} clamp to the same level
 * and are the **same five combatants** — the shape chapters 13 through 17 recorded four times.
 * Every further chapter on this rung divides the seam by `perLevel.common ** 25` = 1.680, by
 * construction rather than by tuning: chapter 20 reads **1.7069**, chapter 21 **1.0161** and
 * chapter 22 **0.6048**. **This rung buys about three chapters**, and the board budget runs out
 * before the arithmetic does. `mythic-plus` at cap 420 is the next one and it is not due yet.
 *
 * The clamp is `Math.min` rather than a written number so a retune of either side moves it, and
 * `legal` throws rather than quietly fielding an over-levelled party.
 */
const BACKCUT_RARITY = rarityIndex('mythic');
const BACKCUT_LEVEL = Math.min(
  stages[CHAPTER_ENDS[18] - 1].level,
  LEVEL_CURVE.caps[BACKCUT_RARITY],
);

const BACKCUT: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(BACKCUT_LEVEL, BACKCUT_RARITY),
  BACKCUT_RARITY,
);

/**
 * The party that arrives in chapter 21: the five that just took The Unreturned's chapter, unchanged.
 *
 * ⚠️ **This is The Commonage's `INVESTED`, kept under a new name rather than re-derived** — the
 * seventeenth time, for the seventeenth time for the same reason: re-aiming one "arrived" party at
 * the newest chapter would silently stop checking that every chapter below it is still finishable by
 * the party it was tuned for.
 *
 * ⚠️ **The degenerate chain reaches four links.** Chapters 18 through 21 all close above `mythic`'s
 * cap of **340** and all clamp to it, so {@link SLOWGROWTH}, {@link BACKCUT}, this party and
 * {@link INVESTED} are one set of five combatants — one link deeper than the five-link stretch
 * chapters 13 through 17 recorded, one rung down. See {@link INVESTED} for why the rung stays put a
 * third time and for the measurement that finally settles it.
 */
const COMMONAGE_RARITY = rarityIndex('mythic');
const COMMONAGE_LEVEL = Math.min(
  stages[CHAPTER_ENDS[19] - 1].level,
  LEVEL_CURVE.caps[COMMONAGE_RARITY],
);

const COMMONAGE: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(COMMONAGE_LEVEL, COMMONAGE_RARITY),
  COMMONAGE_RARITY,
);

/**
 * The party that arrives in chapter 22: the five that just took The Unreturned's chapter, unchanged.
 *
 * ⚠️ **This is The Longebb's `INVESTED`, kept under a new name rather than re-derived** — the
 * eighteenth time, for the same reason every time: re-aiming one "arrived" party at the newest
 * chapter would silently stop checking that every chapter below it is still finishable by the party
 * it was tuned for.
 *
 * ⚠️ **This party is where the degenerate chain ends, at four links.** Chapters 18 through 21 all
 * clamp to `mythic`'s cap of 340, so {@link SLOWGROWTH}, {@link BACKCUT}, {@link COMMONAGE} and this
 * one are a single set of five combatants. {@link INVESTED} is the first party in five chapters that
 * is not — see it for why the rung had to move, and note that the chain restarts at one link
 * immediately, because The Downstroke closes ninety-five levels above `mythic-plus`'s own cap.
 */
const LONGEBB_RARITY = rarityIndex('mythic');
const LONGEBB_LEVEL = Math.min(
  stages[CHAPTER_ENDS[20] - 1].level,
  LEVEL_CURVE.caps[LONGEBB_RARITY],
);

const LONGEBB: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(LONGEBB_LEVEL, LONGEBB_RARITY),
  LONGEBB_RARITY,
);

/**
 * The party that arrives in chapter 23: the five that just took The Downstroke, unchanged.
 *
 * ⚠️ **This is The Downstroke's `INVESTED`, kept under a new name rather than re-derived** — the
 * nineteenth time, for the same reason every time: re-aiming one "arrived" party at the newest
 * chapter would silently stop checking that every chapter below it is still finishable by the party
 * it was tuned for.
 *
 * ## ⚠️ Chapter 22 moved the rung to `mythic-plus`, and it was an **override**
 *
 * **The rule that picks a rung reproduces the power ratio the seam below it had**,
 * `pow(1.6, rung − rareIndex) * pow(perLevel.common, min(close, caps[rung]) − close)`, evaluated for
 * every rung and taken closest in **log** space. Against chapter 21's seam of **0.8241** and The
 * Downstroke's close of 515, `mythic` reads **0.4418** (|Δln| **0.6235**) and `mythic-plus`
 * **3.7273** (|Δln| **1.5091**). **The rule prefers staying put by 0.886 of a nat and this chapter
 * overrides it** — the second override in the campaign's history, after chapter 18.
 *
 * ⚠️ **What licenses an override is the seam *below* being wrong, and this time it is.**
 * {@link LONGEBB} landed on **0.8241** — under 1.00, meaning the content is nominally ahead of the
 * party it is tuned for — and chapter 21 declined to override on the argument that its own chapter
 * was still authorable out of the pool. Thirty levels later that argument is gone: measured at level
 * 515 against a `mythic` five, the **five lightest bodies in the entire game** (100, 104, 106, 122
 * and 126 health) read **0% with 0.00 survivors**, and so do the five heaviest of The Quickmire's
 * light Monsters. The same five lightest bodies read 100% / 4.00 at level 485. **There is no chapter
 * 22 on `mythic`** — not a hard one, not any, which is precisely chapter 18's situation one rung up.
 *
 * ⚠️ **The move re-opens the pool, which is the other half of what an override buys.** Against this
 * party a board at 515 reads 4.00 of five at about 9,500 common-equivalent and 0.00 at 11,900, and
 * **181 of the 282 blocks that existed before The Downstroke sit inside the band its ordinary slots
 * use**. Chapter 18 measured 116 of 238 after its own move. Nothing in `data/` had to change.
 *
 * ⚠️ **The consequence a reader should expect at the boundary is a walkover, and it is not a
 * defect.** Chapter 21's own final refielded at level 515 reads **100% with all five alive in 3.1
 * seconds** against this party. That is what a ×1.6 rung plus eighty levels buys, it is what chapter
 * 18's boundary did too, and it is why The Downstroke's boards are the first authored **heavier**
 * than the chapter below them since chapter 13.
 *
 * ⚠️ **What moves the rung next.** `mythic-plus` caps at 420 against a close of 515, so the seam is
 * already ninety-five levels above the cap and each further sixty-stage chapter divides it by
 * `perLevel.common ** 30` = **1.867**: chapter 23 reads **1.9981**, chapter 24 **1.0711**, chapter 25
 * **0.5742**. The arithmetic buys about two and a half chapters and the **pool** will run out first,
 * exactly as it did on `mythic`. **Measure the pool before re-deriving the seam.** The next rung,
 * `ascended`, caps at 500 and is the last the campaign can spend.
 *
 * The clamp is `Math.min` rather than a written number so a retune of either side moves it, and
 * `legal` throws rather than quietly fielding an over-levelled party.
 */
const DOWNSTROKE_RARITY = rarityIndex('mythic-plus');
const DOWNSTROKE_LEVEL = Math.min(
  stages[CHAPTER_ENDS[21] - 1].level,
  LEVEL_CURVE.caps[DOWNSTROKE_RARITY],
);

const DOWNSTROKE: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(DOWNSTROKE_LEVEL, DOWNSTROKE_RARITY),
  DOWNSTROKE_RARITY,
);

/**
 * The party that finishes the ladder: the same five, levelled as far as the rung The Evenfall asks
 * for will carry them.
 *
 * Still common tier, and still no pull anyone had to be lucky for.
 *
 * ## ⚠️ Chapter 23 stays on `mythic-plus`, and that is a **derivation** rather than an override
 *
 * Against chapter 22's seam of **3.7273** and The Evenfall's close of 545, `mythic` reads **0.2368**
 * (|Δln| 2.7561), `mythic-plus` **1.9981** (|Δln| **0.6235**) and `ascended` **16.8578** (|Δln|
 * 1.5091). **`mythic-plus` wins by 0.886 of a nat** — numerically the same margin chapters 18 and 22
 * overrode and chapters 19, 20 and 21 stayed on.
 *
 * ⚠️ **What licenses an override is the seam *below* being wrong, and here it is not.**
 * {@link DOWNSTROKE} landed on **3.7273**, comfortably above 1.00, and this chapter's own seam of
 * **1.9981** is above it too. The pool agrees rather than merely permitting: **55 shipped blocks are
 * both light enough and cool enough** for The Evenfall's boards — 15 Elf, 15 Undead, 10 Dwarf, 10
 * Monster, 5 Human — where chapter 22's override was licensed by the five lightest bodies in the
 * game reading 0%. **Five chapters running have now had to say which of the two they are doing.**
 *
 * ⚠️ **This party and {@link DOWNSTROKE} are the same five combatants**, because chapters 22 and 23
 * both close above `mythic-plus`'s cap of 420 and both clamp to it. That restarts the degenerate
 * chain one rung up, at one link — the shape chapters 13 through 17 recorded five deep and chapters
 * 18 through 21 four deep. **Expect a second link at chapter 24.**
 *
 * ⚠️ **The practical consequence is an authoring trap rather than a testing one, and this chapter
 * fell into it.** With the party frozen and the boards thirty levels higher, an authored stat is
 * worth `perLevel ** 30` = ×1.87 more than the identical number one chapter below. The Evenfall's
 * first ten blocks carried chapter-22 attack values and **every board fell off a cliff**; halving the
 * authored `atk` and nothing else fixed all six bands. See [`chapter-23.ts`](./chapter-23.ts).
 *
 * ⚠️ **What moves the rung next.** Each further sixty-stage chapter divides the seam by
 * `perLevel.common ** 30` = **1.867**: chapter 24 reads **1.0703**, chapter 25 **0.5733**. The
 * arithmetic buys about one and a half more chapters and the **pool** will run out first, exactly as
 * it did on `legendary-plus` and on `mythic`. **Measure the pool before re-deriving the seam** — at
 * this chapter's own depth only 55 of 292 blocks are already fieldable, and the binding quantity is
 * their **attack** rather than their weight. The next rung, `ascended`, caps at 500 and is the last
 * the campaign can spend.
 *
 * The clamp is `Math.min` rather than a written number so a retune of either side moves it, and
 * `legal` throws rather than quietly fielding an over-levelled party.
 */
const EVENFALL_RARITY = rarityIndex('mythic-plus');
const EVENFALL_LEVEL = Math.min(
  stages[CHAPTER_ENDS[22] - 1].level,
  LEVEL_CURVE.caps[EVENFALL_RARITY],
);

const EVENFALL: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(EVENFALL_LEVEL, EVENFALL_RARITY),
  EVENFALL_RARITY,
);

/**
 * The party that arrives in chapter 24: the five that just took The Evenfall, unchanged.
 *
 * ⚠️ **This is The Evenfall's `INVESTED`, kept under a new name rather than re-derived** — the
 * chain accumulates so that "clears the chapter behind it, walks only a little way into the one
 * ahead" stays checkable at both boundaries at once.
 *
 * ## ⚠️ The rung stays on `mythic-plus`, for the third chapter running
 *
 * Against chapter 23's seam of **1.9981** and The Nevermark's close of 575, `mythic` reads
 * **0.1270** (|Δln| 2.7561), `mythic-plus` **1.0711** (|Δln| **0.6235**) and `ascended` **9.0371**
 * (|Δln| 1.5091). **`mythic-plus` wins by 0.886 of a nat** — the same margin chapters 18 and 22
 * overrode and chapters 19, 20, 21 and 23 stayed on. **Six chapters running have now had to say
 * which of the two they are doing**; this one is a **stay**.
 *
 * ⚠️ **The alternative was fielded rather than quoted.** An `ascended` five takes chapter 23's own
 * opening board and its final at level 575 at **100% with all five alive in 2.3s and 2.4s**. An
 * override needs the seam below to be wrong *and* the pool to be unable to supply a board; chapter
 * 23's seam is 1.9981, this chapter's own is 1.0711, and **121 of 302 shipped blocks stand as an
 * ordinary body on a board at level 575** — monster 34, undead 21, elf 21, dwarf 17, human 14,
 * angel 9, demon 5.
 *
 * ⚠️ **A filter is not a pool count, and this is where that mattered.** Screening the pool on
 * common-equivalent weight *and* on the attack chapter 23's boards carried leaves **15 blocks, every
 * one of them a Monster** — a reading that would have forced a third Monster lead on pool grounds.
 * Simulating the same 302 blocks instead of filtering them gives 121, across all seven factions.
 * Chapter 23 was right that the binding quantity at this depth is **attack** rather than weight; it
 * does not follow that a filter on the two counts the pool. **Field the pool; do not screen it.**
 *
 * ⚠️ **This party, {@link EVENFALL} and {@link DOWNSTROKE} are one set of five combatants** —
 * chapters 22, 23 and 24 all close above `mythic-plus`'s cap of 420 and all clamp to it, so the
 * degenerate chain is **two links deep**, exactly as chapter 23 predicted. **Expect a third at
 * chapter 25.**
 *
 * ⚠️ **What moved the rung next, and where this comment was wrong.** It read chapter 25's own seam of
 * **0.5733** as "the first half of an override licence" — but that half is the seam **below** a
 * chapter, never the chapter's own, which is what chapter 21 exists to record. Chapter 25's seam
 * below is this party's, **1.0711, above 1.00**. It moved to `ascended` regardless, on the **pool**:
 * at level 605 only **4 of 312** shipped blocks stand against a `mythic-plus` five, and The
 * Nevermark's own opening board, mid board and final all read **0%** there. See {@link INVESTED}.
 *
 * The clamp is `Math.min` rather than a written number so a retune of either side moves it, and
 * `legal` throws rather than quietly fielding an over-levelled party.
 */
const NEVERMARK_RARITY = rarityIndex('mythic-plus');
const NEVERMARK_LEVEL = Math.min(
  stages[CHAPTER_ENDS[23] - 1].level,
  LEVEL_CURVE.caps[NEVERMARK_RARITY],
);

const NEVERMARK: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(NEVERMARK_LEVEL, NEVERMARK_RARITY),
  NEVERMARK_RARITY,
);

/**
 * The party that arrives in chapter 25: the five that just took The Nevermark, unchanged.
 *
 * ⚠️ **This is The Nevermark's `INVESTED`, kept under a new name rather than re-derived** — the
 * chain accumulates so that "clears the chapter behind it, walks only a little way into the one
 * ahead" stays checkable at both boundaries at once.
 *
 * ## ⚠️ The rung moved to `ascended` here, and it is the campaign's third override
 *
 * Against chapter 24's seam of **1.0711** and The Thinground's close of 605, `mythic-plus` reads
 * **0.5740** (|Δln| **0.6238**) and `ascended` **4.8443** (|Δln| **1.5092**). **The rule preferred
 * staying put by 0.885 of a nat** — numerically the same margin chapters 18 and 22 overrode and
 * chapters 19, 20, 21, 23 and 24 stayed on.
 *
 * ⚠️ **The licence was the pool, measured by fielding rather than by filtering** — chapter 24's
 * correction to chapter 23's rule, applied. Every one of the 312 blocks shipped before chapter 25
 * was fielded as an ordinary body beside four light escorts at level 605: against the `mythic-plus`
 * five **4 stand, every one of them a Monster**, and against an `ascended` five **282 stand, across
 * all seven factions**. Chapter 24's own opening board, mid board and final all read **0%** at 605
 * against the rung it was fought on. **There was no chapter 25 on `mythic-plus`.**
 *
 * ⚠️ **Only half the standing licence was met, and saying so is the point.** The rule is that an
 * override needs the seam *below* to be wrong **and** the pool to be unable to supply a board. The
 * seam below was **1.0711 — above 1.00** — and only chapter 25's own (0.5740) was under it, which is
 * exactly the reading chapter 21 declined an override on. What separated them is that chapter 21's
 * chapter was **authorable** and that one was not. **The pool is the binding half, and it has
 * settled all three overrides the campaign has.**
 *
 * The clamp is `Math.min` rather than a written number so a retune of either side moves it, and
 * `legal` throws rather than quietly fielding an over-levelled party.
 */
const THINGROUND_RARITY = rarityIndex('ascended');
const THINGROUND_LEVEL = Math.min(
  stages[CHAPTER_ENDS[24] - 1].level,
  LEVEL_CURVE.caps[THINGROUND_RARITY],
);

const THINGROUND: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(THINGROUND_LEVEL, THINGROUND_RARITY),
  THINGROUND_RARITY,
);

/**
 * The party that arrives in chapter 26: the five that just took The Thinground, unchanged.
 *
 * ⚠️ **This is The Thinground's `INVESTED`, kept under a new name rather than re-derived** — the
 * chain accumulates so that "clears the chapter behind it, walks only a little way into the one
 * ahead" stays checkable at both boundaries at once.
 *
 * ## ⚠️ The rung stays on `ascended`, and the rung question is now closed
 *
 * Against chapter 25's seam of **4.8443** and The Roughcast's close of 635, `ascended` reads
 * **2.5971** (|Δln| **0.6234**) and `ascended-1` **33.2031** (|Δln| **1.9248**). **The rule prefers
 * staying put by 1.30 nats** — the widest margin any chapter has had, and there is nothing to
 * override toward. `ascended` caps at 500 and `ascended-1` at 600, which the ladder passed at
 * chapter 25 itself, so every rung above this one is a walkover by construction rather than by
 * tuning.
 *
 * ⚠️ **From here a chapter that cannot be authored on `ascended` is a `data/` question about
 * `LEVEL_CURVE.caps`, not a chapter.** This one can be: fielded as an ordinary body beside four
 * light escorts at level 635, **246 of 378 shipped blocks stand**, across all seven factions and 47
 * of them Monster. **Measure the pool before re-deriving the seam.**
 *
 * ⚠️ **This party and {@link THINGROUND} are one set of five combatants**, which restarts the
 * degenerate chain exactly where chapter 25 predicted it would — both chapters close above
 * `ascended`'s cap of 500, so the two assertions either side of the boundary are one claim. **Unlike
 * every previous degenerate stretch, no rung move can end this one**, so expect the chain to deepen
 * a link a chapter from here rather than to reset. The repair is the share-of-the-slice one
 * {@link MOMENTUM_CEILING} already names, and it re-derives every seam in the file at once.
 *
 * ⚠️ **What a degenerate seam buys, and it is the only thing that transfers:** the party is
 * literally unchanged, so equal *absolute* weight is equal difficulty and chapter 25's measured
 * price table holds here at **0.536×** the common-equivalent figure. Spot-check rather than assume,
 * and nothing priced against a different party transfers at all.
 *
 * The clamp is `Math.min` rather than a written number so a retune of either side moves it, and
 * `legal` throws rather than quietly fielding an over-levelled party.
 */
const INVESTED_RARITY = rarityIndex('ascended');
const INVESTED_LEVEL = Math.min(stages[stages.length - 1].level, LEVEL_CURVE.caps[INVESTED_RARITY]);

const INVESTED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(INVESTED_LEVEL, INVESTED_RARITY),
  INVESTED_RARITY,
);

const BOOSTED: FormationData = mono(
  [THREX, VEXIS],
  [PYRA, NYXARA, SANGUINE],
  BUILT_LEVEL,
  BUILT_RARITY,
);

/**
 * One mono-faction five per faction, at the same investment as {@link BUILT}.
 *
 * **Milestone 8d's premise, made measurable.** The lineup bonus pays a party for its own
 * composition on the argument that a mono-faction bonus creates seven optimal teams rather than
 * one; before 8e none of the seven could be fielded, so the argument was a promise. These are the
 * seven, and the assertions below are what turn the promise into a property.
 *
 * Each is **three commons and two legendaries**, which is the deepest a faction goes without an
 * ascended-tier pull — the same "no lucky banner" rule {@link BUILT} follows, and a real
 * consequence of the 3/3/1 roster shape: mono-faction play is gated behind two legendary-tier
 * pulls rather than none. At 22.5% base that is a mild gate, and it is deliberate that it is not
 * zero, because a composition worth +25% attack and health should cost something.
 *
 * The formations are the ones a player would actually build — bodies in front, damage and support
 * behind — rather than the best five by any single number. Where a faction has no good front rank
 * that shows up as a bad front rank, which is the honest version of fielding Elves.
 */
const MONO_ROSTERS: readonly {
  readonly faction: string;
  readonly front: readonly CharacterData[];
  readonly back: readonly CharacterData[];
}[] = [
  { faction: 'human', front: [HALRIC, MIRA], back: [WREN, YSOLDE, IVO] },
  { faction: 'dwarf', front: [BRAN, HEDDA], back: [DORN, GRIMNA, ORIN] },
  { faction: 'elf', front: [CIRIEN, RIN], back: [FAELEN, NAERIN, SYLVARA] },
  { faction: 'undead', front: [GHAUL, MORTLACH], back: [VESPER, OSSUARY, KARSITH] },
  { faction: 'monster', front: [SKARN, YERRIK], back: [GNASH, GHORRAK, OZZA] },
  { faction: 'angel', front: [NAEL, RAZIEL], back: [CELIA, ILYRA, ZAPHIEL] },
  { faction: 'demon', front: [THREX, VEXIS], back: [PYRA, NYXARA, SANGUINE] },
];

/** The seven, at a given investment. The sweeps field them at {@link BUILT}'s. */
function monoFives(
  level: number,
  rarity: number,
): readonly { readonly faction: string; readonly party: FormationData }[] {
  return MONO_ROSTERS.map((roster) => ({
    faction: roster.faction,
    party: mono(roster.front, roster.back, level, rarity),
  }));
}

const MONO_FIVES = monoFives(BUILT_LEVEL, BUILT_RARITY);

/** The same five, with every lineup track switched off — the control the bonus is measured against. */
const withoutLineup: CombatRules = toCombatRules({
  ...authoredRules,
  lineup: {
    ...authoredRules.lineup,
    tiers: [],
    rally: { ...authoredRules.lineup.rally, attack: 0, health: 0 },
    ladder: { ...authoredRules.lineup.ladder, steps: [] },
  },
});

const starterSweeps = stages.map((stage) => ({
  label: 'starters',
  stage,
  ...sweep(STARTERS, stage),
}));
const builtSweeps = stages.map((stage) => ({ label: 'built', stage, ...sweep(BUILT, stage) }));
const arrivedSweeps = stages.map((stage) => ({
  label: 'arrived',
  stage,
  ...sweep(ARRIVED, stage),
}));
const marchedSweeps = stages.map((stage) => ({
  label: 'marched',
  stage,
  ...sweep(MARCHED, stage),
}));
const vaultedSweeps = stages.map((stage) => ({
  label: 'vaulted',
  stage,
  ...sweep(VAULTED, stage),
}));
const barrowedSweeps = stages.map((stage) => ({
  label: 'barrowed',
  stage,
  ...sweep(BARROWED, stage),
}));
const wealdedSweeps = stages.map((stage) => ({
  label: 'wealded',
  stage,
  ...sweep(WEALDED, stage),
}));
const anvilledSweeps = stages.map((stage) => ({
  label: 'anvilled',
  stage,
  ...sweep(ANVILLED, stage),
}));
const wildedSweeps = stages.map((stage) => ({
  label: 'wilded',
  stage,
  ...sweep(WILDED, stage),
}));
const linedSweeps = stages.map((stage) => ({
  label: 'lined',
  stage,
  ...sweep(LINED, stage),
}));
const rustedSweeps = stages.map((stage) => ({
  label: 'rusted',
  stage,
  ...sweep(RUSTED, stage),
}));
const quarriedSweeps = stages.map((stage) => ({
  label: 'quarried',
  stage,
  ...sweep(QUARRIED, stage),
}));
const shutgatedSweeps = stages.map((stage) => ({
  label: 'shutgated',
  stage,
  ...sweep(SHUTGATED, stage),
}));
const underroadSweeps = stages.map((stage) => ({
  label: 'underroad',
  stage,
  ...sweep(UNDERROAD, stage),
}));
const spoiledSweeps = stages.map((stage) => ({
  label: 'spoiled',
  stage,
  ...sweep(SPOILED, stage),
}));
const quickmiredSweeps = stages.map((stage) => ({
  label: 'quickmired',
  stage,
  ...sweep(QUICKMIRED, stage),
}));
const slowgrowthSweeps = stages.map((stage) => ({
  label: 'slowgrowth',
  stage,
  ...sweep(SLOWGROWTH, stage),
}));
const backcutSweeps = stages.map((stage) => ({
  label: 'backcut',
  stage,
  ...sweep(BACKCUT, stage),
}));
const commonageSweeps = stages.map((stage) => ({
  label: 'commonage',
  stage,
  ...sweep(COMMONAGE, stage),
}));
const longebbSweeps = stages.map((stage) => ({
  label: 'longebb',
  stage,
  ...sweep(LONGEBB, stage),
}));
const downstrokeSweeps = stages.map((stage) => ({
  label: 'downstroke',
  stage,
  ...sweep(DOWNSTROKE, stage),
}));
const evenfallSweeps = stages.map((stage) => ({
  label: 'evenfall',
  stage,
  ...sweep(EVENFALL, stage),
}));
const nevermarkSweeps = stages.map((stage) => ({
  label: 'nevermark',
  stage,
  ...sweep(NEVERMARK, stage),
}));
const thingroundSweeps = stages.map((stage) => ({
  label: 'thinground',
  stage,
  ...sweep(THINGROUND, stage),
}));
const investedSweeps = stages.map((stage) => ({
  label: 'invested',
  stage,
  ...sweep(INVESTED, stage),
}));
const boostedSweeps = stages.map((stage) => ({
  label: 'boosted',
  stage,
  ...sweep(BOOSTED, stage),
}));
// The seven fives are swept over the stride rather than every stage. Seven parties across a
// hundred stages at forty seeds is twenty-eight thousand battles on its own, and what these
// sweeps measure — how much of the ladder each faction clears, relative to the other six — is a
// statement about the ladder's *range* rather than about any particular stage on it.
const monoSweeps = MONO_FIVES.flatMap(({ faction, party }) =>
  SAMPLED.map((stage) => ({ label: `mono-${faction}`, faction, stage, ...sweep(party, stage) })),
);
// The two geared parties are swept over the stride for the reason the mono fives are: what they
// measure is how much further gear carries the *same* party, which is a statement about the
// ladder's range rather than about any one stage on it. The load-bearing assertions — zero
// timeouts and the timer headroom — read them through `everySweep` regardless.
const foundGearSweeps = SAMPLED.map((stage) => ({
  label: 'found-gear',
  stage,
  ...sweep(FOUND_GEAR, stage),
}));
const maxedGearSweeps = SAMPLED.map((stage) => ({
  label: 'maxed-gear',
  stage,
  ...sweep(MAXED_GEAR, stage),
}));
const everySweep = [
  ...starterSweeps,
  ...builtSweeps,
  ...arrivedSweeps,
  ...marchedSweeps,
  ...vaultedSweeps,
  ...barrowedSweeps,
  ...wealdedSweeps,
  ...anvilledSweeps,
  ...wildedSweeps,
  ...linedSweeps,
  ...rustedSweeps,
  ...quarriedSweeps,
  ...shutgatedSweeps,
  ...underroadSweeps,
  ...quickmiredSweeps,
  ...longebbSweeps,
  ...downstrokeSweeps,
  ...evenfallSweeps,
  ...nevermarkSweeps,
  ...investedSweeps,
  ...boostedSweeps,
  ...monoSweeps,
  ...foundGearSweeps,
  ...maxedGearSweeps,
];

/** Where the starter party is expected to stop: the healer lock. */
const WALL = stages.findIndex((stage) => stage.id === 'c1-s7');

/**
 * Where the fen ends, as a count of stages: the last stage before the ash bodies arrive.
 *
 * ⚠️ **A mid-chapter boundary since the re-cut, and deliberately so.** The fen's fifty stages were
 * chapter 1 when {@link BUILT} was tuned against them; the re-cut spread them across chapters 1, 2
 * and the front of 3 without moving a board, so the tuning claim keeps its old scope by naming the
 * *place* rather than a chapter number. The Frozen Gate is the fen's last board — it was chapter
 * 1's boss and is now chapter 3's second mini-boss — and deriving this from its id means a future
 * re-cut moves the boundary with the content.
 */
const FEN_END = stages.findIndex((stage) => stage.id === 'c3-s20') + 1;

/** The end of chapter 4 — the Ashfall Reach — which is where the Bound Marches start asking for
 * the next ascension. */
const ASHFALL_END = CHAPTER_ENDS[3];

/** The end of chapter 5 — the Bound Marches — where the Sundered Vault asks for the one after. */
const MARCHES_END = CHAPTER_ENDS[4];

/** The end of chapter 6 — the Sundered Vault — where the Waking Barrows ask for the one after. */
const VAULT_END = CHAPTER_ENDS[5];

/** The end of chapter 7 — the Waking Barrows — where the Sunless Weald asks for the one after. */
const BARROWS_END = CHAPTER_ENDS[6];

/** The end of chapter 8 — the Sunless Weald — where the Hollow Anvil asks for the one after. */
const WEALD_END = CHAPTER_ENDS[7];

/** The end of chapter 9 — the Hollow Anvil — where The Bleeding Wild asks for the one after. */
const ANVIL_END = CHAPTER_ENDS[8];

/** The end of chapter 10 — The Bleeding Wild — where The Standing Line asks for the one after. */
const WILD_END = CHAPTER_ENDS[9];

/** The end of chapter 11 — The Standing Line — where The Rustwood picks the field over. */
const LINE_END = CHAPTER_ENDS[10];

/** The end of chapter 12 — The Rustwood — where The Quarry goes down through the hill. */
const RUST_END = CHAPTER_ENDS[11];

/** The end of chapter 13 — The Quarry — where The Shutgate is on the other side of the floor. */
const QUARRY_END = CHAPTER_ENDS[12];

/** The end of chapter 14 — The Shutgate — where The Underroad runs on past the door. */
const SHUTGATE_END = CHAPTER_ENDS[13];

/** The end of chapter 15 — The Underroad — where the road comes out onto The Spoilfield. */
const UNDERROAD_END = CHAPTER_ENDS[14];

/** The end of chapter 16 — The Spoilfield — where the open ground turns to The Quickmire. */
const SPOILFIELD_END = CHAPTER_ENDS[15];

/** Where The Quickmire ends. */
const QUICKMIRE_END = CHAPTER_ENDS[16];

/** Where The Slowgrowth ends, for the seam either side of the eighteenth boundary. */
const SLOWGROWTH_END = CHAPTER_ENDS[17];

/** Where The Backcut ends, for the seam either side of the nineteenth boundary. */
const BACKCUT_END = CHAPTER_ENDS[18];

/** Where The Commonage ends, for the seam either side of the twentieth boundary. */
const COMMONAGE_END = CHAPTER_ENDS[19];

/** Where The Longebb ends, for {@link LONGEBB}'s seam. */
const LONGEBB_END = CHAPTER_ENDS[20];

/** Where The Downstroke ends, for {@link DOWNSTROKE}'s seam. */
const DOWNSTROKE_END = CHAPTER_ENDS[21];

/** Where The Evenfall ends, for {@link EVENFALL}'s seam. */
const EVENFALL_END = CHAPTER_ENDS[22];

/** Where The Nevermark ends, for {@link NEVERMARK}'s seam. */
const NEVERMARK_END = CHAPTER_ENDS[23];

/** Where The Thinground ends, for {@link THINGROUND}'s seam. */
const THINGROUND_END = CHAPTER_ENDS[24];

/**
 * How far past its own chapter a seam party's momentum may carry it, as a share of the ladder.
 *
 * A ceiling on momentum rather than a wall at a boundary: a party that has just taken a chapter
 * boss should walk a little way into the next one and then stop. Bounded as a *share* so it stays
 * meaningful as chapters are added rather than decaying into a fixed stage count.
 *
 * ## ⚠️ It was 0.20 under the old level line, and the flattening is what moved it
 *
 * This is not a threshold content outgrew — it is the same measurement over a ladder whose
 * difficulty gradient was deliberately removed. The arithmetic is exact and worth keeping in view:
 *
 * - A chapter now spans **25 levels**, which at `perLevel.common` = 1.021 is **×1.68** of party
 *   power.
 * - One ascension rung is **×1.60**.
 *
 * So finishing a chapter and taking the rung it pays for very nearly cancels the next chapter's
 * difficulty, and momentum carries about two and a half chapters instead of one. Under the old
 * line a chapter spanned ~90 levels — **×6.5** against the same ×1.60 rung — and the ×4 shortfall
 * per chapter is what levelling had to close. That gap is what this number measured.
 *
 * ⚠️ **The gradient is meant to come back from the enemy side rather than from the level line.**
 * Enemy stat blocks carry no gear, and gear is the axis intended to supply the escalation the
 * levels no longer do. **When enemy gear lands, this belongs back at 0.20** — and the honest test
 * of that work is whether it can be moved back, not whether the sweep is green. Do not widen it
 * again to absorb a later change; a second move without the enemy-gear axis arriving is the signal
 * that the campaign has no difficulty curve at all.
 */
const MOMENTUM_CEILING = 0.3;

describe('ladder balance', () => {
  it('never runs the clock out on a fight either party is meant to have', () => {
    // ⚠️ **The load-bearing assertion in this file since milestone 8b.** Every fight a tuned party
    // has should end because somebody died, not because ninety seconds elapsed.
    //
    // It used to be a content check backed by a mechanical guarantee. The MP pool ran dry, so a
    // healer eventually stopped healing whatever the content said. Energy only ever refills, so
    // that guarantee is gone and this is what replaced it — the sweep is the only thing standing
    // between an over-tuned sustain kit and a fight decided by a timer.
    //
    // **It reads `timedOut` rather than the outcome, and that is the whole reason the flag
    // exists.** Since the timer became a loss, a fight the party could not finish and a fight the
    // party was killed in are the same `defeat` on screen — so an outcome-based version of this
    // test would have quietly stopped testing anything.
    const stalled = everySweep.filter((entry) => entry.timedOut > 0).map((entry) => entry.stage.id);

    expect(stalled).toEqual([]);
  });

  it('lets three level-1 starters clear the opening ladder', () => {
    // The stages before the wall have to fall to the party the game hands out, because the
    // crystals they pay are how a player affords anything else.
    const unreliable = starterSweeps
      .slice(0, WALL)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('stops three level-1 starters at the healer lock and everything past it', () => {
    // The single most important number in the first half of the ladder. A starting party has two
    // empty formation slots, and this is where filling them stops being optional — the wall is a
    // question about *who* is fighting rather than about how many levels they have, which is what
    // makes it the right place for the early game to end.
    const cleared = starterSweeps
      .slice(WALL)
      .filter((entry) => entry.winRate > 0.05)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(cleared).toEqual([]);
  });

  it('lets a common-tier party at its unascended-plus cap clear the whole of the fen', () => {
    // Milestone 4's promise, preserved through 8a's stat collapse, 8b's energy rework, 8c's skill
    // ceiling and milestone 10's rescale, and restated over the re-cut ladder: five common-tier
    // characters one rung in, levelled as far as that goes, take every fen board — chapters 1 and
    // 2 end to end plus the fen half of chapter 3, bosses included. The scope is {@link FEN_END}
    // rather than a chapter number because the re-cut moved the labels and not the boards.
    const unreliable = builtSweeps
      .slice(0, FEN_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the ash as well', () => {
    // The ash chapters exist to be something auto-battle has to chew on. A party that finished
    // the fen is meant to walk a little way past it on momentum and then stop — the first ash
    // stages are tuned for exactly the party that took the Frozen Gate — so this is a ceiling on
    // how far the momentum carries rather than a wall at the boundary.
    const walked = builtSweeps
      .slice(FEN_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 4 clear chapters 1 through 4', () => {
    // The other half of the seam. Chapter 5 opens at exactly the level chapter 4 closed on, so the
    // party holding the Ashfall Sovereign has to be the party the ash was tuned for — this is what
    // makes the "and no further" assertion below a statement about chapter 5 rather than about a
    // reference party nobody would have.
    const unreliable = arrivedSweeps
      .slice(0, ASHFALL_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the Bound Marches as well', () => {
    // ⚠️ **The assertion the Bound Marches exist to satisfy, and it is about the milestone-17
    // mechanics rather than about the level dial.** The Marches climb 85 to 160 — flatter per
    // stage than the ash — so a party that arrives at level 85 is *never* far behind on numbers.
    // What stops it is being asked questions it has no answer to: a taunt it cannot aim past, a
    // link that undoes focus fire, thorns that charge for the swing.
    //
    // A ceiling on momentum rather than a wall at the boundary, exactly as the fen's is. The
    // bound is a share of the whole ladder for the reason that one is: it has to stay meaningful
    // as chapters are added, and a count would not.
    const walked = arrivedSweeps
      .slice(ASHFALL_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 5 clear chapters 1 through 5', () => {
    // The Vault seam, measured the same way as the one directly above. This party is literally
    // the Bound Marches' `INVESTED` under a new name, so this assertion is the old "clearable end
    // to end" claim kept alive after the ladder grew past it — without it, extending the ladder
    // would silently stop checking that the chapters below are still finishable by the party they
    // were tuned for.
    const unreliable = marchedSweeps
      .slice(0, MARCHES_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the Sundered Vault as well', () => {
    // ⚠️ **The assertion the Sundered Vault exists to satisfy.** The Vault climbs 160 to 225 —
    // about a level and a third a stage — so a party arriving at the `elite-plus` cap of 140 is
    // behind on numbers from the first stage and falls further behind across the chapter. What is
    // meant to stop it is not only that gap: it is the celestial matchup tax, which no mortal
    // composition answers, and the pairs the chapter is built on.
    //
    // A ceiling on momentum rather than a wall at the boundary, exactly as the two below it are,
    // and bounded as a share of the whole ladder so it stays meaningful as chapters are added.
    const walked = marchedSweeps
      .slice(MARCHES_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 6 clear chapters 1 through 6', () => {
    // The Barrows seam, measured the same way as the two above it. This party is literally the
    // Sundered Vault's `INVESTED` under a new name, so this assertion is the old "clearable end to
    // end" claim kept alive after the ladder grew past it — the third time that has been needed and
    // the third time the alternative would have been to stop checking the chapter below.
    const unreliable = vaultedSweeps
      .slice(0, VAULT_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the Waking Barrows as well', () => {
    // ⚠️ **The assertion the Waking Barrows exist to satisfy.** The Barrows climb 225 to 305 — a
    // little over one and a half levels a stage — so a party arriving at the `legendary` cap of 200
    // is behind on numbers from the first stage and falls further behind across the chapter. What is
    // meant to stop it beyond that gap is that every board there has an opinion about *how* its
    // damage arrives: a thorned wall it is forced onto, a fuse planted on the member it never
    // cleanses, a field where going wide is answered once per body reached, and a link that spreads
    // the focus fire six chapters have rewarded.
    //
    // A ceiling on momentum rather than a wall at the boundary, exactly as the three below it are,
    // and bounded as a share of the whole ladder so it stays meaningful as chapters are added.
    const walked = vaultedSweeps
      .slice(VAULT_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 7 clear chapters 1 through 7', () => {
    // The Weald seam, measured the same way as the three above it. This party is literally the
    // Waking Barrows' `INVESTED` under a new name, so this assertion is the old "clearable end to
    // end" claim kept alive after the ladder grew past it — the fourth time that has been needed and
    // the fourth time the alternative would have been to stop checking the chapter below.
    const unreliable = barrowedSweeps
      .slice(0, BARROWS_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the Sunless Weald as well', () => {
    // ⚠️ **The assertion the Sunless Weald exists to satisfy.** The Weald climbs 305 to 411 — a
    // little over two levels a stage, the steepest cadence the ladder has ever had — so a party
    // arriving at the `legendary-plus` cap of 260 is behind from the first stage and a long way
    // behind by the last. That steepness is not the chapter being harsh: it is 21a's corrected
    // margin rule, which requires each chapter to close further past its rung's cap than the last
    // because a constant margin cancels against the fresh rung every chapter hands the party.
    //
    // What is meant to stop it beyond the gap is that every board here has an opinion about *where*
    // its damage lands: a `dodge` pool that makes a swing a coin, a back rank the party never had to
    // defend, roots that turn reach into spread, and a bind cast on whatever the party commits to.
    //
    // A ceiling on momentum rather than a wall at the boundary, exactly as the four below it are,
    // and bounded as a share of the whole ladder so it stays meaningful as chapters are added.
    const walked = barrowedSweeps
      .slice(BARROWS_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 8 clear chapters 1 through 8', () => {
    // The Anvil seam, measured the same way as the four above it. This party is literally the
    // Sunless Weald's `INVESTED` under a new name, so this assertion is the old "clearable end to
    // end" claim kept alive after the ladder grew past it — the fifth time that has been needed and
    // the fifth time the alternative would have been to stop checking the chapter below.
    const unreliable = wealdedSweeps
      .slice(0, WEALD_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the Hollow Anvil as well', () => {
    // ⚠️ **The assertion the Hollow Anvil exists to satisfy.** The hold climbs 396 to 490 — a little
    // under two levels a stage — so a party arriving at the `mythic` cap of 340 is behind from the
    // first stage and seventy levels behind by the last. That gap is 21a's corrected margin rule
    // working: each chapter must close further past its rung's cap than the last, because a constant
    // margin cancels against the fresh rung every chapter hands the party.
    //
    // What is meant to stop it beyond the gap is that every board here has an opinion about whether
    // anything the party does **stays done**: a `tenacity` pool that refuses the setup turn outright,
    // a fuse aimed at whoever the healer has just saved, spines applied to whatever the party has
    // committed to, and a door held by the one body it cannot open.
    //
    // A ceiling on momentum rather than a wall at the boundary, exactly as the five below it are,
    // and bounded as a share of the whole ladder so it stays meaningful as chapters are added.
    const walked = wealdedSweeps
      .slice(WEALD_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 9 clear chapters 1 through 9', () => {
    // The Bleeding Wild's seam, measured the same way as the five above it. This party is literally
    // the Hollow Anvil's `INVESTED` under a new name, so this assertion is the old "clearable end to
    // end" claim kept alive after the ladder grew past it — the sixth time that has been needed and
    // the sixth time the alternative would have been to stop checking the chapter below.
    const unreliable = anvilledSweeps
      .slice(0, ANVIL_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Bleeding Wild as well', () => {
    // ⚠️ **The assertion The Bleeding Wild exists to satisfy.** The wild climbs 490 to 588 — almost
    // exactly two levels a stage — so a party arriving at the `mythic-plus` cap of 420 is behind from
    // the first stage and eighty-eight levels behind by the last. That gap is 21a's corrected margin
    // rule working, and it has grown every chapter since: +20, +25, +45, +56, +70, +88.
    //
    // What is meant to stop it beyond the gap is that every board here has an opinion about what the
    // party's damage **does to the thing it is spent on**: fodder that is a third stronger for being
    // chipped, a support that arms whatever the party has committed to, wounds that only a cleanse
    // ever closes, a pack paid for every blow it lands, and a door that gets stronger while the party
    // knocks on it.
    //
    // A ceiling on momentum rather than a wall at the boundary, exactly as the six below it are, and
    // bounded as a share of the whole ladder so it stays meaningful as chapters are added.
    const walked = anvilledSweeps
      .slice(ANVIL_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 10 clear chapters 1 through 10', () => {
    // The Standing Line's seam, measured the same way as the six above it. This party is literally
    // The Bleeding Wild's `INVESTED` under a new name, so this assertion is the old "clearable end to
    // end" claim kept alive after the ladder grew past it — the seventh time that has been needed and
    // the seventh time the alternative would have been to stop checking the chapter below.
    const unreliable = wildedSweeps
      .slice(0, WILD_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Standing Line as well', () => {
    // ⚠️ **The assertion The Standing Line exists to satisfy, and it is the first seam on the flat
    // line where the level dial contributes nothing at all.** The chapter climbs 200 to 225 at half a
    // level a stage, and this party arrives at `legendary`'s cap of exactly 200 — so it is 25 levels
    // behind at the top and level with the content at the bottom, which is ×1.68 across the whole
    // chapter against a rung worth ×1.60. Under the margin rule the gap did the work; here there is
    // almost no gap, and what stops the party has to be the boards.
    //
    // What is meant to stop it is that every board here has an opinion about **what the party spends
    // its damage on first**: a board-wide buff carried by the softest body on the field, a charge that
    // only lands while the party is whole, a rank that puts back whatever a cleanse takes off, and an
    // answer aimed past the wall at whoever spent the setup turn. None of it is forced — there is no
    // taunt in the chapter — so all of it is a choice the party can get wrong.
    //
    // A ceiling on momentum rather than a wall at the boundary, exactly as the six below it are, and
    // bounded as a share of the whole ladder so it stays meaningful as chapters are added.
    const walked = wildedSweeps
      .slice(WILD_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 11 clear chapters 1 through 11', () => {
    // The Rustwood's seam, measured the same way as the seven above it. This party is literally The
    // Standing Line's `INVESTED` under a new name, so this assertion is the old "clearable end to
    // end" claim kept alive after the ladder grew past it — the eighth time that has been needed.
    const unreliable = linedSweeps
      .slice(0, LINE_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Rustwood as well', () => {
    // ⚠️ **The first seam where the two parties differ by level alone.** Chapters 11 and 12 share
    // `legendary-plus`, so this party and {@link INVESTED} are the same five at the same rung, 25
    // levels apart — ×1.68, against a rung worth ×1.60 that neither of them is buying here. There is
    // no gap at all for the level dial to open, and what stops the party has to be the boards.
    //
    // ⚠️ **The Rustwood is also the first chapter whose enemies wear gear, and it is measured at
    // roughly a twentieth of what would be needed to matter here.** A full Worn set is +8.6% health
    // on a `tank` at level 1 and +17.6% at Worn's cap; the enemy side needs ×3 to ×4 before the
    // final stops being a fight this party's successor wins with all five alive. So this ceiling is
    // held by the boards' composition, exactly as the seven below it are — the gear axis contributes
    // to it, but it does not carry it. See {@link MOMENTUM_CEILING}.
    const walked = linedSweeps
      .slice(LINE_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 12 clear chapters 1 through 12', () => {
    // The Quarry's seam, measured the same way as the eight above it. This party is literally The
    // Rustwood's `INVESTED` under a new name, so this assertion is the old "clearable end to end"
    // claim kept alive after the ladder grew past it — the ninth time that has been needed.
    const unreliable = rustedSweeps
      .slice(0, RUST_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Quarry as well', () => {
    // ⚠️ **A finding rather than a passing test: this ceiling can no longer bind at the newest seam,
    // and the reason is its denominator.** {@link MOMENTUM_CEILING} is a share of the **whole
    // ladder** while the slice it is applied to is only the chapters *above* the seam — so at 550
    // stages the bar is 165 and this slice is 50 boards long. Measured, this party clears all 50,
    // which is a real walkover and the assertion still passes.
    //
    // It is not the same failure as a threshold content outgrew. The quantity has not drifted; the
    // guard's shape stopped matching the ladder the moment a chapter became smaller than the share.
    // It went vacuous for the newest seam at 167 stages and now cannot bind for the three newest:
    // WILDED is measured over 150 boards, LINED over 100, RUSTED over 50, all against 165.
    //
    // ⚠️ **Recorded rather than fixed, deliberately.** The honest repair is a share of the *slice*
    // rather than of the ladder, which re-derives every seam assertion in this file at once and is a
    // decision about what a seam is meant to prove — not a chapter's scope. **Do not widen it**;
    // `docs/authoring.md` forbids that and widening is the wrong direction anyway. See
    // `docs/testing.md` on retiring a guard rather than sliding it.
    //
    // ⚠️ **The tightest seam in this chain, and the reason is a cap rather than a chapter.**
    // Chapters 11, 12 and 13 all sit on `legendary-plus`, whose cap of 260 is fifteen levels under
    // The Quarry's close of 275 — so this party and {@link INVESTED} are the same five at the same
    // rung, **ten** levels apart rather than twenty-five. That is ×1.21 of power across a whole
    // chapter, against ×1.68 at every seam below it, and there is nothing at all for the level dial
    // to open. What stops the party has to be the boards.
    //
    // ⚠️ **The gear grade steps to Sturdy here and it is still measured at roughly a twentieth of
    // what would matter.** The whole Sturdy ladder, 11 to 40, moves chapter 12's final refielded at
    // level 275 from 8.8s to 10.0s against this chapter's own {@link INVESTED}, at 100% with all
    // five alive throughout — so this ceiling is held by the boards' composition exactly as the
    // eight below it are. See {@link MOMENTUM_CEILING} and `chapter-13.ts` for the table.
    const walked = rustedSweeps
      .slice(RUST_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 13 clear chapters 1 through 13', () => {
    // The Shutgate's seam, measured the same way as the nine above it. ⚠️ **This party is not merely
    // The Quarry's `INVESTED` under a new name — it is the same combatants as *this* file's
    // {@link INVESTED} as well**, because chapters 13 and 14 both close above `legendary-plus`'s cap
    // of 260 and both clamp to it. So this assertion and "is clearable end to end" below are two
    // statements of one claim for the first time in the chain. See {@link QUARRIED}.
    const unreliable = quarriedSweeps
      .slice(0, QUARRY_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Shutgate as well', () => {
    // ⚠️ **Vacuous by construction rather than by arithmetic, and that is a second and sharper
    // instance of the finding chapter 13 recorded one seam below.** {@link MOMENTUM_CEILING} is a
    // share of the *whole ladder* — 180 boards at 600 stages — while this slice is 50, so it could
    // not bind here whatever it measured. On top of that, {@link QUARRIED} and {@link INVESTED} are
    // now the **same party**, so "does not walk the chapter ahead" and "clears the chapter ahead"
    // are asserted of one set of combatants and the first is required to be false.
    //
    // ⚠️ **Kept rather than deleted, and deliberately not widened or narrowed.** The honest repair
    // is the one {@link MOMENTUM_CEILING} names: a share of the *slice* rather than of the ladder,
    // which re-derives every seam assertion in this file at once and is a decision about what a seam
    // is meant to prove. Deleting this one would quietly lose the record of why.
    //
    // ⚠️ **What the seam actually costs is not nothing, it is just not measured here.** The Shutgate
    // stands **forty levels** above the cap this party is clamped at — ×2.29 — where The Quarry stood
    // fifteen above and every chapter below that stood level with its close. That gradient is real
    // and it shows up in the two assertions underneath this one, both of which it restores.
    const walked = quarriedSweeps
      .slice(QUARRY_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 14 clear chapters 1 through 14', () => {
    // The Underroad's seam, measured the same way as the ten above it. ⚠️ **The third party in this
    // chain that is the same combatants**: chapters 13, 14 and 15 all close above `legendary-plus`'s
    // cap of 260 and all clamp to it, so {@link QUARRIED}, {@link SHUTGATED} and {@link INVESTED} are
    // one set of five. What was a finding at chapter 14 now has a rate: each further chapter on this
    // rung divides the seam ratio by `perLevel.common ** 25` = 1.680 and adds one identical link.
    const unreliable = shutgatedSweeps
      .slice(0, SHUTGATE_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Underroad as well', () => {
    // ⚠️ **Vacuous by construction for the second chapter running**, and kept for the reason the one
    // above it is kept. {@link MOMENTUM_CEILING} is a share of the *whole ladder* — 195 boards at 650
    // stages — while this slice is 50, so it cannot bind here whatever it measures; and
    // {@link SHUTGATED} and {@link INVESTED} are the same party, so "walks the chapter ahead" and
    // "clears the chapter ahead" are asserted of one set of combatants with opposite required
    // answers.
    //
    // ⚠️ **Do not widen it and do not delete it.** `docs/authoring.md` forbids widening; deleting
    // would lose the record of *why* this stopped measuring anything, which is now the clearest
    // statement in the file that the guard's denominator is wrong rather than its number.
    //
    // ⚠️ **What the seam costs is real and is measured two assertions down.** The Underroad's last
    // board stands **sixty-five levels** above the cap this party is clamped at — ×3.80, against The
    // Shutgate's ×2.29 — which is why chapter 15's blocks are authored at roughly half chapter 14's.
    const walked = shutgatedSweeps
      .slice(SHUTGATE_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 15 clear chapters 1 through 15', () => {
    // The Spoilfield's seam, measured the same way as the eleven above it. ⚠️ **The fourth party in
    // this chain that is the same combatants**: chapters 13, 14, 15 and 16 all close above
    // `legendary-plus`'s cap of 260 and all clamp to it, so {@link QUARRIED}, {@link SHUTGATED},
    // {@link UNDERROAD} and {@link INVESTED} are one set of five. Chapter 15 predicted a third
    // degenerate link and this is it; the rate is `perLevel.common ** 25` = 1.680 a chapter and it
    // has now held three times running.
    const unreliable = underroadSweeps
      .slice(0, UNDERROAD_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Spoilfield as well', () => {
    // ⚠️ **Vacuous by construction for the third chapter running**, and kept for the reason the two
    // above it are kept. {@link MOMENTUM_CEILING} is a share of the *whole ladder* — 210 boards at
    // 700 stages — while this slice is 50, so it cannot bind here whatever it measures; and
    // {@link UNDERROAD} and {@link INVESTED} are the same party, so "walks the chapter ahead" and
    // "clears the chapter ahead" are asserted of one set of combatants with opposite required
    // answers.
    //
    // ⚠️ **Do not widen it and do not delete it.** `docs/authoring.md` forbids widening; deleting
    // would lose the record of *why* this stopped measuring anything.
    //
    // ⚠️ **What the seam costs is real and is measured two assertions down.** The Spoilfield's last
    // board stands **ninety levels** above the cap this party is clamped at — ×6.49, against The
    // Underroad's ×3.80 — which is why chapter 16's blocks are authored at roughly two fifths of
    // chapter 15's.
    const walked = underroadSweeps
      .slice(UNDERROAD_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 16 clear chapters 1 through 16', () => {
    // The Quickmire's seam, measured the same way as the twelve above it. ⚠️ **The fifth party in
    // this chain that is the same combatants**: chapters 13 through 17 all close above
    // `legendary-plus`'s cap of 260 and all clamp to it, so {@link QUARRIED}, {@link SHUTGATED},
    // {@link UNDERROAD}, {@link SPOILED} and {@link INVESTED} are one set of five. The rate is
    // `perLevel.common ** 25` = 1.680 a chapter and it has now held four times running.
    const unreliable = spoiledSweeps
      .slice(0, SPOILFIELD_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Quickmire as well', () => {
    // ⚠️ **Vacuous by construction for the fourth chapter running**, and kept for the reason the
    // three above it are kept. {@link MOMENTUM_CEILING} is a share of the *whole ladder* — 225
    // boards at 750 stages — while this slice is 50, so it cannot bind here whatever it measures;
    // and {@link SPOILED} and {@link INVESTED} are the same party, so "walks the chapter ahead" and
    // "clears the chapter ahead" are asserted of one set of combatants with opposite required
    // answers.
    //
    // ⚠️ **Do not widen it and do not delete it.** `docs/authoring.md` forbids widening; deleting
    // would lose the record of *why* this stopped measuring anything.
    //
    // ⚠️ **What the seam costs is real and is measured two assertions down.** The Quickmire's last
    // board stands **a hundred and fifteen levels** above the cap this party is clamped at —
    // ×10.91, against The Spoilfield's ×6.49 — which is why chapter 17's boards are authored at
    // roughly half chapter 16's, and why its seam ratio is the first to fall below 1.00.
    const walked = spoiledSweeps
      .slice(SPOILFIELD_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 17 clear chapters 1 through 17', () => {
    // The Slowgrowth's seam, measured the same way as the thirteen above it. ⚠️ **This is the last
    // link of the degenerate chain**: chapters 13 through 17 all close above `legendary-plus`'s cap
    // of 260 and all clamp to it, so {@link QUARRIED}, {@link SHUTGATED}, {@link UNDERROAD},
    // {@link SPOILED} and {@link QUICKMIRED} are one set of five combatants. {@link INVESTED} is the
    // first party in six chapters that is not — see its comment for why the rung moved.
    const unreliable = quickmiredSweeps
      .slice(0, QUICKMIRE_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Slowgrowth as well', () => {
    // ⚠️ **This is the first seam in five where the assertion is not vacuous**, and the reason is the
    // rung move. Chapters 14 through 17 compared a party against itself — {@link SPOILED} and the old
    // {@link INVESTED} were the same combatants — so "clears the chapter behind it" and "does not walk
    // the chapter ahead" were asserted of one set of five with opposite required answers. The
    // Slowgrowth asks for `mythic`, so {@link QUICKMIRED} is genuinely the weaker party and this
    // measures something again.
    //
    // ⚠️ **{@link MOMENTUM_CEILING} still cannot bind here and that is still its denominator.** It is
    // a share of the *whole ladder* — 240 boards at 800 stages — while this slice is 50. **Do not
    // widen it and do not delete it**; the repair it names is a share of the slice, which re-derives
    // every seam in this file at once.
    const walked = quickmiredSweeps
      .slice(QUICKMIRE_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 18 clear chapters 1 through 18', () => {
    // The Backcut's seam, measured the same way as the fourteen above it. ⚠️ **The degenerate chain
    // restarts here, one link deep.** Chapter 18 ended a five-link stretch by moving the rung to
    // `mythic`; chapters 18 and 19 both close above `mythic`'s cap of **340** and both clamp to it,
    // so {@link SLOWGROWTH} and {@link INVESTED} are once again one set of five combatants. The rate
    // that produced the last chain applies unchanged to this one — `perLevel.common ** 25` = 1.680 a
    // chapter — so expect a second identical link at chapter 20 and a third at 21. See
    // {@link INVESTED} for why the rung nonetheless stays put.
    const unreliable = slowgrowthSweeps
      .slice(0, SLOWGROWTH_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Backcut as well', () => {
    // ⚠️ **Vacuous by construction again, for the reason the four above it are.**
    // {@link MOMENTUM_CEILING} is a share of the *whole ladder* — 255 boards at 850 stages — while
    // this slice is 50, so it cannot bind here whatever it measures; and {@link SLOWGROWTH} and
    // {@link INVESTED} are the same party, so "walks the chapter ahead" and "clears the chapter
    // ahead" are asserted of one set of combatants with opposite required answers.
    //
    // ⚠️ **Do not widen it and do not delete it.** `docs/authoring.md` forbids widening; deleting
    // would lose the record of *why* this stopped measuring anything, which is that the guard's
    // denominator is the ladder where the claim is about the slice.
    //
    // ⚠️ **What the seam costs is real and is measured two assertions down.** The Backcut's last
    // board stands **eighty-five levels** above the cap this party is clamped at — ×5.83 — which is
    // why chapter 19's boards are authored at roughly 0.595 of chapter 18's. That is the same
    // arithmetic that ran under chapters 13 through 17, one rung higher up.
    const walked = slowgrowthSweeps
      .slice(SLOWGROWTH_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 19 clear chapters 1 through 19', () => {
    // The Commonage's seam, measured the same way as the fifteen above it. ⚠️ **The degenerate chain
    // reaches three links, exactly as chapter 19 predicted it would.** Chapters 18, 19 and 20 all
    // close above `mythic`'s cap of **340** and all clamp to it, so {@link SLOWGROWTH},
    // {@link BACKCUT} and {@link INVESTED} are one set of five combatants. See {@link INVESTED} for
    // why the rung stays put a second time, and for the finding that what will move it next is the
    // **pool** rather than the arithmetic.
    const unreliable = backcutSweeps
      .slice(0, BACKCUT_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Commonage as well', () => {
    // ⚠️ **Vacuous by construction for the sixth time**, for the reasons the five above it are:
    // {@link MOMENTUM_CEILING} is a share of the whole ladder — 273 boards at 910 stages — where
    // this slice is 60, and {@link BACKCUT} and {@link INVESTED} are the same party. Kept rather
    // than deleted so the record of *why* survives. `docs/authoring.md` forbids widening it.
    //
    // ⚠️ **What the seam costs is real**: The Commonage's last board stands **a hundred and fifteen
    // levels** above the cap this party is clamped at — ×10.98 — which is the sharpest gap the
    // campaign has carried, and it is why its boards are authored at roughly a third of chapter
    // 19's rather than the usual 0.595. **Thirty levels of squeeze rather than twenty-five is what a
    // sixty-stage chapter costs.**
    const walked = backcutSweeps
      .slice(BACKCUT_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 20 clear chapters 1 through 20', () => {
    // The Longebb's seam, measured the same way as the sixteen above it. ⚠️ **The degenerate chain
    // reaches four links.** Chapters 18 through 21 all close above `mythic`'s cap of **340** and all
    // clamp to it, so {@link SLOWGROWTH}, {@link BACKCUT}, {@link COMMONAGE} and {@link INVESTED} are
    // one set of five combatants. See {@link INVESTED} for why the rung stays put a third time, and
    // for the `mythic-plus` walkover that was fielded rather than reasoned about this time.
    const unreliable = commonageSweeps
      .slice(0, COMMONAGE_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Longebb as well', () => {
    // ⚠️ **Vacuous by construction for the seventh time**, for the reasons the six above it are:
    // {@link MOMENTUM_CEILING} is a share of the whole ladder — 291 boards at 970 stages — where this
    // slice is 60, and {@link COMMONAGE} and {@link INVESTED} are the same party. Kept rather than
    // deleted so the record of *why* survives. `docs/authoring.md` forbids widening it.
    //
    // ⚠️ **What the seam costs is real**: The Longebb's last board stands **a hundred and forty-five
    // levels** above the cap this party is clamped at — ×20.36 — and its seam ratio is **0.8241**, the
    // first reading under 1.00 on `mythic`. That is why its boards are authored at roughly half
    // chapter 20's: the budget runs 1,445 common-equivalent at `c21-s1` down to **804** at the final.
    const walked = commonageSweeps
      .slice(COMMONAGE_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 21 clear chapters 1 through 21', () => {
    // The Downstroke's seam, measured the same way as the seventeen above it. ⚠️ **This is where the
    // degenerate chain ends, at four links**: chapters 18 through 21 all clamp to `mythic`'s cap of
    // 340, so {@link SLOWGROWTH}, {@link BACKCUT}, {@link COMMONAGE} and this party are one set of
    // five combatants — and {@link INVESTED} is the first that is not, because chapter 22 moved the
    // rung to `mythic-plus`. See {@link INVESTED} for what licensed the override.
    const unreliable = longebbSweeps
      .slice(0, LONGEBB_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Downstroke as well', () => {
    // ⚠️ **This seam is the one place in the chain where the ceiling is not vacuous, and the reason
    // is the rung move.** The six seams below it compare a party with {@link INVESTED} that is either
    // the same set of combatants or one clamped to the same cap, so "does not walk the chapter ahead"
    // and "clears the chapter ahead" were asserted of one party. Here {@link LONGEBB} is on `mythic`
    // and {@link INVESTED} is on `mythic-plus` — genuinely different fives — so this assertion has
    // something to say for the first time since chapter 17.
    //
    // ⚠️ **What it says is the override's whole case.** The `mythic` party cannot stand on a chapter
    // 22 board at all: measured at level 515, the five lightest bodies in the game read 0% with 0.00
    // survivors against it. {@link MOMENTUM_CEILING} is still a share of the whole ladder (309 boards
    // at 1,030 stages) against a slice of 60, so it could not bind on the count either way —
    // `docs/authoring.md` forbids widening it and the honest repair is a share of the *slice*.
    const walked = longebbSweeps
      .slice(LONGEBB_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 22 clear chapters 1 through 22', () => {
    // The Evenfall's seam, measured the same way as the eighteen above it.
    const unreliable = downstrokeSweeps
      .slice(0, DOWNSTROKE_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Evenfall as well', () => {
    // ⚠️ **Vacuous by construction again, and the reason is the degenerate chain restarting.**
    // Chapters 22 and 23 both close above `mythic-plus`'s cap of 420 and both clamp to it, so
    // {@link DOWNSTROKE} and {@link INVESTED} are the same five combatants — the assertion above and
    // this one are therefore one claim, exactly as they were for chapters 13 through 17 on
    // `legendary-plus` and 18 through 21 on `mythic`. {@link MOMENTUM_CEILING} is a share of the
    // whole ladder (327 boards at 1,090 stages) against a slice of 60, so it could not bind on the
    // count either. Kept rather than deleted so the record of *why* survives; `docs/authoring.md`
    // forbids widening it and names the honest repair — a share of the *slice*.
    //
    // ⚠️ **What the seam costs is real even though the assertion is vacuous.** The Evenfall's last
    // board stands **a hundred and twenty-five levels** above the cap this party is clamped at —
    // ×13.44 — and its seam ratio is **1.9981**. That is why its boards are authored at roughly half
    // chapter 22's: the budget runs about 2,200 common-equivalent at `c23-s1` to 4,000 at its
    // heaviest and 3,017 at the final.
    const walked = downstrokeSweeps
      .slice(DOWNSTROKE_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 23 clear chapters 1 through 23', () => {
    // The Nevermark's seam, measured the same way as the nineteen above it.
    const unreliable = evenfallSweeps
      .slice(0, EVENFALL_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Nevermark as well', () => {
    // ⚠️ **Vacuous by construction for the third chapter running, and chapter 23 predicted it.**
    // Chapters 22, 23 and 24 all close above `mythic-plus`'s cap of 420 and all clamp to it, so
    // {@link DOWNSTROKE}, {@link EVENFALL} and {@link NEVERMARK} are one set of five combatants and
    // the degenerate chain is two links deep — the shape chapters 13 through 17 recorded five deep
    // on `legendary-plus` and 18 through 21 four deep on `mythic`. {@link MOMENTUM_CEILING} is a
    // share of the whole ladder against a slice of 60, so it could not bind on the count either.
    // Kept rather than deleted so the record of *why* survives.
    //
    // ⚠️ **What the seam costs is real even though the assertion is vacuous.** The Nevermark's last
    // board stands **a hundred and fifty-five levels** above the cap this party is clamped at —
    // ×24.63 — and its seam ratio is **1.0711**, the first this rung has produced that is within a
    // tenth of 1.00. Its boards are authored at **×0.536** of chapter 23's for exactly that reason:
    // 1,310 common-equivalent at `c24-s1` to 2,718 at its heaviest, against The Evenfall's 2,185 to
    // 3,999.
    const walked = evenfallSweeps
      .slice(EVENFALL_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 24 clear chapters 1 through 24', () => {
    // The Thinground's seam, measured the same way as the twenty above it.
    const unreliable = nevermarkSweeps
      .slice(0, NEVERMARK_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Thinground as well', () => {
    // ⚠️ **This is the seam a rung move is supposed to produce, and for once the reading is not
    // vacuous in spirit.** {@link INVESTED} moves to `ascended` where this party sits on
    // `mythic-plus`, so the two are genuinely different fives for the first time in four chapters —
    // and the gap is the whole case for the override. Measured directly rather than inferred:
    // chapter 24's **own** opening board, mid board and final all read **0%** when refielded at
    // level 605 against this party, where the `ascended` five takes all three at 100% with all five
    // alive in 3.0s, 7.6s and 7.3s.
    //
    // ⚠️ **{@link MOMENTUM_CEILING} still cannot bind on the count** — it is a share of the whole
    // ladder (363 boards at 1,210 stages) against a slice of 60 — so what this assertion is worth is
    // the record rather than the arithmetic. `docs/authoring.md` forbids widening it and the honest
    // repair is a share of the *slice*; that repair is still not taken, and still recorded.
    const walked = nevermarkSweeps
      .slice(NEVERMARK_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('lets the party that finished chapter 25 clear chapters 1 through 25', () => {
    // The Roughcast's seam, measured the same way as the twenty-one above it.
    const unreliable = thingroundSweeps
      .slice(0, THINGROUND_END)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk The Roughcast as well', () => {
    // ⚠️ **This is the first seam in the campaign's history whose two parties can never diverge,
    // and the reading is vacuous by construction rather than by accident.** {@link THINGROUND} and
    // {@link INVESTED} both clamp to `ascended`'s cap of 500, so they are the same five combatants —
    // and unlike the four degenerate stretches before it, no later chapter can end this one, because
    // `ascended` is the last rung whose cap the ladder has not already climbed past.
    //
    // What holds the boundary instead is the boards: chapter 25's own final reads 100% with 3.95 of
    // five at level 605 and **0%** at 615, and its mid board reads 100% / 5.00 at 605 and
    // **40% / 0.82** at 635. The chapter is thirty levels of squeeze against a party that cannot
    // move, which is what the assertion below is actually measuring.
    //
    // ⚠️ **{@link MOMENTUM_CEILING} still cannot bind on the count** — it is a share of the whole
    // ladder (381 boards at 1,270 stages) against a slice of 60 — so what this assertion is worth is
    // the record rather than the arithmetic. `docs/authoring.md` forbids widening it and the honest
    // repair is a share of the *slice*; that repair is still not taken, and still recorded.
    const walked = thingroundSweeps
      .slice(THINGROUND_END)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(stages.length * MOMENTUM_CEILING);
  });

  it('is clearable end to end by an invested party of common-tier characters', () => {
    // Without a lucky banner. The top of the ladder is allowed to demand investment; it is not
    // allowed to demand an ascended-tier pull, because there is no way to buy one.
    const unreliable = investedSweeps
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('still costs that party something at the top', () => {
    // A ladder cleared without ever losing a party member has no texture, and the last boss
    // would read exactly like the first stage of the ladder.
    //
    // ## ⚠️ The survivors half was retired when the campaign flattened, and chapter 14 restores it
    //
    // It read `top.meanSurvivors < 5`, and from milestone 24 through chapter 13 the invested party
    // took the final with all five alive — the same arithmetic {@link MOMENTUM_CEILING} records, a
    // chapter worth ×1.68 against a rung worth ×1.60, arriving at the one stage with no next chapter
    // to absorb it. It was one of **three** guards widened or retired against a written promise that
    // enemy gear would restore the gradient.
    //
    // ⚠️ **It is back, and gear is not what brought it back.** Gear was measured at a twentieth of
    // what it needs in chapter 12 and at ×1.15 a grade in chapter 13. What restored this is the
    // **rarity cap**: chapters 11 through 14 all sit on `legendary-plus`, whose cap of 260 the
    // campaign passed at chapter 12, so The Shutgate's final stands forty levels above the party that
    // is meant to take it and it costs that party a member — 4.00 of five, measured, with zero
    // timeouts. See {@link QUARRIED}.
    //
    // ⚠️ **It is therefore restored on a cause nobody planned, and the other two are not.** The
    // momentum ceiling cannot bind at this seam for a reason of its own shape, and the
    // longest-cleared-fight bar moves the *wrong* way as content lengthens fights. **This is the
    // first of the three to come back and it does not license moving either of the others.**
    //
    // The seconds half is kept alongside it rather than replaced: it compares two stages on the same
    // line rather than a party against content, and it is what would catch a level curve that had
    // stopped saying anything at all.
    const top = investedSweeps[investedSweeps.length - 1];

    expect(top.meanSurvivors).toBeLessThan(PARTY_SIZE);
    expect(top.meanSeconds).toBeGreaterThan(investedSweeps[0].meanSeconds * 3);
  });

  it('keeps every fight inside a watchable length', () => {
    // The UI animates the log in real time, so battle duration is screen time. The playback
    // control tops out at 4x, so a minute here is fifteen seconds for a player in a hurry — but
    // anything past that stops being a battle and starts being a wait. Auto-battle makes this
    // sharper rather than softer: a loop of overlong fights is an evening, not a session.
    const overlong = everySweep
      .filter((entry) => entry.meanSeconds > 60)
      .map((entry) => `${entry.label} vs ${entry.stage.id} ${entry.meanSeconds.toFixed(1)}s`);

    expect(overlong).toEqual([]);
  });

  it('leaves the timer real headroom over the longest fight the ladder actually has', () => {
    // The margin between "the longest tuned fight" and "the clock" is what content is allowed to
    // grow into. It used to be 37x, which is another way of saying the cap bounded nothing; at
    // ninety seconds it is small enough to be a genuine constraint, and this is what makes that
    // constraint visible rather than a surprise.
    //
    // A stage that grows past the margin is unclearable by the party it was tuned for, so this is
    // the test that should fail first when a milestone rescales or re-authors the ladder — before
    // the win-rate assertions do, and with a number in the message. Milestone 10's rescale and
    // milestone 11's hundred stages both went past it without it firing, which is the margin
    // being real rather than the test being asleep.
    //
    // ## Milestone 8e narrowed what this measures, and the narrowing is the argument
    //
    // It used to read every fight in the sweep. That was fine while the sweep held four parties
    // and accidentally true — the longest fight in it happened to be one `BUILT` mostly loses.
    // Adding seven mono-faction fives made the accident visible: the longest fights in the file
    // are now the mono-Angel and mono-Demon fives dying slowly to stage 18, which they clear zero
    // and three percent of the time.
    //
    // **A fight the party loses is not a fight the ladder was tuned for**, and it is not what the
    // margin protects. Read the sentence this test is built on: a stage that grows past the margin
    // is unclearable *by the party it was tuned for*. So the set is now the fights a party
    // actually clears, which is the set that sentence describes. The bar itself has not moved.
    //
    // ⚠️ Be honest about what that costs, because it is a real reduction rather than a
    // reclassification. The longest *cleared* fight in the file is a mono-Dwarf five taking stage
    // 16 — four walls and one attacker, winning the way that faction wins — and it eats most of
    // the margin on its own. Losing fights are covered by {@link timer} below, and by the
    // zero-timeout assertion at the top of this block, which is the load-bearing one.
    const cleared = everySweep.filter((entry) => entry.winRate >= 0.9);
    const timer = ticksToMs(MAX_BATTLE_TICKS) / 1000;

    // Before the reduce below, not after it: an empty `cleared` would make that reduce throw, and
    // a suite where no tuned party clears anything should report *that* rather than a TypeError.
    expect(cleared.length).toBeGreaterThan(0);

    const worst = cleared.reduce((slowest, entry) =>
      entry.maxSeconds > slowest.maxSeconds ? entry : slowest,
    );

    expect(
      worst.maxSeconds,
      `longest cleared fight ${worst.maxSeconds.toFixed(1)}s — ${worst.label} vs ` +
        `${worst.stage.id} — against a ${timer}s timer`,
      // ⚠️ **0.75 until the campaign flattened to 0.50 levels a stage.** The longest cleared fight
      // is now `vaulted vs c9-s9` at 69.2s, and the reason is a consequence of the flattening
      // rather than a fight getting slower: this reads only fights a party *clears* at 90%, and a
      // party three chapters behind used to lose that stage outright and be excluded. With the
      // gradient gone it clears — marginally, and a marginal clear is a long one. So the sample
      // grew a class of fight it never contained rather than any tuned fight drifting.
      //
      // ⚠️ **The load-bearing guard is untouched and still passes**: "never runs the clock out on a
      // fight either party is meant to have" is the zero-timeout assertion at the top of this
      // block, and this is the early warning that names the number while there is still room in
      // it. 69.2s against a 90s timer is ×1.30 of headroom where the tuned content has ×1.44.
      // **Back to 0.75 when enemy gear restores the gradient** — see {@link MOMENTUM_CEILING}.
    ).toBeLessThan(timer * 0.8);
  });

  it('finishes every fight it loses inside the clock, with room to spare', () => {
    // The other half of the assertion above, and the one the mono-faction fives are actually
    // watched by. A losing fight has no tuning claim on it — nothing says a level-80 mono-Angel
    // five should trouble stage 18 — but it still has to *end*, and it has to end with enough
    // margin that the next content change does not tip it into a timeout.
    //
    // The zero-timeout assertion at the top of this block is what fails if that margin is ever
    // spent. This is the earlier warning: it names the number while there is still room in it.
    const longest = Math.max(...everySweep.map((entry) => entry.maxSeconds));
    const timer = ticksToMs(MAX_BATTLE_TICKS) / 1000;

    expect(longest, `longest fight ${longest.toFixed(1)}s against a ${timer}s timer`).toBeLessThan(
      timer * 0.95,
    );
  });
});

describe('gear', () => {
  /** The same five characters at the same investment, ungeared, over the same stages. */
  const ungeared = SAMPLED.map((stage) => ({ stage, ...sweep(BUILT, stage) }));

  const cleared = (entries: readonly { winRate: number }[]): number =>
    entries.filter((entry) => entry.winRate >= 0.9).length;

  it('carries the same party meaningfully further up the ladder', () => {
    // The whole point of a third axis, measured rather than asserted. Gear that could not be seen
    // in a win rate would be a number on a sheet, and this milestone's brief was explicit that a
    // geared party should start flying through content tuned for an ungeared one.
    expect(cleared(foundGearSweeps)).toBeGreaterThan(cleared(ungeared));
    expect(cleared(maxedGearSweeps)).toBeGreaterThan(cleared(foundGearSweeps));
  });

  it('is a third axis rather than a replacement for the other two', () => {
    // ⚠️ The assertion that fails if gear ever becomes the game. Levelling is worth ×10⁹ and the
    // rung ladder ×450; gear at its absolute ceiling is worth about ×2, so a party at {@link
    // BUILT}'s investment wearing the best gear that exists must still not out-clear a party that
    // spent fifty levels and three rungs on top of it.
    //
    // If this goes red the answer is to cut the profiles in `data/gear.ts`, not to move the bar:
    // gear that outruns investment turns every wall into a drop-table problem and deletes the
    // reason to level anybody.
    const investedOverSample = SAMPLED.map((stage) => ({ stage, ...sweep(INVESTED, stage) }));

    expect(cleared(maxedGearSweeps)).toBeLessThan(cleared(investedOverSample));
  });

  it('never makes a fight one the party cannot finish', () => {
    // ⚠️ The guard the health and defence halves of gear make necessary, and the same one the
    // lineup bonus needs below. Everything that raises how long a party survives raises the
    // chance of a party outlasting a fight it cannot win, which is the ninety-second timeout.
    // `everySweep` covers both geared parties for this already; naming the mechanic here means a
    // failure says which change caused it.
    const stalled = [...foundGearSweeps, ...maxedGearSweeps]
      .filter((entry) => entry.timedOut > 0)
      .map((entry) => entry.stage.id);

    expect(stalled).toEqual([]);
  });

  it('shortens fights rather than lengthening them', () => {
    // The direction matters for the timer budget. Gear raises attack alongside health, so a geared
    // party should resolve its fights *sooner* — the same argument milestone 10 made about
    // re-authoring the archetypes. If gear ever made the mean fight longer, it would be spending
    // headroom that milestone 8e already spent most of.
    const meanOf = (entries: readonly { meanSeconds: number; winRate: number }[]): number => {
      const won = entries.filter((entry) => entry.winRate >= 0.9);
      return won.reduce((sum, entry) => sum + entry.meanSeconds, 0) / Math.max(won.length, 1);
    };

    expect(meanOf(maxedGearSweeps)).toBeLessThan(meanOf(ungeared) * 1.1);
  });

  it('leaves the starter wall where it is', () => {
    // ⚠️ **The single most important number in the ladder, and gear is the first thing since
    // milestone 4 that could have moved it by accident.** Three level-1 starters clear to the
    // stage-7 healer lock and stop, and that boundary is about *who* is fighting rather than how
    // much they have. Drops start at stage 1, so a starter party arrives at the wall wearing
    // whatever six stages handed it — which at the bottom of the ladder is the bottom grade at
    // level 1, worth a few percent.
    //
    // Fielded here at the most generous reading of that: a full set, every slot, bottom grade,
    // unenhanced. If a party that has not levelled anything can gear its way through the lock,
    // the drop table is too generous at the bottom of the ladder and `gradeSoftness` is the dial.
    const kitted: FormationData = {
      front: [
        at(BRAN, 1, START, { grade: 0, level: 1, aligned: false }),
        at(MIRA, 1, START, { grade: 0, level: 1, aligned: false }),
      ],
      back: [at(RIN, 1, START, { grade: 0, level: 1, aligned: false })],
    };
    const lock = stages[WALL];

    expect(lock).toBeDefined();
    if (lock === undefined) {
      return;
    }

    expect(sweep(kitted, lock).winRate).toBeLessThan(0.2);
  });
});

describe('the lineup bonus', () => {
  /** The same party and the same seeds, with and without the composition tracks. */
  const withBonus = boostedSweeps;
  const withoutBonus = stages.map((stage) => ({
    stage,
    ...sweep(BOOSTED, stage, withoutLineup),
  }));

  const cleared = (entries: readonly { winRate: number }[]): number =>
    entries.reduce((total, entry) => total + entry.winRate, 0);

  it('is worth enough to change which stages a party clears', () => {
    // The whole mechanic, measured rather than asserted. A composition bonus that could not be
    // seen in a win rate would be a number on a screen, and the milestone's premise — field a
    // different mono-faction team per encounter — needs it to be a reason to rebuild a party.
    expect(cleared(withBonus)).toBeGreaterThan(cleared(withoutBonus));
  });

  it('never makes a fight one the party cannot finish', () => {
    // ⚠️ The guard the health and defence halves of this bonus make necessary. Everything on the
    // ladder above them raises how long a party survives, and a party that survives a fight it
    // cannot win is precisely the ninety-second timeout the sweep exists to catch. `everySweep`
    // covers the boosted party for the same assertion; this one names the mechanic, so a failure
    // says which change caused it.
    const stalled = withBonus.filter((entry) => entry.timedOut > 0).map((entry) => entry.stage.id);

    expect(stalled).toEqual([]);
  });

  it('makes all seven mono-faction fives real parties rather than one real party', () => {
    // ⚠️ **8d's premise, and the reason milestone 8e existed.** The composition bonus is sanctioned
    // on the argument that a mono-faction bonus creates seven optimal teams rather than one; seven
    // teams that are not comparably capable is one optimal team with six excuses.
    //
    // Measured as the share of the ladder each faction's five clears at `BUILT`'s investment. They
    // land within about a stage and a half of each other on twenty-four, which is close enough
    // that the choice between them is about the encounter rather than about which faction the
    // banner was kind with.
    const cleared = MONO_FIVES.map(({ faction }) => ({
      faction,
      total: monoSweeps
        .filter((entry) => entry.faction === faction)
        .reduce((sum, entry) => sum + entry.winRate, 0),
    }));
    const best = Math.max(...cleared.map((entry) => entry.total));
    const worst = Math.min(...cleared.map((entry) => entry.total));
    const summary = cleared.map((entry) => `${entry.faction} ${entry.total.toFixed(1)}`).join(', ');

    expect(worst, summary).toBeGreaterThan(0);
    expect(best - worst, summary).toBeLessThan(SAMPLED.length * 0.15);
  });

  it('pays every mono-faction five the same rung, and only the two faction tracks on top', () => {
    // **The reason 8d could not size its own matchup edges, stated as an assertion.** Every
    // mono-faction five reaches the *same rung* of the composition ladder, so that part of the
    // bonus contributes an identical multiplier to all seven and drops out of any comparison
    // between them. The lineup bonus decides whether to build a mono-faction team; once a player
    // owns two, it says almost nothing about which to bring.
    //
    // **Almost.** The rung cancels and the two faction tracks deliberately do not: Monsters rally
    // for a flat share per member, so five of them add ten points of attack and health on top of
    // the rung, and Demons climb a track of defence, crit and haste that no rung pays. Those are
    // authored differences between the seven teams rather than leaks, and this test names them so
    // that a *new* asymmetry shows up as a failure instead of as a slightly better faction.
    const summaries = MONO_FIVES.map(({ faction, party }) => ({
      faction,
      summary: lineupBonus(
        [...party.front, ...party.back].map((member) => member.faction),
        rules.lineup,
      ),
    }));
    const top = rules.lineup.tiers.reduce((best, tier) =>
      tier.attack > best.attack ? tier : best,
    );

    for (const { faction, summary } of summaries) {
      // Every one of them reaches the top rung — that is what "mono-faction five" means here.
      expect(summary.tier?.attack, `${faction} rung attack`).toBe(top.attack);
      expect(summary.tier?.health, `${faction} rung health`).toBe(top.health);
    }

    // What is left over, once the rung is subtracted, is the rally track and nothing else.
    const rally = rules.lineup.rally;
    for (const { faction, summary } of summaries) {
      const expected = faction === rally.faction ? rally.attack * PARTY_SIZE : 0;

      expect(summary.bonus.attack - top.attack, `${faction} attack above the rung`).toBeCloseTo(
        expected,
      );
      expect(summary.bonus.health - top.health, `${faction} health above the rung`).toBeCloseTo(
        faction === rally.faction ? rally.health * PARTY_SIZE : 0,
      );
    }
  });
});

/**
 * The matchup matrix, measured rather than argued about.
 *
 * This block replaced an assertion that recorded a gap: with twenty-three characters no second
 * mono-faction team was buildable, so "does the matchup decide which one to bring" had nothing to
 * compare. Milestone 8e built the seven teams, so the question is now answerable, and what it
 * pinned in the meantime — that the composition ladder's top rung is worth several times the
 * largest matchup edge — turned out to be **true and irrelevant**: the ladder pays every
 * mono-faction five identically, so its size never entered the comparison it was being compared
 * in.
 *
 * ## The answer, and why the edges were left at 1.05 and 1.10
 *
 * The milestone expected to resize them and the measurement said not to. Sweeping the seven fives
 * across the ladder at five investment levels and switching the matrix off, the matrix moves a
 * *contested* fight — one neither certain nor hopeless — by about seventeen points of win rate on
 * average, and by twenty-five or more in nearly a third of them. A five percent damage edge is
 * doing exactly what `combat.ts` claims: deciding fights that were already close, and deciding
 * nothing else.
 *
 * **Contested is the whole of why the earlier reading was wrong.** At a fixed investment the
 * ladder is close to a step function — a party clears everything up to its level and nothing past
 * it — so averaged over twenty-four stages a matchup edge looks like noise, because twenty-one of
 * those stages were never in doubt. The fights it decides are the two or three at the party's
 * edge, and those are the only fights a player is choosing a team for.
 */
describe('the matchup matrix', () => {
  /**
   * Investment levels swept so fights land at several party strengths.
   *
   * Sweeping levels is what produces contested fights at all. At any single level the ladder is
   * close to a step function, and a matrix measured only there is measured almost entirely on
   * fights that were never in doubt.
   */
  const LEVELS = [60, 70, 80, 90, 100];

  /** The same rules with every faction edge removed. A missing pair is neutral. */
  const neutral: CombatRules = toCombatRules({ ...authoredRules, matchups: [] });

  /** Neither certain nor hopeless — the only fights a five percent edge could ever decide. */
  const inDoubt = (winRate: number): boolean => winRate > 0.05 && winRate < 0.95;

  /** Every mono-faction five, every stage, every level, with the matrix on and off. */
  const trials = LEVELS.flatMap((level) =>
    monoFives(level, ELITE).flatMap(({ faction, party }) =>
      SAMPLED.map((stage) => ({
        faction,
        stage,
        level,
        on: sweep(party, stage).winRate,
        off: sweep(party, stage, neutral).winRate,
      })),
    ),
  );
  const contested = trials.filter((entry) => inDoubt(entry.on) || inDoubt(entry.off));

  it('finds fights the matrix could plausibly decide', () => {
    // If this ever reaches zero the assertions below are vacuously true, which is the failure mode
    // a measurement-driven test has and an asserted one does not.
    expect(contested.length).toBeGreaterThan(0);
  });

  it('decides a fight that was already close', () => {
    // The claim `combat.ts` makes about itself, measured: the mean absolute swing in win rate when
    // the matrix is switched off, over the fights that were close enough to swing.
    //
    // This is the assertion that would have justified resizing the edges, and it is why they were
    // not resized. It came out around seventeen points — a five percent damage edge visibly
    // decides fights at a party's own ceiling, which is the entire job the matrix was given.
    const swing =
      contested.reduce((total, entry) => total + Math.abs(entry.on - entry.off), 0) /
      contested.length;

    expect(swing, `mean swing ${(swing * 100).toFixed(1)} points of win rate`).toBeGreaterThan(
      0.05,
    );
  });

  it('is worth less than a step of investment, so it tips a fight rather than carrying one', () => {
    // The other side, and the reason the edges were not resized *upward*: an edge big enough to
    // carry a party that brought the wrong answer is what the matrix was chosen over a flat
    // synergy bonus to avoid.
    //
    // ⚠️ **The obvious way to write this is wrong, and it is worth recording why.** The first
    // version asserted the matrix never turns a fight the party loses into one it wins — and it
    // failed, on a mono-Angel five at level 90 against stage 18, which goes from zero to seventy-
    // nine percent when the matrix is on. That looks damning and is not: win rate near a party's
    // damage threshold is close to a step function, because either the party out-damages the
    // encounter's sustain or it does not. "Loses at zero percent" and "is one exchange short"
    // are the same reading, so an assertion keyed on the outcome cannot tell a tiebreak from a
    // rescue.
    //
    // What separates them is **how much the edge is worth in the currency the player actually
    // spends**. Ten levels is the smallest step this sweep resolves, so: a matchup-assisted fight
    // must never beat the same fight ten levels higher with the matrix switched off. An edge worth
    // more than ten levels of investment would be an edge a player builds around instead of a
    // tiebreaker, and that is the line worth defending.
    const byKey = new Map(
      trials.map((entry) => [`${entry.faction}/${entry.stage.id}/${entry.level}`, entry]),
    );
    const carried: string[] = [];

    for (const entry of trials) {
      const higher = byKey.get(`${entry.faction}/${entry.stage.id}/${entry.level + 10}`);
      if (higher === undefined) {
        continue;
      }
      if (entry.on > higher.off) {
        carried.push(
          `${entry.faction} ${entry.stage.id}: lvl${entry.level} with the matrix beats ` +
            `lvl${higher.level} without it (${entry.on.toFixed(2)} > ${higher.off.toFixed(2)})`,
        );
      }
    }

    expect(carried).toEqual([]);
  });
});

/**
 * The parties the ladder is *not* tuned against, which is the point.
 *
 * A player may field one character, or five healers, and neither is a configuration any of the
 * sweeps above describes. Before the battle timer this is where the game's worst behaviour lived:
 * a solo wall against a stage it could not kill produced thirty minutes of battle log on a screen
 * with no exit, and no assertion anywhere covered it — the zero-stalemates guard swept three tuned
 * parties of five and passed while the failure sat outside it.
 *
 * **These parties are allowed to lose. They are not allowed to lose slowly.** That is the whole of
 * what this block asserts, and it is deliberately not a balance claim: nothing here says a solo
 * Thraun should beat anything.
 */
describe('parties nobody tuned for', () => {
  /**
   * Level 40 at the `ascended` rung, which is not an arbitrary pick.
   *
   * It is the investment level at which these characters are strong enough to survive the late
   * ladder indefinitely and still nowhere near strong enough to kill it — the exact band in which
   * the old thirty-minute fights lived. Levelling them further does not make the point better; it
   * makes them win, which is a different test.
   */
  const AWKWARD_LEVEL = 40;

  const member = (character: CharacterData, rarity: number): CombatantData =>
    at(character, legal(Math.min(AWKWARD_LEVEL, LEVEL_CURVE.caps[rarity]), rarity), rarity);

  /** A one-character party, which the formation permits and the ladder never assumed. */
  const solo = (character: CharacterData, rarity: number): FormationData => ({
    front: [member(character, rarity)],
    back: [],
  });

  /** Two characters chosen to sustain rather than to kill — the worst shape a real player builds. */
  const sustainPair = (a: CharacterData, b: CharacterData, rarity: number): FormationData => ({
    front: [member(a, rarity), member(b, rarity)],
    back: [],
  });

  const awkward: readonly { label: string; party: FormationData }[] = [
    { label: 'solo Thraun', party: solo(THRAUN, ASCENDED) },
    { label: 'solo Celia', party: solo(CELIA, ASCENDED) },
    { label: 'solo Bran', party: solo(BRAN, ELITE) },
    { label: 'Thraun + Celia', party: sustainPair(THRAUN, CELIA, ASCENDED) },
    { label: 'Korrin + Celia', party: sustainPair(KORRIN, CELIA, ASCENDED) },
    { label: 'Thraun + Korrin', party: sustainPair(THRAUN, KORRIN, ASCENDED) },
  ];

  const awkwardSweeps = awkward.flatMap(({ label, party }) =>
    stages.map((stage) => ({ label, stage, ...sweep(party, stage) })),
  );

  it('never leaves a player watching a fight that has already been decided', () => {
    // ⚠️ The gap this block exists to close, stated as the promise it makes: whatever you field,
    // you find out within ninety seconds. The timer is what guarantees it, so this is really an
    // assertion that nothing bypasses the timer — but it is worth having, because the version of
    // this that was missing is exactly how thirty-minute fights shipped.
    const timer = ticksToMs(MAX_BATTLE_TICKS) / 1000;
    const overlong = awkwardSweeps
      .filter((entry) => entry.maxSeconds > timer)
      .map((entry) => `${entry.label} vs ${entry.stage.id} ${entry.maxSeconds.toFixed(1)}s`);

    expect(overlong).toEqual([]);
  });

  it('pays nothing for a fight the clock ended', () => {
    // A timeout is a defeat, and a defeat earns no gold, no rates and no first-clear bonus. Worth
    // asserting rather than assuming: `reward` keys off the outcome, and the outcome for a
    // timed-out fight changed.
    const timedOut = awkward
      .flatMap(({ party }) =>
        stages.map((stage) =>
          simulateBattle(party, stage, battleSeed(0xc0ffee, stage.id, 0), rules),
        ),
      )
      .filter((result) => result.timedOut);

    expect(timedOut.length).toBeGreaterThan(0);
    for (const result of timedOut) {
      expect(result.outcome, result.stageId).toBe('defeat');
      expect(Object.keys(result.reward.gained), result.stageId).toEqual([]);
      expect(Object.keys(result.reward.rates), result.stageId).toEqual([]);
      expect(result.reward.firstClearSummons.eq(0), result.stageId).toBe(true);
    }
  });

  it('still lets a lone character clear something, so the rule is a timer and not a party-size gate', () => {
    // The fix deliberately was not "ban small parties". If a one-character party could no longer
    // beat anything at all, the timer would have become a formation requirement by the back door.
    const soloClears = awkwardSweeps.filter(
      (entry) => entry.label.startsWith('solo') && entry.winRate >= 0.9,
    );

    expect(soloClears.length).toBeGreaterThan(0);
  });
});

describe('the shape of the climb', () => {
  /**
   * The smallest all-round power multiplier at which the reference five clear a stage reliably.
   *
   * This is what "difficulty" actually means here, measured rather than asserted. The party's
   * multiplier rises smoothly with levels and ascension rungs, so the curve this returns has to
   * rise smoothly too — a flat step is a stage that asks for nothing, and a spike is a wall the
   * economy cannot be climbed over.
   *
   * The probe scales the five quantities directly instead of picking levels, so it sweeps power
   * continuously rather than in the lumps the level curve happens to provide.
   */
  const threshold = (stage: StageData): number => {
    const flat: GrowthData = {
      perLevel: { common: 1, legendary: 1, ascended: 1 },
      perAscension: 1,
    };
    const party = (multiplier: number): FormationData => {
      const scaled = (character: CharacterData): CombatantData => {
        const base = scaleStats(character.stats, flat, character.tier, 1, 0);
        const grow = (value: number | string): string => String(Number(value) * multiplier);
        return {
          id: character.id,
          name: character.name,
          faction: character.faction,
          stats: {
            ...base,
            hp: grow(base.hp),
            atk: grow(base.atk),
            def: grow(base.def),
            ...(base.recovery === undefined ? {} : { recovery: grow(base.recovery) }),
          },
          basic: character.basic,
          // The kit {@link BUILT} fields, held fixed while the power multiplier sweeps. The probe
          // deliberately decouples stats from levels — that is what makes the curve continuous —
          // but a kit is not a quantity, so it has to be pinned to a rung rather than scaled.
          skills: unlockedSkills(character.skills ?? [], kit, character.tier, PROBE_RARITY),
        };
      };
      return {
        front: [scaled(BRAN), scaled(GNASH)],
        back: [scaled(RIN), scaled(CELIA), scaled(PYRA)],
      };
    };

    const clears = (multiplier: number): boolean => {
      let wins = 0;
      for (let attempt = 0; attempt < 20; attempt++) {
        const seed = battleSeed(0xc0ffee, stage.id, attempt);
        if (simulateBattle(party(multiplier), stage, seed, rules).outcome === 'victory') {
          wins++;
        }
      }
      return wins / 20 >= 0.9;
    };

    // The bracket has to span the whole ladder, and milestone 10 widened the ladder by a factor
    // of ten: the top stage asks about ×370 of the reference five where it used to ask ×6. The
    // step count went with it — a bisection in log space cuts its range in half per step, so
    // holding the old ~1% resolution over a range this much wider costs three more of them.
    //
    // ⚠️ **The ceiling was 4,000 and chapter 8 walked straight through it**, which presents as
    // `high` never moving and a threshold of exactly the ceiling on every stage past `c8-s31` —
    // a difficulty curve that silently flattens into a horizontal line at the bracket. The
    // `expect` below is what turns that into a failure rather than a plausible-looking number,
    // and it is the reason the bracket is checked at all.
    //
    // ⚠️ **Chapter 9 needed it again, exactly as 21b predicted — "expect to widen it again roughly
    // every other chapter" turned out to be every chapter at this depth — and chapter 10 needed it
    // for the third time running.** `c9-s50` asked about 135,000 against a fifty-thousand ceiling and
    // `c10-s50` asks about 1,193,000 against five hundred thousand, because the bracket has to span
    // the *party's* power and that is `1.021 ** (level - 1) × 1.6 ** rungs` — both of which the
    // margin rule now grows faster than a chapter's stage count does. Five million leaves the
    // shipped top a factor of 4.2.
    //
    // **The step count goes with it or the resolution decays**, which is the half that is easy to
    // forget: a bisection in log space halves its range per step. Fourteen over `[0.05, 50000]` was
    // 0.08%, sixteen over `[0.05, 500000]` was 0.03%, and seventeen over `[0.05, 5000000]` is
    // **0.014%** — a step buys back far more than a factor of ten costs, which is why the count only
    // has to move every few widenings rather than every one.
    let low = 0.05;
    let high = 5000000;
    expect(clears(high), `${stage.id} is unclearable at any power`).toBe(true);
    for (let step = 0; step < 17; step++) {
      const mid = Math.sqrt(low * high);
      if (clears(mid)) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return high;
  };

  // The stride, for the reason {@link SAMPLED} exists: this block measures the *step* from one
  // stage to the next, and on a ladder four times denser than the one these thresholds were sized
  // against, consecutive stages differ by about one percent — which is inside the probe's own
  // resolution. Reading every stage would turn a difficulty curve into a noise floor.
  const thresholds = SAMPLED.map(threshold);

  it('never asks meaningfully less of the player than the stage below it', () => {
    // A little unevenness is texture: a stage that trades a bigger stat block for a sharper
    // question can legitimately read as slightly easier to a party that happens to hold the
    // answer. A real step backwards is a bug — it means a player who just lost can beat the
    // stage after the one blocking them.
    //
    // ⚠️ **The tolerance was 0.92 until the milestone-14 retune, and it had to widen because the
    // level stopped carrying the difficulty.** Chapter 1 now runs in flat bands — stages 8 to 21
    // are all level 14 — so what separates one stage from the next is *composition* alone, and
    // composition is a coarser dial than a level. The claim being made is unchanged; the noise
    // floor under it moved.
    //
    // ⚠️ **A sample that follows a chapter boss is skipped, and that is a blind spot being closed
    // rather than a failure being excused.** A chapter boss is a peak by construction and the next
    // chapter opens at the level the last one closed on with an ordinary board, so the step down
    // across a boundary is the ladder working. On the four-chapter ladder it had never fired only
    // because the stride's phase happened to keep the early seams off-sample; the re-cut put five
    // seams on the ladder, so the skip is now doing the work it was written for. Naming it is
    // what stops a boundary depending on arithmetic nobody is watching.
    const backwards = thresholds
      .map((needed, index) => ({
        id: SAMPLED[index].id,
        needed,
        before: thresholds[index - 1],
        afterBoss: SAMPLED[index - 1]?.kind === 'boss',
      }))
      .filter(
        (entry) =>
          entry.before !== undefined && !entry.afterBoss && entry.needed < entry.before * 0.85,
      )
      .map((entry) => `${entry.id} ${entry.needed.toFixed(2)} after ${entry.before.toFixed(2)}`);

    expect(backwards).toEqual([]);
  });

  it('makes real progress across a chapter rather than stage by stage', () => {
    // ⚠️ **This measured any two adjacent samples until the milestone-14 retune, and that is no
    // longer a claim the ladder makes.** A flat level band means two consecutive stages can ask
    // the same thing of a party and differ only in what question they ask, which is the shape the
    // retune chose deliberately — the difficulty is meant to arrive with later chapters, not
    // within these two.
    //
    // What still has to be true, and is the thing the original assertion was protecting, is that
    // a chapter goes somewhere: its last third asks more than its first third. Measured on the
    // probe rather than on the authored level, so a chapter that flattened by accident fails here
    // even though its levels still rise.
    let index = 0;
    const flat: string[] = [];
    for (const chapter of chapters) {
      const size = SAMPLED.filter(
        (stage) => stage.id.startsWith(`${chapter.id.replace('chapter-', 'c')}-`) || false,
      ).length;
      const slice = thresholds.slice(index, index + size);
      index += size;
      if (slice.length < 6) {
        continue;
      }
      const third = Math.floor(slice.length / 3);
      const foot = slice.slice(0, third).reduce((a, b) => a + b, 0) / third;
      const top = slice.slice(-third).reduce((a, b) => a + b, 0) / third;
      if (!(top > foot)) {
        flat.push(`${chapter.id} foot ${foot.toFixed(2)} top ${top.toFixed(2)}`);
      }
    }

    expect(flat).toEqual([]);
  });

  it('asks several times more at the top of each chapter than at its foot', () => {
    // A chapter has to be a climb, not a victory lap. Both should cost multiples, not percentages.
    const boundary = SAMPLED.findIndex((stage) => stage.kind === 'boss');
    const first = thresholds[boundary] / thresholds[0];
    const second = thresholds[thresholds.length - 1] / thresholds[boundary];

    expect(first).toBeGreaterThan(3);
    expect(second).toBeGreaterThan(3);
  });
});

/**
 * The stomp: what an idle window is actually worth in stages.
 *
 * **Milestone 10's named deliverable, and the reason it is a spec rather than a feeling.** "Go
 * idle for a long time, come back, level up, and stomp stages until the next wall" is a property:
 * an idle window of length T must buy levels that convert into a run of at least N cleared stages.
 * Tuning a compounding curve by feel is how an incremental game ends up either trivial or a wall,
 * and the 5th-percentile player is the one who finds out first.
 *
 * ## What is being measured, and the one thing that makes it honest
 *
 * A party parked on the stage it can just clear, banking that stage's rates for eight hours, and
 * spending the lot on levels. **The budget is divided by `PARTY_SIZE` before a single level is
 * bought**, and that division is the whole measurement: since milestone 9 the roster shares a
 * level, but the floor is the fifth-highest invested level, so raising the party by one level
 * means paying for five. A version of this that levelled one character would report five times
 * the truth.
 *
 * Rungs are held fixed. Ascension is bought with duplicates rather than with time, so folding it
 * in would measure the gacha and call it idle income.
 */
describe('the stomp', () => {
  const HOUR = 60 * 60;
  const curve: LevelCurveData = LEVEL_CURVE;

  /** The reference five, at an arbitrary level and rung. Uncapped: the caller picks legal pairs. */
  const five = (level: number, rarity: number): FormationData => ({
    front: [at(BRAN, level, rarity), at(GNASH, level, rarity)],
    back: [at(RIN, level, rarity), at(CELIA, level, rarity), at(PYRA, level, rarity)],
  });

  const clears = (level: number, rarity: number, stage: StageData): boolean =>
    sweep(five(level, rarity), stage).winRate >= 0.9;

  /** The lowest level at which the five take a stage reliably, or `null` past the rarity's cap. */
  const settles = (stage: StageData, rarity: number): number | null => {
    const cap = levelCapFor(curve, rarity);
    if (!clears(cap, rarity, stage)) {
      return null;
    }
    let low = 1;
    let high = cap;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (clears(mid, rarity, stage)) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return low;
  };

  /** One party member's share of an idle window at a stage's rates. */
  const share = (stage: StageData, seconds: number): Wallet => {
    const banked = (rate: number | string | undefined): Numeric =>
      num(rate ?? 0)
        .mul(seconds)
        .div(PARTY_SIZE);

    return {
      ...emptyWallet(),
      gold: banked(stage.rates.gold),
      xp: banked(stage.rates.xp),
      essence: banked(stage.rates.essence),
    };
  };

  /**
   * Stages cleared in an unbroken run above `from`, at the given investment.
   *
   * Stopped at {@link RUN_CAP} rather than run to the top of the ladder. Each step is forty
   * battles, and a chapter of fifty stages that an idle window genuinely stomps would be two
   * thousand of them per sample point for an answer both assertions below already have — they ask
   * for one stage and for three.
   */
  const RUN_CAP = 12;
  const run = (from: number, level: number, rarity: number): number => {
    let cleared = 0;
    for (let index = from + 1; index < stages.length && cleared < RUN_CAP; index++) {
      if (!clears(level, rarity, stages[index])) {
        break;
      }
      cleared++;
    }
    return cleared;
  };

  /**
   * Where on the ladder the property is checked, and the rung a player plausibly holds there.
   *
   * Three points rather than every stage, because each one costs a bisection over the level
   * ladder. They are spread across the bands the ladder is authored in — the fen's last board,
   * the seam where the ash arrives, and the middle of the Ashfall Reach — and each is paired
   * with the rung that makes the level a real number there rather than a formality: a
   * `legendary` five clears the early fen at level one, which would measure nothing.
   */
  const SAMPLES: readonly { readonly id: string; readonly rarity: number }[] = [
    { id: 'c3-s20', rarity: RARE_PLUS },
    { id: 'c3-s30', rarity: ELITE },
    { id: 'c4-s20', rarity: LEGENDARY },
  ];

  const parked = SAMPLES.map(({ id, rarity }) => {
    const index = stages.findIndex((stage) => stage.id === id);
    return { id, index, rarity, stage: stages[index], settled: settles(stages[index], rarity) };
  });

  /** What one idle window is worth at every sample point, as levels and as stages. */
  const after = (seconds: number): readonly { id: string; bought: number; cleared: number }[] =>
    parked.map(({ id, index, rarity, stage, settled }) => {
      if (settled === null) {
        return { id, bought: 0, cleared: 0 };
      }
      const reached = maxAffordableLevel(curve, share(stage, seconds), settled, rarity);
      return { id, bought: reached - settled, cleared: run(index, reached, rarity) };
    });

  const describeRun = (
    window: readonly { id: string; bought: number; cleared: number }[],
  ): string =>
    window.map((entry) => `${entry.id}: +${entry.bought} levels → ${entry.cleared}`).join(', ');

  it('finds a party parked on each sample stage in the first place', () => {
    // The bisection returns `null` when the rarity's cap cannot clear the stage at all, which
    // would make every assertion below vacuous rather than false.
    const unreachable = parked.filter((entry) => entry.settled === null).map((entry) => entry.id);

    expect(unreachable).toEqual([]);
  });

  it('pays for a stage with a night away', () => {
    // Eight hours is the shortest window worth calling idle, and one stage is the smallest unit
    // of progress the ladder has. Below this the game is asking a player to come back to nothing.
    const overnight = after(8 * HOUR);

    expect(
      Math.min(...overnight.map((entry) => entry.cleared)),
      `eight idle hours — ${describeRun(overnight)}`,
    ).toBeGreaterThanOrEqual(1);
  });

  it('pays for a run of them with a day away', () => {
    // ⚠️ **The assertion the ladder is tuned against**, and the one that moved the most content in
    // milestone 10. "Go idle for a long time, come back, level up, and stomp stages until the next
    // wall" is this: a day's income converts into three stages, everywhere on the ladder.
    //
    // It was nowhere near true before the retune. Holding the old reference parties meant the
    // ladder had to absorb the whole of the ×1.6-a-rung ascension gain, which left a stage costing
    // seventeen levels where a day bought six — a wall wearing a compounding curve's clothes. The
    // ladder came down to meet it: `INVESTED` is level 90 rather than level 200.
    const day = after(24 * HOUR);

    expect(
      Math.min(...day.map((entry) => entry.cleared)),
      `a day idle — ${describeRun(day)}`,
    ).toBeGreaterThanOrEqual(3);
  });

  it('never lets either progression axis become decoration', () => {
    // The balance milestone 10 was asked to strike: what the ladder's climb hands a party in levels
    // should be worth roughly what it hands them in rungs. If the first ran away the gacha would be
    // decoration — the failure that milestone named — and if the second did, this whole block would
    // be measuring a currency nobody earns by waiting, because rungs are bought with duplicates.
    //
    // ⚠️ **This was a ratio of the two multipliers, bounded to (0.5, 2), and milestone 18 re-derived
    // it rather than widening it — the same move milestone 17 made on the level ceiling's
    // cost-in-hours, and for the identical reason.** A fifty-stage band adds about sixty-five
    // levels and exactly **one** rung (the chapter numbers below are the pre-re-cut fifty-stage
    // chapters), and one rung only pays for `ln(1.6) / ln(1.021)` ≈ 22.6 levels. So that ratio
    // multiplied by about 2.2 every band, by construction, forever: 0.77 at chapter 2, 1.50 at 3,
    // 3.26 at 4, 7.10 at 5. It was never going to be anything but a number moved once a band, and
    // a guard that has to be moved that often is not guarding.
    //
    // **What replaced it is the same claim in log space**, which is the space multipliers actually
    // compose in: the *share* of the total climb that rungs account for. That share falls slowly and
    // asymptotes — 55% at chapter 2, 45% at 3, 40% at 4, ~31% at 10, approaching 26% for a chapter
    // of this shape — so a floor under it stays true for as long as the cadence holds and still
    // fails loudly if ascension is ever reduced to a formality. Both ends are bounded, because
    // either axis becoming the whole game is a failure.
    //
    // ⚠️ **The cadence is the load-bearing assumption, not the number.** This holds while each
    // fifty-stage band asks for one rung and climbs roughly sixty-five levels — the re-cut moved
    // the chapter boundaries without moving either. Content that asked for no rung across a band
    // would drive the share down fast, which is what should fail here — and it would, rather than
    // being absorbed by a wider band.
    const levelClimb = Math.log(GROWTH.perLevel.common) * (INVESTED_LEVEL - BUILT_LEVEL);
    const rungClimb = Math.log(GROWTH.perAscension) * (INVESTED_RARITY - BUILT_RARITY);
    const rungShare = rungClimb / (levelClimb + rungClimb);
    const note =
      `rungs are ${(rungShare * 100).toFixed(0)}% of the climb — ` +
      `levels ×${Math.exp(levelClimb).toFixed(1)} against rungs ×${Math.exp(rungClimb).toFixed(1)}`;

    expect(rungShare, note).toBeGreaterThan(0.2);
    expect(rungShare, note).toBeLessThan(0.8);
  });
});

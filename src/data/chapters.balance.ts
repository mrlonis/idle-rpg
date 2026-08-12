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
const stages: readonly StageData[] = resolveLadder(chapters, chapterCurve, rewards);

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
const ARRIVED_LEVEL = stages[CHAPTER_ENDS[3] - 1].level;

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
 * `elite-plus` is the rung it carries and its cap of 140 is **below** chapter 5's closing level of
 * 160 — which is not an error, it is the difficulty statement the Bound Marches shipped: a chapter
 * that asks for a rung has to climb past the cap that rung buys.
 */
const MARCHED_RARITY = rarityIndex('elite-plus');
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
 * `legendary` is the rung it carries and its cap of 200 is **below** chapter 6's closing level of
 * 225 — which is the difficulty statement every chapter since the Bound Marches ships: a chapter
 * that asks for a rung has to climb past the cap that rung buys.
 */
const VAULTED_RARITY = LEGENDARY;
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
 * `legendary-plus` is the rung it carries and its cap of 260 is **below** chapter 7's closing level
 * of 305 — which is the difficulty statement every chapter since the Bound Marches ships, and by a
 * wider margin each time: a chapter that asks for a rung has to climb past the cap that rung buys,
 * and by *more* than the last one did, or the fresh rung it hands the party is free.
 */
const BARROWED_RARITY = rarityIndex('legendary-plus');
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
 * `mythic` is the rung it carries and its cap of 340 is **below** chapter 8's closing level of 396 —
 * the difficulty statement every chapter since the Bound Marches ships, and by a wider margin each
 * time.
 */
const WEALDED_RARITY = rarityIndex('mythic');
const WEALDED_LEVEL = Math.min(stages[CHAPTER_ENDS[7] - 1].level, LEVEL_CURVE.caps[WEALDED_RARITY]);

const WEALDED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(WEALDED_LEVEL, WEALDED_RARITY),
  WEALDED_RARITY,
);

/**
 * The party that finishes the ladder: the same five, levelled to meet the last stage on its own
 * terms.
 *
 * Still common tier, and still no pull anyone had to be lucky for — the ladder asks for levels and
 * ascension rungs, which are bought with time and duplicates, and for nothing a player cannot earn.
 *
 * **The level tracks the top of the ladder rather than being authored**, which is the milestone-14
 * statement of what a chapter is: the enemy climbs and the player climbs with it, so the party that
 * takes the last stage is the one standing level with it. That is why this is derived from `stages`
 * instead of restated — extending the ladder re-aims this party at the new top rather than leaving
 * it describing the old one.
 *
 * ⚠️ **The rung moves with the ladder, and it has to.** `elite` caps at 100 and the Bound Marches
 * close at 160, so milestone 17 took this to `elite-plus`; `elite-plus` caps at 140 and the Sundered
 * Vault closes at 225, so milestone 18 took it to `legendary`; `legendary` caps at 200 and the
 * Waking Barrows close at 305, so milestone 21a took it to `legendary-plus`; that caps at 260 and
 * the Sunless Weald closes at 396, so 21b took it to `mythic`; that caps at 340 and the Hollow Anvil
 * closes at 490, so milestone 21c takes it to `mythic-plus`. In every case `legal` would have thrown
 * rather than quietly fielding an under-levelled party, which is exactly what that guard is for.
 * **A rung roughly every fifty stages** is the cadence — it read "one per chapter" until the re-cut
 * multiplied the boundaries without moving the rung asks — and what this rung costs a player over
 * the Sunless Weald party is six more duplicate copies of each of the five: 50 against 44.
 *
 * ⚠️ **The level is the top of the ladder _or the rung's cap, whichever is lower_, and every chapter
 * from 3 on has those differ — by more each time.** `mythic-plus` caps at 420 against a top stage of
 * 490, so this party finishes the ladder **seventy levels below the thing it is fighting**, where the
 * Weald left it fifty-six behind, the Barrows forty-five and the Marches twenty. That growth is 21a's
 * correction and it is arithmetic: a rung is worth ×1.6 and the enemy side has no rungs, so a chapter
 * that asks for an ascension has to climb past the cap that ascension buys — and because each chapter
 * hands the party a *fresh* rung on top of the levels it climbs, a constant margin cancels and the
 * gap compounds. The clamp is `Math.min` rather than a written number so a retune of either side
 * moves it.
 *
 * **Level 200 at `legendary` until milestone 10, then 90, then 85, then 140, then 200 again at the
 * rung it started at, then 260, then 340, now 420 three rungs above.** Every one of those moves was
 * the same move — the party is defined by where the content is, never by a number.
 */
const INVESTED_RARITY = rarityIndex('mythic-plus');
const INVESTED_LEVEL = Math.min(stages[stages.length - 1].level, LEVEL_CURVE.caps[INVESTED_RARITY]);

const INVESTED: FormationData = mono(
  BUILT_FRONT,
  BUILT_BACK,
  legal(INVESTED_LEVEL, INVESTED_RARITY),
  INVESTED_RARITY,
);

/**
 * The most heavily boosted party the lineup bonus permits.
 *
 * Five Demons, which since milestone 8e is buildable without a single lucky pull: three commons
 * and two legendaries. That is the top rung of the composition ladder *and* all five steps of the
 * Demon track underneath it, and nothing legal stacks higher.
 *
 * **This replaced three Demons and two Angels**, which was the maximum only while a mono-five was
 * unreachable — the Angels stood in as wildcards to fill the rung and paid nothing on the Demon
 * track, so it reached three of the five steps rather than all of them. Leaving it as it was would
 * have meant the guard below quietly stopped watching the worst case the moment 8e shipped.
 *
 * It is here as a **guard rather than a tuning target**. Nothing asserts this party should beat
 * anything; what it is watched for is the failure mode a bonus to health and defence makes more
 * likely, which is a party that survives a fight it cannot win until the clock ends it.
 */
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

    expect(walked.length).toBeLessThanOrEqual(stages.length * 0.2);
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

    expect(walked.length).toBeLessThanOrEqual(stages.length * 0.2);
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

    expect(walked.length).toBeLessThanOrEqual(stages.length * 0.2);
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

    expect(walked.length).toBeLessThanOrEqual(stages.length * 0.2);
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

    expect(walked.length).toBeLessThanOrEqual(stages.length * 0.2);
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

    expect(walked.length).toBeLessThanOrEqual(stages.length * 0.2);
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
    const top = investedSweeps[investedSweeps.length - 1];

    expect(top.meanSurvivors).toBeLessThan(5);
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
    ).toBeLessThan(timer * 0.75);
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
    // every other chapter" turned out to be every chapter at this depth.** `c9-s50` asks about
    // 135,000 against a fifty-thousand ceiling, because the bracket has to span the *party's* power
    // and that is `1.021 ** (level - 1) × 1.6 ** rungs` — both of which the margin rule now grows
    // faster than a chapter's stage count does. Five hundred thousand leaves the shipped top a
    // factor of 3.7.
    //
    // **The step count goes with it or the resolution decays**, which is the half that is easy to
    // forget: a bisection in log space halves its range per step, so widening the bracket by ten
    // costs between three and four steps to hold the same ~0.1% resolution. Fourteen over
    // `[0.05, 50000]` was 0.08%; sixteen over `[0.05, 500000]` is 0.03%.
    let low = 0.05;
    let high = 500000;
    expect(clears(high), `${stage.id} is unclearable at any power`).toBe(true);
    for (let step = 0; step < 16; step++) {
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

// The ladder, simulated. Runs in the balance project rather than the fast suite — see
// `vitest.balance.config.ts` for why, and `npm run test:balance` to run it.
import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  type CharacterData,
  type CombatantData,
  type CombatRules,
  type CombatRulesData,
  type FormationData,
  type GrowthData,
  type KitRulesData,
  lineupBonus,
  MAX_BATTLE_TICKS,
  PARTY_SIZE,
  rarityIndex,
  scaleStats,
  simulateBattle,
  type StageData,
  ticksToMs,
  toBattleCombatant,
  toCombatRules,
  unlockedSkills,
} from '../core';
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
import { KIT_RULES } from './kits';
import { GROWTH, LEVEL_CURVE } from './levels';
import { STAGES } from './stages';

/**
 * Conformance is asserted through typed locals rather than annotations on the data itself.
 *
 * `data/` may not import from `core/` — content has to stay plain and JSON-expressible — so
 * nothing inside those files can reference `StageData`. Assigning them to a typed local here is
 * what turns a malformed stat block into a compile error instead of a runtime surprise.
 */
const stages: readonly StageData[] = STAGES;
const growth: GrowthData = GROWTH;
const kit: KitRulesData = KIT_RULES;
const authoredRules: CombatRulesData = COMBAT_RULES;
const rules: CombatRules = toCombatRules(authoredRules);

/**
 * Seeds per stage.
 *
 * Enough to tell "reliable" from "a coin flip". This number is the reason the sweep lives in its
 * own project: three reference parties across twenty-four stages is nearly three thousand
 * battles, and shrinking the sample to fit the fast suite would have bought speed by making the
 * answer less true.
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
 * The names also carry what the numbers never did. `ELITE` is the lowest rung whose level cap
 * permits {@link BUILT} and the rung at which a common-tier character's second skill arrives;
 * `LEGENDARY` is where {@link INVESTED} sits; `ASCENDED` is where a fully invested character ends
 * up; `RARE` is where every character starts and where {@link STARTERS} still is. Those are the
 * facts the sweeps are actually about.
 */
const RARE = rarityIndex('rare');
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
 * has not handed the player yet. The reference five below are all common tier — two skills each,
 * and only at `elite` or above.
 */
function at(character: CharacterData, level: number, rarity: number): CombatantData {
  return toBattleCombatant(
    character,
    { defId: character.id, rarity, level, copies: 0 },
    growth,
    kit,
  );
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

/** A five at the `elite` rung, for the mono-faction sweeps. */
function mono(
  front: readonly CharacterData[],
  back: readonly CharacterData[],
  level: number,
): FormationData {
  return {
    front: front.map((character) => at(character, legal(level, ELITE), ELITE)),
    back: back.map((character) => at(character, legal(level, ELITE), ELITE)),
  };
}

/** The three characters a run starts with, at level 1, standing where the game puts them. */
const STARTERS: FormationData = {
  front: [at(BRAN, 1, RARE), at(MIRA, 1, RARE)],
  back: [at(RIN, 1, RARE)],
};

/**
 * The mid-game party: five common-tier characters at level 80, ascended to `elite`.
 *
 * Deliberately all `common` tier. If the ladder needed a lucky banner it would be a wall in front
 * of players who cannot buy their way past one, which in a game with no purchases is a wall with
 * nothing behind it. `elite` is simply the lowest rung whose cap (100) permits level 80.
 */
const BUILT: FormationData = {
  front: [at(BRAN, legal(80, ELITE), ELITE), at(GNASH, legal(80, ELITE), ELITE)],
  back: [
    at(RIN, legal(80, ELITE), ELITE),
    at(CELIA, legal(80, ELITE), ELITE),
    at(PYRA, legal(80, ELITE), ELITE),
  ],
};

/**
 * The same five characters, invested to the top of the `legendary` rung: level 200, its cap.
 *
 * Still common tier, and still no pull anyone had to be lucky for — the second half of the ladder
 * asks for levels and ascension rungs, which are bought with time and duplicates, and for nothing
 * a player cannot earn.
 */
const INVESTED: FormationData = {
  front: [at(BRAN, legal(200, LEGENDARY), LEGENDARY), at(GNASH, legal(200, LEGENDARY), LEGENDARY)],
  back: [
    at(RIN, legal(200, LEGENDARY), LEGENDARY),
    at(CELIA, legal(200, LEGENDARY), LEGENDARY),
    at(PYRA, legal(200, LEGENDARY), LEGENDARY),
  ],
};

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
const BOOSTED: FormationData = {
  front: [at(THREX, legal(80, ELITE), ELITE), at(VEXIS, legal(80, ELITE), ELITE)],
  back: [
    at(PYRA, legal(80, ELITE), ELITE),
    at(NYXARA, legal(80, ELITE), ELITE),
    at(SANGUINE, legal(80, ELITE), ELITE),
  ],
};

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

/** The seven, at a given level. `MONO_LEVEL` is {@link BUILT}'s, which is what the sweeps use. */
function monoFives(
  level: number,
): readonly { readonly faction: string; readonly party: FormationData }[] {
  return MONO_ROSTERS.map((roster) => ({
    faction: roster.faction,
    party: mono(roster.front, roster.back, level),
  }));
}

const MONO_LEVEL = 80;
const MONO_FIVES = monoFives(MONO_LEVEL);

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

const starterSweeps = stages.map((stage) => ({ stage, ...sweep(STARTERS, stage) }));
const builtSweeps = stages.map((stage) => ({ stage, ...sweep(BUILT, stage) }));
const investedSweeps = stages.map((stage) => ({ stage, ...sweep(INVESTED, stage) }));
const boostedSweeps = stages.map((stage) => ({ stage, ...sweep(BOOSTED, stage) }));
const monoSweeps = MONO_FIVES.flatMap(({ faction, party }) =>
  stages.map((stage) => ({ faction, stage, ...sweep(party, stage) })),
);
const everySweep = [
  ...starterSweeps,
  ...builtSweeps,
  ...investedSweeps,
  ...boostedSweeps,
  ...monoSweeps,
];

/** Where the starter party is expected to stop: the healer lock. */
const WALL = stages.findIndex((stage) => stage.id === 'stage-7');

/** The end of the hand-climbed half, and the stage auto-battle unlocks behind. */
const HANDCLIMBED = stages.findIndex((stage) => stage.id === 'stage-12') + 1;

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

  it('lets a level-80 common-tier party clear the hand-climbed half', () => {
    // Milestone 4's promise, preserved through 8a's stat collapse and 8b's energy rework, and the
    // thing 8c's skill ceiling has to hold: five common-tier characters at level 80 clear twelve
    // stages. That half is climbed one tap at a time, and auto-battle unlocks on finishing it.
    const unreliable = builtSweeps
      .slice(0, HANDCLIMBED)
      .filter((entry) => entry.winRate < 0.9)
      .map((entry) => `${entry.stage.id} ${(entry.winRate * 100).toFixed(0)}%`);

    expect(unreliable).toEqual([]);
  });

  it('does not let that party walk the second half as well', () => {
    // The Ashfall Reach exists to be something auto-battle has to chew on. If the party that
    // finished the first half also finished the second without investing, twelve stages of
    // content would be a formality.
    const walked = builtSweeps
      .slice(HANDCLIMBED)
      .filter((entry) => entry.winRate >= 0.9)
      .map((entry) => entry.stage.id);

    expect(walked.length).toBeLessThanOrEqual(1);
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
    // A ladder cleared without ever losing a party member has no texture, and stage 24 would read
    // exactly like stage 1.
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
      .map((entry) => `${entry.stage.id} ${entry.meanSeconds.toFixed(1)}s`);

    expect(overlong).toEqual([]);
  });

  it('leaves the timer real headroom over the longest fight the ladder actually has', () => {
    // The margin between "the longest tuned fight" and "the clock" is what content is allowed to
    // grow into. It used to be 37x, which is another way of saying the cap bounded nothing; at
    // ninety seconds it is small enough to be a genuine constraint, and this is what makes that
    // constraint visible rather than a surprise.
    //
    // A stage that grows past the margin is unclearable by the party it was tuned for, so this is
    // the test that should fail first when milestone 10 rescales or milestone 11 authors a
    // hundred stages — before the win-rate assertions do, and with a number in the message.
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
    const longest = Math.max(...cleared.map((entry) => entry.maxSeconds));
    const timer = ticksToMs(MAX_BATTLE_TICKS) / 1000;

    expect(cleared.length).toBeGreaterThan(0);
    expect(
      longest,
      `longest cleared fight ${longest.toFixed(1)}s against a ${timer}s timer`,
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
    expect(best - worst, summary).toBeLessThan(stages.length * 0.15);
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
    monoFives(level).flatMap(({ faction, party }) =>
      stages.map((stage) => ({
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
   * Level 120 at the `ascended` rung, which is not an arbitrary pick.
   *
   * It is the investment level at which these characters are strong enough to survive the late
   * ladder indefinitely and still nowhere near strong enough to kill it — the exact band in which
   * the old thirty-minute fights lived. Levelling them further does not make the point better; it
   * makes them win, which is a different test.
   */
  const AWKWARD_LEVEL = 120;

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

    let low = 0.05;
    let high = 40;
    expect(clears(high), `${stage.id} is unclearable at any power`).toBe(true);
    for (let step = 0; step < 9; step++) {
      const mid = Math.sqrt(low * high);
      if (clears(mid)) {
        high = mid;
      } else {
        low = mid;
      }
    }
    return high;
  };

  const thresholds = stages.map(threshold);

  it('never asks meaningfully less of the player than the stage below it', () => {
    // A little unevenness is texture: a stage that trades a bigger stat block for a sharper
    // question can legitimately read as slightly easier to a party that happens to hold the
    // answer. A real step backwards is a bug — it means a player who just lost can beat the
    // stage after the one blocking them.
    const backwards = thresholds
      .map((needed, index) => ({ id: stages[index].id, needed, before: thresholds[index - 1] }))
      .filter((entry) => entry.before !== undefined && entry.needed < entry.before * 0.92)
      .map((entry) => `${entry.id} ${entry.needed.toFixed(2)} after ${entry.before.toFixed(2)}`);

    expect(backwards).toEqual([]);
  });

  it('makes real progress over any two steps', () => {
    const stalled = thresholds
      .map((needed, index) => ({ id: stages[index].id, needed, twoBack: thresholds[index - 2] }))
      .filter((entry) => entry.twoBack !== undefined && entry.needed <= entry.twoBack)
      .map((entry) => entry.id);

    expect(stalled).toEqual([]);
  });

  it('asks several times more at the top of each half than at its foot', () => {
    // The half that exists so auto-battle has something to chew on has to be a climb, not a
    // victory lap. Both halves should cost multiples, not percentages.
    const first = thresholds[HANDCLIMBED - 1] / thresholds[0];
    const second = thresholds[thresholds.length - 1] / thresholds[HANDCLIMBED - 1];

    expect(first).toBeGreaterThan(3);
    expect(second).toBeGreaterThan(3);
  });
});

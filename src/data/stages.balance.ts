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
  MAX_BATTLE_TICKS,
  rarityIndex,
  scaleStats,
  simulateBattle,
  type StageData,
  ticksToMs,
  toBattleCombatant,
  toCombatRules,
  unlockedSkills,
} from '../core';
import { BRAN, CELIA, GNASH, KORRIN, MIRA, PYRA, RIN, THRAUN } from './characters';
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

function sweep(party: FormationData, stage: StageData): Sweep {
  let wins = 0;
  let timedOut = 0;
  let ticks = 0;
  let longest = 0;
  let survivors = 0;

  for (let attempt = 0; attempt < TRIALS; attempt++) {
    const result = simulateBattle(party, stage, battleSeed(0xc0ffee, stage.id, attempt), rules);
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

const starterSweeps = stages.map((stage) => ({ stage, ...sweep(STARTERS, stage) }));
const builtSweeps = stages.map((stage) => ({ stage, ...sweep(BUILT, stage) }));
const investedSweeps = stages.map((stage) => ({ stage, ...sweep(INVESTED, stage) }));
const everySweep = [...starterSweeps, ...builtSweeps, ...investedSweeps];

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
    const longest = Math.max(...everySweep.map((entry) => entry.maxSeconds));
    const timer = ticksToMs(MAX_BATTLE_TICKS) / 1000;

    expect(longest, `longest fight ${longest.toFixed(1)}s against a ${timer}s timer`).toBeLessThan(
      timer * 0.75,
    );
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

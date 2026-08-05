// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { num } from '../numeric';
import { newGame, type GameState } from '../state';
import { TEST_CHARACTERS, TEST_LEVEL_CURVE } from './fixtures/content';
import { fromSaveData, toSaveData, type RepairOptions } from './serialize';
import { SAVE_VERSION } from './version';

const T0 = 1_700_000_000_000;
const OPTIONS: RepairOptions = {
  fallbackSeed: 0xabcdef,
  nowMs: T0,
  characters: TEST_CHARACTERS,
  levelCurve: TEST_LEVEL_CURVE,
};

function issueFields(raw: unknown): string[] {
  return fromSaveData(raw, OPTIONS).issues.map((issue) => issue.field);
}

/** A run holding some gold, leaving every other currency at zero. */
function withGold(seed: number, gold: string): GameState {
  const state = newGame({ seed, nowMs: T0 });
  return { ...state, wallet: { ...state.wallet, gold: num(gold) } };
}

describe('toSaveData', () => {
  it('encodes Numeric fields as strings and stamps the current version', () => {
    expect(toSaveData(withGold(99, '1.5e+25'))).toEqual({
      version: SAVE_VERSION,
      wallet: { gold: '1.5e+25', xp: '0', essence: '0', summons: '0', spark: '0', alloy: '0' },
      rates: { gold: '0', xp: '0', essence: '0', summons: '0' },
      lastTickAt: T0,
      rng: { seed: 99, calls: 0 },
      chapter: 1,
      stage: 1,
      clearedStages: 0,
      battleCount: 0,
      roster: [],
      formation: { front: [], back: [] },
      pity: 0,
      pullCount: 0,
      gear: [],
      gearMinted: 0,
      gearShop: { slot: 0, purchased: [] },
    });
  });

  it('produces JSON-serialisable output', () => {
    expect(() => JSON.stringify(toSaveData(withGold(99, '1.5e+25')))).not.toThrow();
  });

  it('encodes the roster as plain records', () => {
    const state: GameState = {
      ...newGame({ seed: 3, nowMs: T0 }),
      roster: [{ defId: 'alpha', rarity: 4, level: 12, copies: 7, gear: {} }],
      formation: { front: ['alpha'], back: [] },
    };

    expect(toSaveData(state).roster).toEqual([
      { defId: 'alpha', rarity: 4, level: 12, copies: 7, gear: {} },
    ]);
    expect(toSaveData(state).formation).toEqual({ front: ['alpha'], back: [] });
  });
});

describe('round-trip', () => {
  it('preserves state exactly through save and load', () => {
    const base = newGame({ seed: 0xdeadbeef, nowMs: T0 });
    const original: GameState = {
      ...base,
      wallet: {
        ...base.wallet,
        gold: num('9.87654321e+42'),
        summons: num('4200'),
        spark: num('9'),
      },
      rates: { ...base.rates, gold: num('1234.5'), essence: num('0.05') },
      rng: { seed: 0xdeadbeef, calls: 8321 },
      chapter: 2,
      stage: 6,
      clearedStages: 5,
      roster: [{ defId: 'gamma', rarity: 5, level: 40, copies: 2, gear: {} }],
      formation: { front: ['gamma'], back: [] },
      pity: 22,
      pullCount: 631,
    };

    const { state, issues } = fromSaveData(
      JSON.parse(JSON.stringify(toSaveData(original))),
      OPTIONS,
    );

    expect(issues).toEqual([]);
    expect(state.wallet.gold.eq(original.wallet.gold)).toBe(true);
    expect(state.wallet.summons.eq(original.wallet.summons)).toBe(true);
    expect(state.wallet.spark.eq(original.wallet.spark)).toBe(true);
    expect(state.rates.gold.eq(original.rates.gold)).toBe(true);
    expect(state.rates.essence.eq(original.rates.essence)).toBe(true);
    expect(state.lastTickAt).toBe(original.lastTickAt);
    expect(state.rng).toEqual(original.rng);
    expect(state.roster).toEqual(original.roster);
    expect(state.formation).toEqual(original.formation);
    expect(state.pity).toBe(22);
    expect(state.pullCount).toBe(631);
    expect(state.clearedStages).toBe(5);
  });

  it('preserves magnitudes past float64 exact-integer range', () => {
    const original = withGold(1, '1.2345e+180');

    const { state } = fromSaveData(JSON.parse(JSON.stringify(toSaveData(original))), OPTIONS);

    expect(state.wallet.gold.toString()).toBe('1.2345e+180');
  });
});

describe('fromSaveData repair', () => {
  it('never throws, whatever it is handed', () => {
    for (const raw of [
      null,
      undefined,
      'string',
      42,
      [],
      {},
      { wallet: {} },
      { wallet: { gold: {} } },
      { rng: 'no' },
      { roster: 'not an array' },
      { roster: [null, 5, 'x'] },
      { formation: 'nope' },
    ]) {
      expect(() => fromSaveData(raw, OPTIONS)).not.toThrow();
    }
  });

  it.each([
    { label: 'unparseable gold', raw: { wallet: { gold: 'garbage' } } },
    { label: 'NaN gold', raw: { wallet: { gold: Number.NaN } } },
    { label: 'null gold', raw: { wallet: { gold: null } } },
    { label: 'missing wallet', raw: {} },
    { label: 'object gold', raw: { wallet: { gold: { v: 1 } } } },
  ])('defaults $label to 0 and reports it', ({ raw }) => {
    const { state, issues } = fromSaveData(raw, OPTIONS);

    expect(state.wallet.gold.toString()).toBe('0');
    expect(issues.map((issue) => issue.field)).toContain('wallet.gold');
  });

  it('clamps negative gold to zero', () => {
    const { state, issues } = fromSaveData({ wallet: { gold: '-500' } }, OPTIONS);

    expect(state.wallet.gold.toString()).toBe('0');
    expect(issues.map((issue) => issue.problem).join()).toMatch(/negative/);
  });

  it('defaults a damaged rate to zero, matching a fresh run', () => {
    // Idle income is earned by clearing stages, so inventing a rate would hand out progression
    // that was never made. It self-heals: the next clear raises the rate to what the stage
    // grants, and `applyBattleResult` only ever raises it.
    const { state } = fromSaveData({ rates: { gold: 'garbage', xp: '-3' } }, OPTIONS);

    expect(state.rates.gold.toString()).toBe('0');
    expect(state.rates.xp.toString()).toBe('0');
  });

  it.each([
    { label: 'missing', raw: {} },
    { label: 'NaN', raw: { lastTickAt: Number.NaN } },
    { label: 'a string', raw: { lastTickAt: 'yesterday' } },
    { label: 'negative', raw: { lastTickAt: -1 } },
  ])('falls back to now for a lastTickAt that is $label', ({ raw }) => {
    const { state, issues } = fromSaveData(raw, OPTIONS);

    expect(state.lastTickAt).toBe(T0);
    expect(issues.map((issue) => issue.field)).toContain('lastTickAt');
  });

  it('normalises a future lastTickAt to now so the offline window is never negative', () => {
    // The device clock moved backwards since the save was written.
    const { state, issues } = fromSaveData({ lastTickAt: T0 + 86_400_000 }, OPTIONS);

    expect(state.lastTickAt).toBe(T0);
    expect(issues.map((issue) => issue.field)).toContain('lastTickAt');
  });

  it('adopts the fallback seed when the save has none', () => {
    const { state, issues } = fromSaveData({ rng: {} }, OPTIONS);

    expect(state.rng.seed).toBe(0xabcdef);
    expect(issues.map((issue) => issue.field)).toContain('rng.seed');
  });

  it.each([
    { label: 'negative', calls: -5 },
    { label: 'fractional', calls: 1.5 },
    { label: 'NaN', calls: Number.NaN },
    { label: 'a string', calls: '100' },
  ])('resets an rng.calls that is $label to 0', ({ calls }) => {
    const { state } = fromSaveData({ rng: { seed: 1, calls } }, OPTIONS);

    expect(state.rng.calls).toBe(0);
  });

  describe('the roster', () => {
    it('drops a character this build no longer ships', () => {
      // The stated rule, and the reason the repair pass takes a character lookup at all: an id
      // nothing can render must not survive into the UI as a crash.
      const { state, issues } = fromSaveData(
        {
          roster: [
            { defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} },
            { defId: 'ghost' },
          ],
        },
        OPTIONS,
      );

      expect(state.roster.map((owned) => owned.defId)).toEqual(['alpha']);
      expect(issues.map((issue) => issue.problem).join()).toMatch(/unknown character "ghost"/);
    });

    it('drops a duplicate entry rather than owning a character twice', () => {
      const { state, issues } = fromSaveData(
        {
          roster: [
            { defId: 'alpha', rarity: 0, level: 5, copies: 1, gear: {} },
            { defId: 'alpha', rarity: 3, level: 9, copies: 4, gear: {} },
          ],
        },
        OPTIONS,
      );

      expect(state.roster).toHaveLength(1);
      expect(state.roster[0].level).toBe(5);
      expect(issues.map((issue) => issue.problem).join()).toMatch(/duplicate/);
    });

    it('clamps a damaged rarity and level rather than dropping the character', () => {
      // The one recoverable kind of damage here. Keeping it is the difference between a player
      // losing one character's progress and losing the character.
      const { state } = fromSaveData(
        { roster: [{ defId: 'alpha', rarity: 99, level: 9999, copies: -4, gear: {} }] },
        OPTIONS,
      );

      expect(state.roster[0].rarity).toBe(13);
      expect(state.roster[0].level).toBe(TEST_LEVEL_CURVE.caps[13]);
      expect(state.roster[0].copies).toBe(0);
    });

    it('never lets a character sit below its tier’s starting rarity', () => {
      // `gamma` is ascended-tier and starts at Elite. At Rare its ascension costs would be
      // computed from a rung it could never have been on.
      const { state } = fromSaveData(
        { roster: [{ defId: 'gamma', rarity: 0, level: 1, copies: 0, gear: {} }] },
        OPTIONS,
      );

      expect(state.roster[0].rarity).toBe(2);
    });

    it('clamps a level above the rarity’s cap', () => {
      const { state } = fromSaveData(
        { roster: [{ defId: 'alpha', rarity: 0, level: 500, copies: 0, gear: {} }] },
        OPTIONS,
      );

      expect(state.roster[0].level).toBe(TEST_LEVEL_CURVE.caps[0]);
    });
  });

  describe('the formation', () => {
    it('drops members who are not owned', () => {
      const { state, issues } = fromSaveData(
        {
          roster: [{ defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} }],
          formation: { front: ['alpha', 'beta'], back: ['ghost'] },
        },
        OPTIONS,
      );

      expect(state.formation).toEqual({ front: ['alpha'], back: [] });
      expect(issues.map((issue) => issue.field)).toEqual(
        expect.arrayContaining(['formation.front[]', 'formation.back[]']),
      );
    });

    it('drops a repeated member rather than letting it stand in both ranks', () => {
      const { state } = fromSaveData(
        {
          roster: [{ defId: 'alpha', rarity: 0, level: 1, copies: 0, gear: {} }],
          formation: { front: ['alpha'], back: ['alpha'] },
        },
        OPTIONS,
      );

      expect(state.formation).toEqual({ front: ['alpha'], back: [] });
    });

    it('trims a rank larger than its capacity', () => {
      const roster = ['alpha', 'beta', 'gamma'].map((defId) => ({
        defId,
        rarity: defId === 'gamma' ? 2 : 0,
        level: 1,
        copies: 0,
      }));

      const { state, issues } = fromSaveData(
        { roster, formation: { front: ['alpha', 'beta', 'gamma'], back: [] } },
        OPTIONS,
      );

      expect(state.formation.front).toEqual(['alpha', 'beta']);
      expect(issues.map((issue) => issue.field)).toContain('formation.front');
    });
  });

  it('reports no issues for a clean save', () => {
    const clean = toSaveData(newGame({ seed: 5, nowMs: T0 }));

    expect(issueFields(clean)).toEqual([]);
  });

  it('reports every damaged field, not just the first', () => {
    const fields = issueFields({
      wallet: { gold: 'x' },
      rates: { gold: 'y' },
      lastTickAt: 'z',
      rng: {},
    });

    expect(fields).toEqual(
      expect.arrayContaining(['wallet.gold', 'rates.gold', 'lastTickAt', 'rng.seed', 'rng.calls']),
    );
  });

  it('always returns a state stamped at the current version', () => {
    expect(fromSaveData({ version: 1 }, OPTIONS).state.version).toBe(SAVE_VERSION);
  });

  describe('the gear mint counter', () => {
    const bagOf = (...ids: string[]) =>
      ids.map((id) => ({ id, slot: 'chest', archetype: 'brawler', grade: 0, level: 1 }));

    /**
     * Only the issues about the counter.
     *
     * These fixtures are deliberately partial — a bare `{ gear, gearMinted }` — so every other
     * field is defaulted and reported. Narrowing here keeps each assertion about the one repair
     * it names rather than about the twenty that come free with an empty object.
     */
    const mintIssues = (raw: unknown) =>
      fromSaveData(raw, OPTIONS).issues.filter((issue) => issue.field === 'gearMinted');

    it('recovers a damaged counter to the highest id in the bag, reporting it once', () => {
      // ⚠️ Reissuing a live id is the one kind of gear damage that produces a *plausible* wrong
      // answer rather than a missing one: the next drop takes an id something is already wearing,
      // and a loadout silently rebinds to a different object. So a damaged counter recovers to what
      // the bag proves has been minted rather than to zero.
      //
      // One issue, not two. Defaulting to zero and then clamping up reaches the same number by a
      // route that reports the same field twice, which reads as two separate things having gone
      // wrong.
      const raw = { gear: bagOf('g3', 'g7'), gearMinted: 'nonsense' };

      expect(fromSaveData(raw, OPTIONS).state.gearMinted).toBe(7);
      expect(mintIssues(raw)).toHaveLength(1);
    });

    it('raises a counter that has fallen behind the bag, and says so', () => {
      const raw = { gear: bagOf('g9'), gearMinted: 2 };

      expect(fromSaveData(raw, OPTIONS).state.gearMinted).toBe(9);
      expect(mintIssues(raw)).toHaveLength(1);
    });

    it('reads the highest id rather than the bag length, since pieces get salvaged out', () => {
      const raw = { gear: bagOf('g40'), gearMinted: 40 };

      expect(fromSaveData(raw, OPTIONS).state.gearMinted).toBe(40);
      expect(mintIssues(raw)).toEqual([]);
    });

    it('leaves a counter ahead of the bag alone', () => {
      // The ordinary state of any run that has ever salvaged anything.
      const raw = { gear: bagOf('g2'), gearMinted: 11 };

      expect(fromSaveData(raw, OPTIONS).state.gearMinted).toBe(11);
      expect(mintIssues(raw)).toEqual([]);
    });
  });
});

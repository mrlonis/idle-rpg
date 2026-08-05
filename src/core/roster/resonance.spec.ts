// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { emptyWallet, type Wallet } from '../currency';
import { num } from '../numeric';
import { PARTY_SIZE } from '../state';
import { TEST_LEVEL_CURVE as CURVE } from './fixtures';
import { levelCapFor } from './level';
import {
  effectiveLevel,
  isResonated,
  maxAffordableResonance,
  resonanceAnchors,
  resonanceCeiling,
  resonanceFloor,
  resonancePlan,
} from './resonance';
import { type OwnedCharacter } from './types';

/**
 * A roster entry at an explicit level and rung.
 *
 * Rarity 13 — the top of the ladder, and the fixture curve's 100 cap — unless a test is
 * specifically about a cap binding, so a level is never quietly clamped by something the test
 * was not about.
 */
function at(defId: string, level: number, rarity = 13): OwnedCharacter {
  return { defId, rarity, level, copies: 0 };
}

/** A roster of `count` characters at `level`, named `c0`, `c1`, … */
function party(count: number, level: number, rarity = 13): readonly OwnedCharacter[] {
  return Array.from({ length: count }, (_, index) => at(`c${index}`, level, rarity));
}

const RICH: Wallet = { ...emptyWallet(), gold: num(1e15), xp: num(1e15), essence: num(1e15) };

describe('resonanceFloor', () => {
  it('is the level of the fifth-highest character', () => {
    const roster = [at('a', 50), at('b', 40), at('c', 30), at('d', 20), at('e', 10), at('f', 1)];

    expect(resonanceFloor(roster)).toBe(10);
  });

  it('cannot be moved by hyper-levelling one character', () => {
    // The whole reason the floor is the fifth-highest rather than the highest: pouring
    // everything into one favourite has to buy that character's power and nothing else.
    const roster = [at('a', 1), at('b', 1), at('c', 1), at('d', 1), at('e', 1)];
    const favoured = [at('a', 100), ...roster.slice(1)];

    expect(resonanceFloor(favoured)).toBe(resonanceFloor(roster));
  });

  it('does not depend on the order the roster happens to be in', () => {
    // The floor is a level, not a character, so ties need no tiebreak — and the derivation is
    // deterministic without anyone having to decide what beats what.
    const roster = [at('a', 30), at('b', 30), at('c', 10), at('d', 30), at('e', 30), at('f', 30)];

    expect(resonanceFloor([...roster].reverse())).toBe(resonanceFloor(roster));
  });

  it('is the lowest level in a roster smaller than the party', () => {
    // Which is what makes the feature self-neutralising below `PARTY_SIZE`: everybody is already
    // at or above the floor, so nobody can benefit and no special case is needed to say so.
    const roster = [at('a', 40), at('b', 25), at('c', 7)];

    expect(resonanceFloor(roster)).toBe(7);
  });

  it('answers for a roster with nobody in it rather than returning nothing', () => {
    expect(resonanceFloor([])).toBe(1);
  });

  it('treats a damaged level as level one rather than propagating it', () => {
    const roster = [at('a', Number.NaN), at('b', 20), at('c', 20)];

    expect(resonanceFloor(roster)).toBe(1);
  });
});

describe('resonanceAnchors', () => {
  it('names the top five, highest first', () => {
    const roster = [at('e', 10), at('a', 50), at('f', 1), at('c', 30), at('b', 40), at('d', 20)];

    expect(resonanceAnchors(roster).map((owned) => owned.defId)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('keeps roster order among characters tied at the same level', () => {
    // A list that reshuffled between renders would make the resonance panel unreadable, and
    // `Array.prototype.sort` has been specified stable since ES2019 — this pins the reliance.
    const roster = party(6, 20);

    expect(resonanceAnchors(roster).map((owned) => owned.defId)).toEqual([
      'c0',
      'c1',
      'c2',
      'c3',
      'c4',
    ]);
  });

  it('is the whole roster when fewer than a party is owned', () => {
    expect(resonanceAnchors(party(3, 5))).toHaveLength(3);
  });
});

describe('effectiveLevel', () => {
  it('lifts a character to the floor', () => {
    expect(effectiveLevel(CURVE, at('a', 4), 60)).toBe(60);
  });

  it('leaves a character above the floor where it is', () => {
    expect(effectiveLevel(CURVE, at('a', 80), 60)).toBe(80);
  });

  it('still stops at the rarity’s cap, which is what keeps ascension alive', () => {
    // Without this clause resonance would make ascension pointless for everyone outside the top
    // five: raising a cap is the only way to collect more of the floor.
    const rare = at('a', 1, 0);

    expect(levelCapFor(CURVE, 0)).toBe(10);
    expect(effectiveLevel(CURVE, rare, 60)).toBe(10);
  });

  it('reports whether a character is standing above what was paid for', () => {
    expect(isResonated(CURVE, at('a', 4), 60)).toBe(true);
    expect(isResonated(CURVE, at('a', 80), 60)).toBe(false);
    // At its cap and below the floor: carried, but only as far as its own rung allows.
    expect(isResonated(CURVE, at('a', 10, 0), 60)).toBe(false);
  });
});

describe('the floor is monotonically non-decreasing', () => {
  it('cannot fall when a fresh level-1 character joins the roster', () => {
    // The obvious worry about a derived floor — bench levels dropping when the top five change —
    // is impossible rather than merely unlikely, which is why the roster screen shows one number.
    const roster = party(PARTY_SIZE, 40);
    const before = resonanceFloor(roster);

    expect(resonanceFloor([...roster, at('new', 1)])).toBe(before);
  });

  it('rises when a high-level character joins', () => {
    const roster = [at('a', 40), at('b', 40), at('c', 40), at('d', 40), at('e', 10)];

    expect(resonanceFloor([...roster, at('f', 90)])).toBe(40);
  });

  it('never lets any owned character’s effective level fall as the roster grows', () => {
    const roster = party(PARTY_SIZE, 40);
    const grown = [...roster, at('x', 1), at('y', 90), at('z', 1, 0)];
    const floorBefore = resonanceFloor(roster);
    const floorAfter = resonanceFloor(grown);

    for (const owned of roster) {
      expect(effectiveLevel(CURVE, owned, floorAfter)).toBeGreaterThanOrEqual(
        effectiveLevel(CURVE, owned, floorBefore),
      );
    }
  });
});

describe('resonancePlan', () => {
  it('levels only the characters standing on the floor', () => {
    // The mental model the button protects: only the lowest of the five moves the floor, so a
    // step that costs one level is the normal case rather than a special one. The four already
    // above the target are still in the plan's set — they just have nothing to pay.
    const roster = [at('a', 40), at('b', 40), at('c', 40), at('d', 40), at('e', 20)];

    const plan = resonancePlan(roster, CURVE, 21);

    expect(plan?.raises).toEqual([{ defId: 'e', from: 20, to: 21 }]);
  });

  it('levels all five once they have converged, which is the steady state', () => {
    const plan = resonancePlan(party(PARTY_SIZE, 30), CURVE, 31);

    expect(plan?.raises).toHaveLength(PARTY_SIZE);
  });

  it('charges a carried character from the floor rather than from what it was bought at', () => {
    // A level-1 character under a floor of 40 pays for level 41, not for the climb to it. This is
    // the same rule `levelUp` charges by, and the reason resonance is free in price as well as in
    // display.
    const roster = [at('a', 40), at('b', 40), at('c', 40), at('d', 40), at('e', 40), at('f', 1)];

    const one = resonancePlan(roster, CURVE, 41);
    const converged = resonancePlan(party(PARTY_SIZE, 40), CURVE, 41);

    expect(one?.cost.gold?.eq(converged?.cost.gold ?? num(0))).toBe(true);
  });

  it('prices the whole operation, including a lumpy breakthrough', () => {
    // Essence is charged only every tenth level, so the cost of one step is uneven and
    // occasionally several times its neighbours — which is exactly why the button prices the
    // operation before committing to it rather than discovering the shortfall partway through.
    const flat = resonancePlan(party(PARTY_SIZE, 31), CURVE, 32);
    const breakthrough = resonancePlan(party(PARTY_SIZE, 39), CURVE, 40);

    expect(flat?.cost.essence?.eq(0)).toBe(true);
    expect(breakthrough?.cost.essence?.gt(0)).toBe(true);
  });

  it('refuses a target no five characters could stand on', () => {
    // Four can reach it and the fifth is capped at 10, so the floor is stuck until somebody
    // ascends — or a sixth character is levelled past the one that is stuck.
    const roster = [at('a', 40), at('b', 40), at('c', 40), at('d', 40), at('e', 10, 0)];

    expect(resonancePlan(roster, CURVE, 11)).toBeNull();
  });

  it('has nothing to price for a target at or below the floor', () => {
    expect(resonancePlan(party(PARTY_SIZE, 30), CURVE, 30)).toBeNull();
    expect(resonancePlan(party(PARTY_SIZE, 30), CURVE, 12)).toBeNull();
  });

  it('has nothing to price for a roster with nobody in it', () => {
    expect(resonancePlan([], CURVE, 5)).toBeNull();
  });
});

describe('resonanceCeiling', () => {
  it('is the fifth-highest level cap in the roster', () => {
    const roster = [at('a', 1), at('b', 1), at('c', 1), at('d', 1), at('e', 1, 0), at('f', 1)];

    expect(resonanceCeiling(roster, CURVE)).toBe(levelCapFor(CURVE, 13));
  });

  it('is dragged down by a capped character among the top five', () => {
    const roster = [at('a', 1), at('b', 1), at('c', 1), at('d', 1), at('e', 1, 0)];

    expect(resonanceCeiling(roster, CURVE)).toBe(levelCapFor(CURVE, 0));
  });

  it('never exceeds the curve’s own ceiling', () => {
    expect(resonanceCeiling(party(PARTY_SIZE, 1), CURVE)).toBe(CURVE.maxLevel);
  });
});

describe('maxAffordableResonance', () => {
  it('spends a full wallet up to the roster’s ceiling', () => {
    expect(maxAffordableResonance(party(PARTY_SIZE, 1), RICH, CURVE)).toBe(CURVE.maxLevel);
  });

  it('stops at the ceiling a capped anchor imposes, however much is in the wallet', () => {
    const roster = [at('a', 1), at('b', 1), at('c', 1), at('d', 1), at('e', 1, 0)];

    expect(maxAffordableResonance(roster, RICH, CURVE)).toBe(levelCapFor(CURVE, 0));
  });

  it('returns the current floor when nothing at all is affordable', () => {
    const roster = party(PARTY_SIZE, 20);

    expect(maxAffordableResonance(roster, emptyWallet(), CURVE)).toBe(20);
  });

  it('lands on a target the plan can actually be paid for, and one step past it cannot', () => {
    // The binary search is only sound because the price is monotonic in the target. This is the
    // assertion that would fail if a cheaper set were ever available at a *higher* target.
    const roster = party(PARTY_SIZE, 5);
    const wallet: Wallet = { ...emptyWallet(), gold: num(4000), xp: num(4000), essence: num(4000) };

    const target = maxAffordableResonance(roster, wallet, CURVE);
    const affordable = resonancePlan(roster, CURVE, target);
    const beyond = resonancePlan(roster, CURVE, target + 1);

    expect(target).toBeGreaterThan(5);
    expect(affordable?.cost.gold?.lte(wallet.gold)).toBe(true);
    expect(beyond?.cost.gold?.gt(wallet.gold)).toBe(true);
  });
});

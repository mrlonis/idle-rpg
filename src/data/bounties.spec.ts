// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import { type BountyData, PARTY_SIZE } from '../core';
import { BOUNTIES } from './bounties';
import { CHARACTERS } from './characters';

/**
 * Conformance through a typed local, because `data/` may not import `core/`.
 *
 * That assignment is what turns a mission with a missing duration or a malformed payout into a
 * compile error rather than a row the board silently cannot run.
 */
const bounties: readonly BountyData[] = BOUNTIES;

const HOUR = 3_600_000;

describe('bounty content', () => {
  it('ships missions with unique ids', () => {
    const ids = bounties.map((bounty) => bounty.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names every mission and says what it is', () => {
    for (const bounty of bounties) {
      expect(bounty.name.length, bounty.id).toBeGreaterThan(0);
      expect(bounty.description.length, bounty.id).toBeGreaterThan(0);
    }
  });

  it('gives every mission a real duration, crew and payout', () => {
    for (const bounty of bounties) {
      expect(bounty.durationMs, bounty.id).toBeGreaterThan(0);
      expect(Number.isInteger(bounty.crew), bounty.id).toBe(true);
      expect(bounty.crew, bounty.id).toBeGreaterThan(0);
      expect(bounty.payoutSeconds, bounty.id).toBeGreaterThan(0);
      expect(bounty.unlockClears, bounty.id).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('bounty pacing', () => {
  it('pays less than it runs for, so dispatching is a decision rather than a button', () => {
    // ⚠️ A mission paying its own duration back would make dispatching strictly free — the
    // characters are idle anyway — and the board would stop being a choice. Paying a fraction is
    // what keeps it one, and it is what will still make it one once towers want those characters.
    for (const bounty of bounties) {
      const ratio = (bounty.payoutSeconds * 1000) / bounty.durationMs;

      expect(ratio, bounty.id).toBeGreaterThan(0.2);
      expect(ratio, bounty.id).toBeLessThan(1);
    }
  });

  it('never asks for more of a bench than the roster can spare', () => {
    // ⚠️ Derived from `PARTY_SIZE` and the shipped roster rather than assumed. A mission wanting
    // more characters than a player could ever have outside their party is one nobody can run —
    // the same "no legal party" failure milestone 4 rejected role-locked formation slots for.
    const spare = CHARACTERS.length - PARTY_SIZE;

    for (const bounty of bounties) {
      expect(bounty.crew, bounty.id).toBeLessThanOrEqual(spare);
    }
  });

  it('asks for more than the whole board at once, so the crews genuinely compete', () => {
    // The board is a bench sink only if running everything at once is a real demand on roster
    // breadth. If every mission could be crewed from the spare characters of a minimal roster,
    // there would be no reason to own anybody else.
    const everyCrew = bounties.reduce((sum, bounty) => sum + bounty.crew, 0);

    expect(everyCrew).toBeGreaterThan(PARTY_SIZE);
  });

  it('opens its first mission early and gates the rest behind real progress', () => {
    const unlocks = bounties.map((bounty) => bounty.unlockClears);

    // Something to do before the board is a screen a player has visited and found empty.
    expect(Math.min(...unlocks)).toBeLessThanOrEqual(10);
    // And something still to reach for.
    expect(Math.max(...unlocks)).toBeGreaterThan(20);
  });

  it('gets longer, wider and more valuable together, in the order authored', () => {
    // The screen lists these in order, so a board whose third row was shorter than its second
    // would read as unsorted rather than as a ladder.
    for (let index = 1; index < bounties.length; index++) {
      const previous = bounties[index - 1];
      const current = bounties[index];

      expect(current.durationMs, current.id).toBeGreaterThan(previous.durationMs);
      expect(current.crew, current.id).toBeGreaterThanOrEqual(previous.crew);
      expect(current.payoutSeconds, current.id).toBeGreaterThan(previous.payoutSeconds);
      expect(current.unlockClears, current.id).toBeGreaterThanOrEqual(previous.unlockClears);
    }
  });

  it('tops out at a day, which is where the second reminder fires', () => {
    // ⚠️ The one place this milestone's two halves touch. A mission longer than the last
    // notification would leave a player with something running and nothing telling them, which is
    // the only shape of reminder this project could justify.
    expect(Math.max(...bounties.map((bounty) => bounty.durationMs))).toBe(24 * HOUR);
  });
});

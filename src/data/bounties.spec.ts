// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import { type BountyBoardRulesData, type BountyData, PARTY_SIZE } from '../core';
import { FACTIONS } from './ascension';
import { BOUNTIES, BOUNTY_BOARD } from './bounties';
import { CHARACTERS } from './characters';
import { QUEST_RULES } from './quests';

/**
 * Conformance through a typed local, because `data/` may not import `core/`.
 *
 * That assignment is what turns a mission with a missing duration or a malformed payout into a
 * compile error rather than a row the board silently cannot run.
 */
const bounties: readonly BountyData[] = BOUNTIES;
const board: BountyBoardRulesData = BOUNTY_BOARD;

const HOUR = 3_600_000;

/** The tiers, in the order they were authored, derived rather than listed. */
const TIERS: readonly string[] = [...new Set(bounties.map((bounty) => bounty.tier))];

/** Every variant of one tier. */
function variantsOf(tier: string): readonly BountyData[] {
  return bounties.filter((bounty) => bounty.tier === tier);
}

/** One representative mission per tier, for the assertions that are about the ladder. */
const LADDER: readonly BountyData[] = TIERS.map((tier) => variantsOf(tier)[0]);

/** How many characters of `faction` the shipped roster holds. */
function rosterDepth(faction: string): number {
  return CHARACTERS.filter((character) => character.faction === faction).length;
}

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
    //
    // Measured over the **ladder** — one mission per tier — because that is what a player can have
    // running at once. Summing the whole pool would count variants that never share a board.
    const everyCrew = LADDER.reduce((sum, bounty) => sum + bounty.crew, 0);

    expect(everyCrew).toBeGreaterThan(PARTY_SIZE);
  });

  it('opens its first mission early and gates the rest behind real progress', () => {
    const unlocks = bounties.map((bounty) => bounty.unlockClears);

    // Something to do before the board is a screen a player has visited and found empty.
    expect(Math.min(...unlocks)).toBeLessThanOrEqual(10);
    // And something still to reach for.
    expect(Math.max(...unlocks)).toBeGreaterThan(20);
  });

  it('gets longer, wider and more valuable together, tier by tier', () => {
    // The screen lists these in order, so a board whose third row was shorter than its second
    // would read as unsorted rather than as a ladder. Measured across **tiers**, since variants of
    // one tier are deliberately identical on all four.
    for (let index = 1; index < LADDER.length; index++) {
      const previous = LADDER[index - 1];
      const current = LADDER[index];

      expect(current.durationMs, current.tier).toBeGreaterThan(previous.durationMs);
      expect(current.crew, current.tier).toBeGreaterThanOrEqual(previous.crew);
      expect(current.payoutSeconds, current.tier).toBeGreaterThan(previous.payoutSeconds);
      expect(current.unlockClears, current.tier).toBeGreaterThanOrEqual(previous.unlockClears);
    }
  });

  it('tops out at a day, which is where the second reminder fires', () => {
    // ⚠️ The one place this milestone's two halves touch. A mission longer than the last
    // notification would leave a player with something running and nothing telling them, which is
    // the only shape of reminder this project could justify.
    expect(Math.max(...bounties.map((bounty) => bounty.durationMs))).toBe(24 * HOUR);
  });
});

describe('the rotating board', () => {
  it('rolls on the same boundary the quest windows do', () => {
    // ⚠️ Derived from `QUEST_RULES` rather than restating 240. Two daily clocks four hours apart
    // would mean two different "tomorrows" in one game, with nothing on either screen explaining
    // why one reset and the other did not.
    expect(board.resetOffsetMinutes).toBe(QUEST_RULES.resetOffsetMinutes);
  });

  it('gives every tier something to rotate between', () => {
    // A tier with one variant is a row that never changes, which is the board not rotating.
    for (const tier of TIERS) {
      expect(variantsOf(tier).length, tier).toBeGreaterThan(1);
    }
  });

  it('keeps every variant of a tier worth exactly the same', () => {
    // ⚠️ Rotation must change *what is asked for*, never *what the day is worth*. A variant that
    // also paid differently would turn the daily draw into a payout lottery — the manufactured
    // scarcity this project rejects everywhere else.
    for (const tier of TIERS) {
      const [first, ...rest] = variantsOf(tier);
      for (const variant of rest) {
        expect(variant.durationMs, variant.id).toBe(first.durationMs);
        expect(variant.crew, variant.id).toBe(first.crew);
        expect(variant.payoutSeconds, variant.id).toBe(first.payoutSeconds);
        expect(variant.unlockClears, variant.id).toBe(first.unlockClears);
      }
    }
  });

  it('leaves every tier one variant that asks for no faction at all', () => {
    // A tier whose every variant named a faction could roll one the player owns none of and leave
    // that whole rung dead for the day. With a plain variant in the pool it is only ever sometimes.
    for (const tier of TIERS) {
      expect(
        variantsOf(tier).filter((variant) => variant.requires === undefined).length,
        tier,
      ).toBeGreaterThan(0);
    }
  });
});

describe('faction requirements', () => {
  const required = bounties.filter((bounty) => bounty.requires !== undefined);

  it('ships some, or the whole mechanic is decorative', () => {
    expect(required.length).toBeGreaterThan(0);
  });

  it('names a faction this build actually ships', () => {
    // `ReadonlySet<string>` rather than the inferred union: `FACTIONS` is `as const`, so the
    // inferred set would only accept the seven literal ids and reject the very lookup this is for.
    const known: ReadonlySet<string> = new Set<string>(FACTIONS.map((faction) => faction.id));

    for (const bounty of required) {
      expect(known.has(bounty.requires?.faction ?? ''), bounty.id).toBe(true);
    }
  });

  it('never names a celestial faction', () => {
    // ⚠️ Angels and Demons ascend on copies of themselves alone — no fodder path, no shop — so a
    // run whose banners are unkind can own none of either indefinitely. A mission requiring one is
    // a row that player cannot run for reasons no amount of play fixes, which is the same failure
    // milestone 4 rejected role-locked formation slots for.
    //
    // Derived from the shipped ladders rather than restating which factions are mortal, so a
    // faction changing ladder re-runs this.
    const celestial: ReadonlySet<string> = new Set<string>(
      FACTIONS.filter((faction) => faction.ascensionPath === 'celestial').map(
        (faction) => faction.id,
      ),
    );

    for (const bounty of required) {
      expect(celestial.has(bounty.requires?.faction ?? ''), bounty.id).toBe(false);
    }
  });

  it('never asks for more of a faction than the mission has seats', () => {
    for (const bounty of required) {
      const count = bounty.requires?.count ?? 0;

      expect(count, bounty.id).toBeGreaterThan(0);
      expect(count, bounty.id).toBeLessThanOrEqual(bounty.crew);
    }
  });

  it('never asks for more of a faction than the roster holds outside a party', () => {
    // ⚠️ Derived from the shipped roster and `PARTY_SIZE`, the same way the crew sizes are. A
    // mission wanting more of a faction than a player could ever field *and* bench is one nobody
    // can run — and unlike a crew that is simply too big, it would fail quietly, only for the
    // players who happened not to own enough of one faction.
    for (const bounty of required) {
      const faction = bounty.requires?.faction ?? '';
      const count = bounty.requires?.count ?? 0;

      expect(rosterDepth(faction), `${bounty.id} wants ${faction}`).toBeGreaterThanOrEqual(count);
    }
  });

  it('spreads across the mortal factions rather than favouring one', () => {
    // A board that only ever asked for Dwarves would be a Dwarf tax rather than a reason to keep a
    // broad roster, which is the whole thing the requirement exists for.
    const named = new Set(required.map((bounty) => bounty.requires?.faction));
    const mortal = FACTIONS.filter((faction) => faction.ascensionPath === 'mortal');

    expect(named.size).toBeGreaterThanOrEqual(Math.ceil(mortal.length / 2));
  });
});

import { describe, expect, it } from 'vitest';
import {
  battleSeed,
  type CharacterData,
  type CombatantData,
  type CombatRules,
  type CombatRulesData,
  type FormationData,
  levelCapFor,
  MAX_BATTLE_TICKS,
  maxSignatureLevel,
  rarityIndex,
  resolveLadder,
  type SignatureAward,
  type SignatureItemData,
  signatureBonus,
  signatureTier,
  simulateBattle,
  type StageData,
  toBattleCombatant,
  toCombatRules,
} from '../core';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { CHARACTERS } from './characters';
import { COMBAT_RULES } from './combat';
import { GEAR_RULES } from './gear';
import { KIT_RULES } from './kits';
import { GROWTH, LEVEL_CURVE } from './levels';
import { SIGNATURE_ITEMS, SIGNATURE_RULES } from './signature';

/**
 * What a signature item is actually worth, measured rather than asserted.
 *
 * ## Why this file has to exist separately from `chapters.balance.ts`
 *
 * ⚠️ **The campaign sweep cannot measure signature items, and it will keep passing as though it
 * could.** Its reference parties are built with `signature: 0` and pass no award to
 * `toBattleCombatant`, so every stage figure in that file is a statement about a party with no
 * signature item — which is correct for what it measures and useless for what this milestone
 * added. A green `chapters.balance.ts` after milestone 16 proves signature items did not *break*
 * the ladder; it says nothing at all about whether they are balanced.
 *
 * This file is the part that says something. It fields the seven ascended-tier characters at the
 * unlock rung and measures the same party with and without maxed items.
 *
 * ## The parties here are not tuning targets
 *
 * A mono-faction five of ascended-tier characters is not what the campaign is tuned for — the
 * roster ships two per faction, so this is one character copied five times, which no player can
 * field. It is a **control**, chosen because the alternative measures two things at once: a
 * mixed party would fold the faction matchup and the lineup bonus into a number meant to isolate
 * one item. What is compared is always the same party against itself.
 *
 * ⚠️ **One thing the control provably cannot measure, found in milestone 20: a delayed payload.**
 * Five copies of one caster all aim at the same target and delete it, so Nazreth's `bomb` never
 * survives its own fuse in this file — it detonates 0 times out of 77 plants here, against roughly
 * a third of plants in the contested fights of a party a player would actually build. His figures
 * below are therefore a **floor**, and any future character whose kit turns on something happening
 * *later* inherits the same blind spot. It does not invalidate the control: what this file asserts
 * is that an item never makes its wearer worse, and a floor is the safe side of that.
 */

const rules: CombatRules = toCombatRules(COMBAT_RULES satisfies CombatRulesData);
const ladder = resolveLadder(CHAPTERS, CHAPTER_CURVE, STAGE_REWARDS, GEAR_RULES);
const items: readonly SignatureItemData[] = SIGNATURE_ITEMS;
const characters: readonly CharacterData[] = CHARACTERS;

/** Trials per measurement. Enough to separate win rates a few points apart. */
const TRIALS = 60;

/** The rung a signature item unlocks at, which is also the rung these parties are fielded at. */
const MYTHIC = rarityIndex(SIGNATURE_RULES.unlockRarity);

/**
 * The level `mythic` caps at.
 *
 * Derived rather than chosen, for the reason the tower sweep derives its party level from
 * `topLevel`: a party fielded above its rung's cap is a party the game will not let anybody build,
 * and every figure measured against one describes nothing.
 */
const LEVEL = levelCapFor(LEVEL_CURVE, MYTHIC);

/** What the whole run has to spend to max one item, for the pacing note below. */
const MAX_LEVEL = maxSignatureLevel(SIGNATURE_RULES);

/** One combatant at the unlock rung, with or without its signature item. */
function at(character: CharacterData, signature: number): CombatantData {
  const item = items.find((entry) => entry.defId === character.id);
  const award: SignatureAward | undefined =
    item === undefined || signature <= 0
      ? undefined
      : {
          bonus: signatureBonus(SIGNATURE_RULES, item, signature),
          tier: signatureTier(SIGNATURE_RULES, item, signature),
        };
  return toBattleCombatant(
    character,
    { defId: character.id, rarity: MYTHIC, level: LEVEL, copies: 0, gear: {}, signature },
    GROWTH,
    KIT_RULES,
    LEVEL,
    undefined,
    award,
  );
}

/** Five of one character, three in front and two behind. */
function five(character: CharacterData, signature: number): FormationData {
  const member = (): CombatantData => at(character, signature);
  return { front: [member(), member(), member()], back: [member(), member()] };
}

/**
 * Win rate, and the longest fight the party **wins**, over `TRIALS` seeded attempts.
 *
 * ⚠️ **`maxTicks` counts victories only, and the scope is load-bearing rather than convenient.**
 * It is the same scope `chapters.balance.ts` gives its headroom assertion, for the same reason
 * [combat](../../docs/combat.md) gives: a fight the party loses has no tuning claim on it, and the
 * timer exists so a stage stays clearable by the party it was tuned for.
 *
 * It was not scoped this way at first and Thraun found the gap immediately. A five of him carries
 * 29 `atk` — five walls do not lose a fight, they fail to finish one — so his losing trials are
 * timeouts by construction, and an unscoped reading reported the wall as breaking the ninety-second
 * guard. A mono-Thraun five is not a party anybody can field, since the roster ships one of him, so
 * that was the control failing rather than the item.
 */
function sweep(party: FormationData, stage: StageData): { win: number; maxTicks: number } {
  let wins = 0;
  let maxTicks = 0;
  for (let attempt = 0; attempt < TRIALS; attempt++) {
    const result = simulateBattle(party, stage, battleSeed(0x51617, stage.id, attempt), rules);
    if (result.outcome === 'victory') {
      wins++;
      maxTicks = Math.max(maxTicks, result.ticks);
    }
  }
  return { win: wins / TRIALS, maxTicks };
}

/**
 * The hardest authored line-up, as it ships.
 *
 * ## ⚠️ The gap this carried for five milestones closed in 21b, and the re-levelling went with it
 *
 * `mythic` caps at level **340**. When this probe was first written the highest shipped stage was
 * the ash chapters' boss at level **85**, so a party at the signature unlock rung was four times the
 * level of the hardest thing in the game and every campaign fight it took was a walkover — the first
 * version of this probe measured a win-rate gain of exactly **zero on all seven characters**, not
 * because signature items do nothing but because both sides of the comparison were already at 100%.
 * The Bound Marches, the Sundered Vault and the Waking Barrows were each expected to close it and
 * none did: 160, then 225, then 305, against 340.
 *
 * **The Sunless Weald closed it at 396**, and The Bleeding Wild is now the hardest stage at **588**.
 * For the first time since milestone 16 the hardest authored stage is *above* the unlock rung's cap
 * and staying there, so this returns the stage as `data/` wrote it and the probe measures a board the
 * game actually ships. The `level: LEVEL` override that stood here is gone.
 *
 * ⚠️ **Removing it changed none of the numbers below, and saying so plainly matters more than the
 * change.** {@link reach} overwrites `level` on every trial it runs, so the field this used to set
 * was dead on arrival — what it bought was a claim about the probe's *method*, not an input to it.
 * The fourteen figures moved anyway, and for a different reason: `contested()` picks the hardest
 * stage and it has changed identity three times more, `c6-s50` → `c8-s50` → `c9-s50` → `c10-s50`,
 * each a different board under a different id seeding a different sequence. Do not read the move as
 * evidence about the items.
 *
 * ⚠️ **A reach figure is only comparable within one cut of the ladder**, which is the same warning
 * milestone 19's re-cut earned and the third time it has now been collected. Re-measure the whole
 * table or none of it. **Expect to re-measure once a chapter for the rest of milestone 21**, since
 * every one of its chapters takes over the top of the ladder.
 */
function contested(): StageData {
  return ladder.reduce((best, stage) => (stage.level > best.level ? stage : best));
}

const ASCENDED = characters.filter((character) => character.tier === 'ascended');

/** Every rung worth measuring: locked, then each of the four tier marks. */
const RUNGS = [0, 1, SIGNATURE_RULES.tierEvery, SIGNATURE_RULES.tierEvery * 2, MAX_LEVEL];

/**
 * The highest enemy level this party clears at least half the time.
 *
 * ## ⚠️ Measured as reach, not as a win rate at one chosen level, and that is the whole method
 *
 * Win rate near a party's damage threshold is a **step function** — [testing](../../docs/testing.md)
 * says so and this file re-derived it the hard way. The first version of this probe measured win
 * rate at one level and reported a gain of exactly zero on all seven characters, twice, for two
 * different reasons: at the party's own level everything is 100% and at twice it everything is 0%.
 * The contested band turned out to be about 20% above the party's level and only about forty
 * levels wide, so any fixed choice of enemy level is either trivially winnable or unwinnable, and
 * a threshold picked to make one measurement work would silently stop measuring on the next
 * retune.
 *
 * Bisecting for the edge instead answers the question that actually matters — **how much further
 * up the curve does this item carry a party** — in a unit that survives retuning, and it is the
 * unit `docs/testing.md` recommends after milestone 8e hit the same wall measuring the faction
 * matrix.
 */
function reach(party: FormationData, base: StageData): number {
  let low = 0;
  let high = LEVEL * 3;
  // Ten halvings over a range of ~1000 levels resolves to about one level, which is far finer
  // than the noise in a 60-trial win rate. It is 10 sweeps per party rather than one, which is
  // why `TRIALS` is modest and why every measurement in this file is memoised.
  for (let step = 0; step < 10; step++) {
    const mid = Math.round((low + high) / 2);
    if (sweep(party, { ...base, level: Math.max(mid, 1) }).win >= 0.5) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * Every character's reach at every rung, and the longest fight seen while measuring it.
 *
 * Memoised because each entry is ten bisection steps of `TRIALS` battles and three `describe`
 * blocks read the same numbers — recomputing would triple the runtime of this file to produce
 * identical answers, which is the cost the balance project exists to bound.
 */
interface Measurement {
  readonly reach: number;
  readonly maxTicks: number;
}

const BASE = contested();

const MEASURED = new Map<string, readonly Measurement[]>(
  ASCENDED.map((character) => [
    character.id,
    RUNGS.map((level) => {
      const party = five(character, level);
      const edge = reach(party, BASE);
      // The clock is checked at the edge itself, which is where a fight is longest: a party that
      // wins comfortably kills quickly, and one that cannot win at all dies quickly.
      const { maxTicks } = sweep(party, { ...BASE, level: Math.max(edge, 1) });
      return { reach: edge, maxTicks };
    }),
  ]),
);

/** The measurement for one character at one rung index into {@link RUNGS}. */
function measured(character: CharacterData, rung: number): Measurement {
  const rows = MEASURED.get(character.id);
  if (rows === undefined) {
    throw new Error(`no measurement for ${character.id}`);
  }
  return rows[rung];
}

describe('what a signature item is worth', () => {
  it.each(ASCENDED.map((character) => [character.name, character] as const))(
    '%s never reaches less far with a maxed item than without one',
    (_name, character) => {
      expect(measured(character, RUNGS.length - 1).reach).toBeGreaterThanOrEqual(
        measured(character, 0).reach,
      );
    },
  );

  it('carries every one of them further up the curve', () => {
    // What this measured at the shipped numbers, with the party at level 340 — reach with a maxed
    // item, then the gain it buys over the same party with none:
    //
    //   Aurelia   453 (+30)  Corvane 456 (+32)  Thraun    430 (+14)  Vurn    437 (+19)
    //   Aelrindel 457 (+21)  Maelis  445 (+18)  Nekros    460 (+25)  Carrow  472 (+35)
    //   Vharok    471 (+36)  Vrakk   471 (+36)  Seraphine 454 (+14)  Cassiel 465 (+31)
    //   Azrathoth 470 (+22)  Nazreth 461 (+26)
    //
    // ⚠️ **These have now moved four times without a single item or stat block changing, and every
    // time for the same reason.** `contested()` picks the hardest stage and seeds off its `stage.id`,
    // so every trial in this file draws a different sequence when the hardest stage changes identity:
    // milestone 19's re-cut renamed it `c4-s50` → `c6-s50`, 21b's chapter 8 replaced it with
    // `c8-s50`, 21c's chapter 9 with `c9-s50`, and 21d's chapter 10 with `c10-s50`. Nothing was wrong
    // before and nothing is wrong now, but **these numbers are only comparable within one cut of the
    // ladder**: re-measure the whole table or none of it.
    //
    // ⚠️ **21c's rule of thumb for what moves did not survive its own next chapter, and the correction
    // is worth more than the rule was.** That cut saw bare reach rise fifteen to thirty levels with
    // the gains almost still; this one saw bare reach rise **nought to seven** while five of the
    // fourteen gains moved by five — including Seraphine's, which had been +9 for three cuts running
    // and is +14 here. So neither column is stable across a change of base: what is true is only that
    // the **gains move less** (all fourteen within five, eight within three) while a reach figure is
    // meaningless outside its own cut. Read the gain column, and re-measure rather than predicting.
    //
    // ⚠️ **A +3% to +8% gain in reach reads modest and is not, and the difference is the step
    // function.** Measured instead as win rate at a *fixed* contested level, the same items take
    // Aurelia, Aelrindel, Nekros and Vharok from 0.00 to 1.00 — an item worth a few percent of
    // reach is worth the whole fight at the margin, because that is where every fight the player
    // has not already won sits. Quote whichever figure the question calls for, and do not treat
    // the reach number as evidence the item is small.
    //
    // The floor is 5% of the party's level rather than the 10% the largest gain would allow: the
    // claim is that a maxed item is a **material** step, not that Vharok's is exactly 35 levels.
    const gains = ASCENDED.map(
      (character) => measured(character, RUNGS.length - 1).reach - measured(character, 0).reach,
    );

    for (const [index, gain] of gains.entries()) {
      expect(gain, ASCENDED[index].name).toBeGreaterThan(0);
    }
    expect(Math.max(...gains)).toBeGreaterThan(LEVEL * 0.05);
  });

  it('never runs the ninety-second clock out, at any rung', () => {
    // ⚠️ The termination guard, and the reason no signature passive is a regeneration. Closing
    // pressure amplifies damage without bound and deliberately does not amplify healing, so an
    // item that made a party unkillable would produce a **timeout** — and a timeout is a defeat.
    // This is what would catch a sustain passive shipped by mistake, and it is checked at each
    // party's own edge, which is the hardest fight it wins.
    for (const character of ASCENDED) {
      for (let rung = 0; rung < RUNGS.length; rung++) {
        expect(
          measured(character, rung).maxTicks,
          `${character.name} at signature level ${RUNGS[rung]}`,
        ).toBeLessThan(MAX_BATTLE_TICKS);
      }
    }
  });
});

describe('the ability rungs', () => {
  it('never makes a character reach less far as the item is levelled', () => {
    // ⚠️ The failure a *replacing* tier makes possible and an accumulating one could not: a rung
    // restates every clause the rungs below it added, so forgetting one silently takes an upgrade
    // away at the moment the player pays for it. Nothing else in the suite would notice — the
    // sheet would still read "Tier III" and the stats would still climb.
    for (const character of ASCENDED) {
      for (let rung = 1; rung < RUNGS.length; rung++) {
        expect(
          measured(character, rung).reach,
          `${character.name}: level ${RUNGS[rung]} reaches less far than level ${RUNGS[rung - 1]}`,
        ).toBeGreaterThanOrEqual(measured(character, rung - 1).reach);
      }
    }
  });
});

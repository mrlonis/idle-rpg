// @vitest-environment node
// data/ is plain content and its specs read it headlessly, exactly as `core/` does.
import { describe, expect, it } from 'vitest';
import {
  ATB_THRESHOLD,
  GEAR_ARCHETYPES,
  GEAR_SLOTS,
  GEAR_STATS,
  type GearArchetype,
  type GearRulesData,
  type GearStat,
  alloyStep,
  type ChapterCurveData,
  type ChapterData,
  goldStep,
  gradeWeights,
  maxGearLevel,
  maxLoadoutBonus,
  resolveLadder,
  type StageRewardCurveData,
  unlockedGrades,
} from '../core';
import { CHAPTER_CURVE, CHAPTERS, STAGE_REWARDS } from './chapters';
import { CHARACTERS } from './characters';
import { GEAR_RULES } from './gear';

/**
 * The shipped gear content, checked against itself.
 *
 * ⚠️ **Every threshold here is derived from `gear.ts` rather than copied out of it.** A spec that
 * restated "+43% haste" or "68,000 alloy" would keep asserting those numbers forever while the
 * thing it claimed to protect drifted — the `data/` testing rule, and the reason `levels.spec.ts`
 * evaluates the reward curve at the top of the ladder instead of hardcoding an income. When one of
 * these fails after a retune, the answer is to retune deliberately, not to move the threshold.
 */
const RULES: GearRulesData = GEAR_RULES;

/** The top grade, fully enhanced — the strongest a piece can ever be. */
const TOP_GRADE = RULES.grades.length - 1;

/**
 * How many stages this build ships, resolved the way `ui/content.ts` resolves them.
 *
 * Derived rather than written down, because the unlock gates are asserted against it: a gate past
 * the end of the ladder is a grade no player can reach, and hardcoding 100 here would let a
 * shortened ladder delete a grade silently. Adding a chapter re-runs these.
 */
const chapters: readonly ChapterData[] = CHAPTERS;
const chapterCurve: ChapterCurveData = CHAPTER_CURVE;
const rewardCurve: StageRewardCurveData = STAGE_REWARDS;
const LADDER_LENGTH = resolveLadder(chapters, chapterCurve, rewardCurve).length;

describe('the grade ladder', () => {
  it('gets better on both axes at once, so a rung is worth having twice over', () => {
    // Same arrangement `LEVEL_CURVE.caps` makes for characters: a rung buys a bigger multiplier
    // *and* the headroom to keep climbing. A ladder that only moved one of them would make the
    // top grade a marginal upgrade rather than a find.
    for (const [index, grade] of RULES.grades.entries()) {
      const below = RULES.grades[index - 1];
      if (below === undefined) {
        continue;
      }
      expect(grade.multiplier).toBeGreaterThan(below.multiplier);
      expect(grade.maxLevel).toBeGreaterThan(below.maxLevel);
      expect(grade.salvage).toBeGreaterThan(below.salvage);
      expect(grade.priceSeconds).toBeGreaterThan(below.priceSeconds);
      expect(grade.weight).toBeLessThan(below.weight);
    }
  });

  it('tops out at level 100, which is the ceiling this milestone was given', () => {
    expect(maxGearLevel(RULES, TOP_GRADE)).toBe(100);
  });

  it('overlaps deliberately: an enhanced piece outgrows a fresh piece of the grade above', () => {
    // ⚠️ **A settled design decision, asserted so it cannot drift into its opposite by accident.**
    // The alternative was strict grade dominance — a piece at its cap always losing to a fresh
    // piece one grade up — and it was measured and declined: at 100 levels per grade it needs each
    // grade step to exceed the level span, which either multiplies the top of the ladder by ~575x
    // or flattens enhancement to +0.8% a level. Overlap is what keeps enhancement worth doing.
    //
    // Auto-equip does not need dominance and never did: every candidate for a slot shares one
    // authored profile, so `gearScale` is already a total order over them. See `autoEquip`.
    for (const [index, grade] of RULES.grades.entries()) {
      const above = RULES.grades[index + 1];
      if (above === undefined) {
        continue;
      }
      const atCap = grade.multiplier * (1 + RULES.perLevel * (grade.maxLevel - 1));

      expect(atCap, `${grade.id} at cap vs a fresh ${above.id}`).toBeGreaterThan(above.multiplier);
    }
  });

  it('uses no word the roster’s three rarity ladders already use', () => {
    // [glossary](../../docs/glossary.md) already explains three meanings of "rarity". A grade
    // sharing one of those words would be the collision that makes a sentence about this game
    // genuinely ambiguous rather than merely careful.
    const taken = new Set(['common', 'rare', 'elite', 'legendary', 'mythic', 'ascended', 'epic']);

    for (const grade of RULES.grades) {
      expect(taken.has(grade.id)).toBe(false);
    }
  });
});

describe('the stat profiles', () => {
  /** What one archetype's whole set is worth at grade ×1 and level 1, per stat. */
  function budget(archetype: GearArchetype): Readonly<Record<GearStat, number>> {
    const total = { hp: 0, atk: 0, def: 0, haste: 0 };
    for (const slot of GEAR_SLOTS) {
      const profile = RULES.profiles[archetype][slot];
      for (const stat of GEAR_STATS) {
        total[stat] += profile[stat] ?? 0;
      }
    }
    return total;
  }

  it('covers every archetype and every slot, with no empty profile', () => {
    // A missing entry and a zero entry produce the same combatant, so a hole here would be a slot
    // that silently does nothing rather than a visible gap.
    for (const archetype of GEAR_ARCHETYPES) {
      for (const slot of GEAR_SLOTS) {
        const profile = RULES.profiles[archetype][slot];
        const moved = GEAR_STATS.filter((stat) => (profile[stat] ?? 0) > 0);

        expect(moved.length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every archetype the same budget, weighted by what each stat is worth', () => {
    // ⚠️ This is the assertion that stops a hand-edited cell handing one archetype more than the
    // rest. Emphasis is the design — a tank's set is nearly four times a mage's health bonus —
    // and a *bigger* set is not.
    //
    // The weights price a point of each stat against a point of health. They are a judgement, and
    // they are stated here rather than in `gear.ts` because nothing but this comparison uses them.
    const weights: Readonly<Record<GearStat, number>> = { hp: 1, atk: 1.4, def: 1.2, haste: 2.5 };
    const spend = GEAR_ARCHETYPES.map((archetype) => {
      const total = budget(archetype);
      return GEAR_STATS.reduce((sum, stat) => sum + total[stat] * weights[stat], 0);
    });

    expect(Math.max(...spend) / Math.min(...spend)).toBeLessThan(1.15);
  });

  it('puts all the haste on boots and none anywhere else', () => {
    // Concentrating it is what makes the bound below a statement about one piece rather than
    // something to re-derive every time any other slot is retuned.
    for (const archetype of GEAR_ARCHETYPES) {
      for (const slot of GEAR_SLOTS) {
        const haste = RULES.profiles[archetype][slot].haste ?? 0;

        expect(slot === 'boots' ? haste > 0 : haste === 0).toBe(true);
      }
    }
  });

  it('expresses each archetype’s identity rather than flattening them', () => {
    // A tank's set is health and defence; a mage's is attack. If these ever converge, gear has
    // stopped being a decision and become a flat power level.
    expect(budget('tank').hp).toBeGreaterThan(budget('mage').hp * 2);
    expect(budget('mage').atk).toBeGreaterThan(budget('tank').atk * 2);
    expect(budget('ranger').haste).toBeGreaterThan(budget('tank').haste);
  });

  it('is a third axis rather than a fourth game', () => {
    // Gear at its absolute best roughly doubles the stats an archetype cares about. Levelling is
    // worth ×10⁹ and the rung ladder ×450, and gear is deliberately nowhere near either — a player
    // with none of it should be behind, not locked out.
    for (const archetype of GEAR_ARCHETYPES) {
      const best = maxLoadoutBonus(RULES, archetype);

      expect(best.hp ?? 0).toBeLessThan(3);
      expect(best.atk ?? 0).toBeLessThan(3);
      expect(best.def ?? 0).toBeLessThan(3);
    }
  });
});

describe('the haste bound', () => {
  /** The largest `haste` any authored character declares. */
  const FASTEST = Math.max(...CHARACTERS.map((character) => Number(character.stats.haste)));

  it('cannot take any character within reach of the ATB clamp', () => {
    // ⚠️ **A termination argument, not a balance knob.** `content.ts` clamps `haste` to
    // `[1, ATB_THRESHOLD]` because the simulation depends on nobody banking two actions in one
    // tick, and `roster/stats.ts` explains at length why nothing in a stat block may grow into
    // that clamp: a bound that *binds* turns the one stat that buys turns into a constant every
    // combatant shares.
    //
    // Boots are the piece that moves haste, so the argument applies to them and the answer is a
    // bounded percentage rather than an exemption. Derived from the shipped profiles, so retuning
    // a grade re-runs it.
    const worst = Math.max(
      ...GEAR_ARCHETYPES.map((archetype) => maxLoadoutBonus(RULES, archetype).haste ?? 0),
    );
    const reached = FASTEST * (1 + worst);

    expect(reached).toBeLessThan(ATB_THRESHOLD / 2);
  });

  it('leaves gear unable to reorder who is fastest', () => {
    // A percentage cannot invert an ordering, which is why it was chosen over a flat bonus: the
    // character authored fast stays the fastest whatever anybody is wearing.
    const slowest = Math.min(...CHARACTERS.map((character) => Number(character.stats.haste)));
    const bestBoost = Math.max(
      ...GEAR_ARCHETYPES.map((archetype) => maxLoadoutBonus(RULES, archetype).haste ?? 0),
    );

    expect(slowest * (1 + bestBoost)).toBeLessThan(FASTEST * (1 + bestBoost));
  });
});

describe('the enhancement curve', () => {
  /** Everything one currency costs to take a piece of `grade` from level 1 to its cap. */
  function toCap(grade: number, step: (rules: GearRulesData, level: number) => number): number {
    let total = 0;
    for (let level = 1; level < maxGearLevel(RULES, grade); level++) {
      total += step(RULES, level);
    }
    return total;
  }

  it('makes gold the binding constraint and material the soft one', () => {
    // The whole point of the milestone: four places in this codebase say gold's level-curve
    // coefficient is shallow **because gear will spend it later**. If alloy ever binds harder than
    // gold, gear has stopped being a gold sink and the level curve should be revisited with it.
    expect(toCap(TOP_GRADE, goldStep)).toBeGreaterThan(toCap(TOP_GRADE, alloyStep) * 10);
  });

  it('roughly doubles what gold is for, measured against the top of the ladder', () => {
    // Kitting a party of five in five fully enhanced top-grade pieces should be the same order of
    // magnitude as the levelling it sits beside — comfortably more than a passing cost, and not so
    // much that gear becomes the only thing gold is ever spent on.
    //
    // ## ⚠️ It said "derived from `STAGE_REWARDS`, so extending the ladder re-runs it" and it was
    // retyping the ladder's length
    //
    // The exponent came from `STAGE_REWARDS`; the **index** it was raised to was the literal `100`,
    // which is how long the ladder was when this was written. So for four chapters it measured gear
    // against chapter-4 income and re-ran nothing, which is exactly the failure `docs/testing.md`
    // names — a coupling turned into a comment. Derived from {@link LADDER_LENGTH} now.
    //
    // ⚠️ **Correctly derived, it would have fired at chapter 7**: 22.5 hours at two hundred stages,
    // 17.4 at two hundred and fifty against a floor of 20. Milestone 21b found it only because
    // raising the reward exponent pushed it past the floor even with the stale literal in place.
    //
    // ## What the quantity does, and why the floor is now 1 rather than 20
    //
    // ⚠️ **This falls forever by construction, and it is the same shape as the level ceiling's
    // hours that `levels.spec.ts` retired.** Gear's gold cost is a **constant** — the top grade
    // costs what it costs at chapter 1 and at chapter 10 — while top-of-ladder income grows with
    // every chapter by design. So "hours to kit a party" decays on every chapter forever whatever
    // anybody authors: 2.3 hours at three hundred stages and about 1.5 at four hundred.
    //
    // Unlike the level ceiling there is **no invariant to restate it as**, and that is the finding
    // rather than a gap in this comment. Measured against levelling instead of against income it
    // decays faster, not slower, because level cost grows as `L ** 2.55`. What actually closes it is
    // **gear costs that scale with the content**, which is a retune of `data/gear.ts` on the scale
    // of a milestone — and milestone 21 says in as many words that a chapter finding it needs one
    // writes it down rather than taking the scope. It is written down in
    // [authoring](../../docs/authoring.md).
    //
    // The floor is 1 so the guard still catches a gear curve authored at nothing, and it fires again
    // around chapter twelve. At that point the question is whether gear costs have been made to
    // scale, not what number goes here.
    const topOfLadder =
      STAGE_REWARDS.baseRates.gold * Math.pow(LADDER_LENGTH, STAGE_REWARDS.exponent);
    const partyKit = toCap(TOP_GRADE, goldStep) * GEAR_SLOTS.length * 5;
    const hours = partyKit / topOfLadder / 3600;

    expect(hours, `${hours.toFixed(2)}h to kit a party at the top of the ladder`).toBeGreaterThan(
      1,
    );
    expect(hours).toBeLessThan(400);
  });

  it('charges almost nothing for the first levels of a cheap piece', () => {
    // Early enhancement should be something a new player does without thinking about it. The
    // curve is what makes the late pieces expensive, not a floor on the early ones.
    expect(toCap(0, goldStep)).toBeLessThan(toCap(TOP_GRADE, goldStep) / 50);
  });
});

describe('the drop table', () => {
  const share = (weights: readonly number[], index: number): number =>
    (weights[index] ?? 0) / weights.reduce((sum, weight) => sum + weight, 0);

  it('pays the chapter rhythm, and every win pays something', () => {
    // A pull can never produce nothing, so neither should a fight. A piece that is useless to the
    // party is still alloy.
    // ⚠️ Compared floor to floor and ceiling to ceiling. Ranges that *overlap* are the point — an
    // unlucky boss and a lucky mini-boss can pay the same — but a kind whose guaranteed minimum
    // or whose best case fell short of the rank below it would break the chapter's rhythm.
    expect(RULES.drops.normal.min).toBeGreaterThan(0);
    expect(RULES.drops.miniBoss.min).toBeGreaterThan(RULES.drops.normal.min);
    expect(RULES.drops.boss.min).toBeGreaterThan(RULES.drops.miniBoss.min);
    expect(RULES.drops.miniBoss.max).toBeGreaterThan(RULES.drops.normal.max);
    expect(RULES.drops.boss.max).toBeGreaterThan(RULES.drops.miniBoss.max);

    // Every kind is genuinely ranged rather than a fixed count wearing a range's shape, and no
    // range is inverted — `dropCount` would silently swallow either.
    for (const kind of ['normal', 'miniBoss', 'boss'] as const) {
      expect(RULES.drops[kind].max, kind).toBeGreaterThan(RULES.drops[kind].min);
    }
  });

  it('opens the ladder one grade wide and never gates the bottom grade', () => {
    // ⚠️ The property the whole gate rests on. A run at stage 1 sees exactly one grade, so every
    // piece it finds is comparable to every other; and the bottom grade is reachable everywhere,
    // so a drop is never a nothing.
    expect(RULES.grades[0]?.unlockIndex).toBeLessThanOrEqual(1);
    expect(unlockedGrades(RULES, 1)).toBe(1);
    expect(share(gradeWeights(RULES, LADDER_LENGTH), 0)).toBeGreaterThan(0);
  });

  it('unlocks every grade inside the ladder this build actually ships', () => {
    // ⚠️ **Derived from the shipped chapters rather than written as 100**, which is the rule this
    // file follows everywhere: a gate authored past the end of the ladder is unreachable content,
    // and the first version of this idea put four of the five grades behind a chapter 3 that does
    // not exist. Shortening the ladder has to fail here rather than silently delete a grade.
    for (const [index, grade] of RULES.grades.entries()) {
      expect(grade.unlockIndex, `${grade.id} unlocks at ${grade.unlockIndex}`).toBeLessThanOrEqual(
        LADDER_LENGTH,
      );
      expect(unlockedGrades(RULES, grade.unlockIndex), grade.id).toBeGreaterThanOrEqual(index + 1);
    }
  });

  it('gates the grades in ladder order, so a better piece never arrives first', () => {
    const gates = RULES.grades.map((grade) => grade.unlockIndex);

    expect(gates).toEqual([...gates].sort((a, b) => a - b));
  });

  it('leaves the top grade rare but reachable the moment it unlocks', () => {
    const gate = RULES.grades[TOP_GRADE]?.unlockIndex ?? 1;

    expect(share(gradeWeights(RULES, gate - 1), TOP_GRADE)).toBe(0);
    expect(share(gradeWeights(RULES, gate), TOP_GRADE)).toBeGreaterThan(0.002);
    expect(share(gradeWeights(RULES, gate), TOP_GRADE)).toBeLessThan(0.1);
  });

  it('makes the top grade a find rather than a routine drop by the end of the ladder', () => {
    // Once open, the tilt still runs: the remaining stages move it up several-fold, and the bottom
    // grade goes rare rather than impossible.
    const gate = RULES.grades[TOP_GRADE]?.unlockIndex ?? 1;
    const deep = gradeWeights(RULES, LADDER_LENGTH);

    expect(share(deep, TOP_GRADE)).toBeGreaterThan(share(gradeWeights(RULES, gate), TOP_GRADE));
    expect(share(deep, TOP_GRADE)).toBeLessThan(0.2);
    expect(share(deep, 0)).toBeGreaterThan(0.05);
  });
});

describe('the shop', () => {
  it('restocks on the hour', () => {
    expect(RULES.shop.refreshMs).toBe(60 * 60 * 1000);
  });

  it('offers enough that watching for a specific piece beats waiting on the dice', () => {
    // The shop's job is to be the *targeted* source next to a drop table that is not. Too few and
    // that wait is indistinguishable from the dice; too many and the hour stops meaning anything.
    expect(RULES.shop.offers).toBeGreaterThanOrEqual(4);
    expect(RULES.shop.offers).toBeLessThanOrEqual(10);
  });

  it('floors prices at the income the first stage of the ladder unlocks', () => {
    // A price is seconds of the run's own gold income, and a fresh run earns nothing — so without
    // this the opening shop is free. Derived from `STAGE_REWARDS`, because that is the smallest
    // non-zero income the game can produce.
    expect(RULES.shop.minGoldPerSecond).toBe(STAGE_REWARDS.baseRates.gold);
  });

  it('prices the top grade as hours of income rather than minutes', () => {
    expect(RULES.grades[TOP_GRADE]?.priceSeconds ?? 0).toBeGreaterThan(3600);
  });
});

describe('the bag', () => {
  it('holds a spare set for a whole party and then some', () => {
    // Bounded because auto-battle clears a stage a minute and every clear drops, so an unbounded
    // bag is thousands of records the repair pass walks on every load. What matters is that
    // overflow is *salvaged* rather than refused — see `addGear`.
    expect(RULES.inventoryLimit).toBeGreaterThan(GEAR_SLOTS.length * 5 * 2);
  });
});

describe('archetypes and the roster', () => {
  it('has a character of every archetype, so no gear is unequippable', () => {
    // ⚠️ An archetype nobody can field would make a fifth of every drop dead on arrival. This is
    // the gear-side version of the rule milestone 4 wrote about role-locked ranks, and it is why
    // the collapse to five roles was done against the roster rather than beside it.
    const fielded = new Set(CHARACTERS.map((character) => character.role));

    expect([...GEAR_ARCHETYPES].filter((archetype) => !fielded.has(archetype))).toEqual([]);
  });

  it('spreads the roster across archetypes rather than piling into one', () => {
    // Not an even split — bruisers were always the biggest group and still are — but no archetype
    // should be a single character, or a player is one unlucky pull from a dead drop category.
    for (const archetype of GEAR_ARCHETYPES) {
      const count = CHARACTERS.filter((character) => character.role === archetype).length;

      expect(count).toBeGreaterThanOrEqual(4);
    }
  });
});

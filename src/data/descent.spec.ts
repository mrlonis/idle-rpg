// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  type ActivityData,
  type AchievementTrackData,
  type DescentEncounterData,
  type DescentFamilyData,
  type DescentRulesData,
  DESCENT_STATS,
  descentBonus,
  descentCards,
  descentChoices,
  descentFights,
  type EnemyData,
  type QuestData,
} from '../core';
import { ACHIEVEMENTS } from './achievements';
import { ACTIVITIES } from './activities';
import { FACTIONS } from './ascension';
import { DESCENT_BOARDS, DESCENT_FAMILIES, DESCENT_RULES } from './descent';
import { QUESTS } from './quests';

/**
 * Conformance through typed locals, because `data/` may not import `core/`.
 *
 * This is what turns a family with a short rung list, a board naming an enemy nothing ships, or a
 * rung naming a stat nothing reads into a compile error rather than a card that is offered and pays
 * nothing.
 */
const rules: DescentRulesData = DESCENT_RULES;
const families: readonly DescentFamilyData[] = DESCENT_FAMILIES;
const boards: readonly DescentEncounterData[] = DESCENT_BOARDS;
const activities: readonly ActivityData[] = ACTIVITIES;
const tracks: readonly AchievementTrackData[] = ACHIEVEMENTS;
const quests: readonly QuestData[] = QUESTS;

const FIGHTS = descentFights(rules);
const CHOICES = descentChoices(rules);
const FACTION_IDS = FACTIONS.map((faction) => faction.id);

/** Every body on a board, both ranks. */
const bodies = (board: DescentEncounterData): readonly EnemyData[] => [
  ...board.enemies.front,
  ...board.enemies.back,
];

/**
 * The enemy archetypes that draw every single-target attack onto themselves, and the ones that heal.
 *
 * Named by id rather than derived, because the skill tables live in `skills.ts` and a spec in
 * `data/` cannot resolve a skill's status list without importing `core/`'s parser. ⚠️ **A list is a
 * maintenance cost and it is worth it here**: what it guards is the failure milestone 15c found on
 * the Dwarf Tower roof — sustain the party cannot aim at is the ninety-second clock wearing a boss's
 * stat block — and here that failure costs one of a run's two lives.
 *
 * Adding a taunting or healing archetype without adding it here does not make this test wrong; it
 * makes it silent. The rule it protects is stated in `descent-boards.ts`.
 */
const TAUNTERS = new Set([
  'free-blade',
  'barrow-sovereign',
  'oathshield-vanguard',
  'riven-marchwarden',
  'sealward-custodian',
  'cairnward-husk',
  'cairnbound-sentinel',
  'grudgeplate-smith',
  'oathstone-bastion',
  'bloodgorge-hound',
  'scarbound-bellower',
  'ironsling-wright',
  'edgeturn-warden',
  'sunfade-chanter',
  'crownbark-bastion',
]);

const HEALERS = new Set([
  'acolyte',
  'stormcaller',
  'hierophant',
  'tyrant',
  'unmade',
  'thornweald-warden',
  'chainsworn',
  'the-redmaw',
  'the-everwound',
  'the-deathless-marshal',
  'litany-bearer',
]);

describe('the rules', () => {
  it('is three floors of three, with one card fewer than fights', () => {
    expect(FIGHTS).toBe(9);
    expect(CHOICES).toBe(FIGHTS - 1);
  });

  it('gives a run more than one attempt and fewer than one per fight', () => {
    // ⚠️ Per run rather than per fight. A retry per fight makes the mode a matter of persistence;
    // one across nine makes *when to spend it* part of the run.
    expect(rules.lives).toBeGreaterThan(1);
    expect(rules.lives).toBeLessThan(FIGHTS);
  });

  it('locks fewer factions than exist and enough to field a five', () => {
    // ⚠️ **The line milestone 4 drew.** Content may be hard to bring a good answer to and may never
    // reach a state where no answer exists — three of seven is twenty-four characters on a full
    // roster, which is comfortably more than the five a crew holds.
    expect(rules.lockFactions).toBeGreaterThan(0);
    expect(rules.lockFactions).toBeLessThan(FACTION_IDS.length);
  });

  it('opens the run below the anchor and closes it near or above', () => {
    // The difficulty dial, and both halves matter. Opening below is what makes floor 1 a warm-up;
    // closing at or above the hardest stage a run has beaten is what makes fight nine a fight
    // against a party that is by then several bodies down.
    expect(rules.level.baseOffset).toBeLessThan(0);
    expect(rules.level.topOffset).toBeGreaterThan(rules.level.baseOffset);
  });
});

describe('the card families', () => {
  it('gives every family exactly as many rungs as the ladder has ranks', () => {
    // ⚠️ A short list is a rank that can be offered and never resolved.
    for (const family of families) {
      expect(family.rungs.length, family.id).toBe(rules.ranks.length);
    }
  });

  it('makes every rung strictly larger than the one below it', () => {
    // ⚠️ **The rule the whole repeat mechanic rests on.** A family already taken comes back only
    // higher, so a rung that is not larger is a downgrade the player pays a choice for — and it
    // reads as a reward on screen either way.
    for (const family of families) {
      for (let rank = 1; rank < family.rungs.length; rank++) {
        const below = family.rungs[rank - 1];
        const above = family.rungs[rank];

        expect(Object.keys(above).sort(), `${family.id}:${rank} stats`).toEqual(
          Object.keys(below).sort(),
        );
        for (const stat of DESCENT_STATS) {
          const under = below[stat];
          if (under !== undefined) {
            expect(above[stat] ?? 0, `${family.id}:${rank} ${stat}`).toBeGreaterThan(under);
          }
        }
      }
    }
  });

  it('names every family and says what it does', () => {
    const ids = families.map((family) => family.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const family of families) {
      expect(family.name.length, family.id).toBeGreaterThan(0);
      expect(family.description.length, family.id).toBeGreaterThan(0);
      expect(family.rungs.length, family.id).toBeGreaterThan(0);
    }
  });

  it('moves only stats the simulation reads', () => {
    for (const family of families) {
      for (const rung of family.rungs) {
        for (const stat of Object.keys(rung)) {
          expect(DESCENT_STATS as readonly string[], `${family.id} ${stat}`).toContain(stat);
        }
      }
    }
  });

  it('ships one faction family per shipped faction, and no orphans', () => {
    // ⚠️ **Derived from `FACTIONS`, never listed.** A faction with no family is a daily lock that
    // can hand a player three factions and a card pool that ignores one of them — the same silent
    // gap `signature.spec.ts` closes for a new ascended-tier character.
    const byFaction = families
      .filter((family) => family.faction !== undefined)
      .map((family) => family.faction);

    expect([...byFaction].sort()).toEqual([...FACTION_IDS].sort());
  });

  it('pays every faction family the same, whichever faction it names', () => {
    // A faction family is optional content gated behind a draw nobody chose; paying more for one
    // faction than another would let the banner's luck decide which of them is worth taking, and
    // the banner's luck already decides plenty. The same call `towers.spec.ts` holds for the tower
    // tracks.
    const factional = families.filter((family) => family.faction !== undefined);
    const shape = JSON.stringify(factional[0]?.rungs);

    for (const family of factional) {
      expect(JSON.stringify(family.rungs), family.id).toBe(shape);
    }
  });

  it('makes a faction family worth more per rung than a universal one', () => {
    // It pays three of five at most, so it has to be worth interrupting a broad line for. Derived
    // from the two pools rather than restated, so retuning either re-checks this.
    const total = (family: DescentFamilyData): number =>
      DESCENT_STATS.reduce((sum, stat) => sum + (family.rungs[0][stat] ?? 0), 0);
    const universal = families.filter((family) => family.faction === undefined);
    const factional = families.filter((family) => family.faction !== undefined);
    const mean = (list: readonly DescentFamilyData[]): number =>
      list.reduce((sum, family) => sum + total(family), 0) / Math.max(list.length, 1);

    expect(mean(factional)).toBeGreaterThan(mean(universal));
  });

  it('keeps the whole authorable life steal stack under the clamp', () => {
    // ⚠️ **The clamp is a backstop against a rung nobody has authored yet, not a silent cut on a
    // shipped one.** If this ever fails, a family's leech has grown past the point where the clamp
    // starts quietly deleting what a card promised — and `descentBonus` would go on reporting the
    // ceiling while the screen showed the sum.
    const everything = families.flatMap((family) =>
      family.rungs.map((_, rank) => `${family.id}:${rank}`),
    );
    const held = descentCards(families, rules, everything);
    let leech = 0;
    for (const card of held) {
      leech += card.family.rungs[card.rank].lifeLeech ?? 0;
    }

    expect(leech).toBeLessThanOrEqual(rules.maxLifeLeech);
    expect(descentBonus(rules, held, 'human').lifeLeech ?? 0).toBe(leech);
  });
});

describe('the board pool', () => {
  it('is deep enough that every floor can draw without replacement', () => {
    for (let floor = 1; floor <= rules.floors; floor++) {
      const ordinary = boards.filter((board) => board.floor === floor && !board.guardian);
      const guardians = boards.filter((board) => board.floor === floor && board.guardian);

      // Strictly more than the slots, so a floor is a different pair of fights day to day rather
      // than the same two with the guardian rotating.
      expect(ordinary.length, `floor ${floor} ordinary`).toBeGreaterThan(rules.fightsPerFloor - 1);
      expect(guardians.length, `floor ${floor} guardians`).toBeGreaterThan(1);
    }
  });

  it('authors a board for every floor and nothing beyond them', () => {
    for (const board of boards) {
      expect(board.floor, board.id).toBeGreaterThanOrEqual(1);
      expect(board.floor, board.id).toBeLessThanOrEqual(rules.floors);
    }
  });

  it('gives every board a unique id and a name', () => {
    const ids = boards.map((board) => board.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const board of boards) {
      expect(board.name.length, board.id).toBeGreaterThan(0);
    }
  });

  it('fills both ranks within the party size', () => {
    for (const board of boards) {
      expect(board.enemies.front.length, `${board.id} front`).toBeGreaterThan(0);
      expect(board.enemies.front.length, `${board.id} front`).toBeLessThanOrEqual(2);
      expect(board.enemies.back.length, `${board.id} back`).toBeLessThanOrEqual(3);
      expect(bodies(board).length, board.id).toBeGreaterThanOrEqual(4);
    }
  });

  it('mixes at least three factions on every board', () => {
    // ⚠️ **The rule that makes this pool different from a tower's.** The crew's factions are drawn
    // and the board's are not, so a mono-faction board would make a seventh of days a walkover and a
    // seventh a wall, decided by a matchup nobody chose.
    for (const board of boards) {
      const factions = new Set(bodies(board).map((enemy) => enemy.faction));

      expect(factions.size, board.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('spreads the pool across every faction without leaning on one', () => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const board of boards) {
      for (const enemy of bodies(board)) {
        counts.set(enemy.faction, (counts.get(enemy.faction) ?? 0) + 1);
        total++;
      }
    }

    for (const faction of FACTION_IDS) {
      const share = (counts.get(faction) ?? 0) / total;

      expect(share, faction).toBeGreaterThan(0.05);
      expect(share, faction).toBeLessThan(0.25);
    }
  });

  it('never pairs a taunt with a healer', () => {
    // ⚠️ Sustain the party cannot aim at is the ninety-second clock wearing a boss's stat block.
    // It costs a life here, and a run has two.
    for (const board of boards) {
      const ids = bodies(board).map((enemy) => enemy.id);
      const taunts = ids.some((id) => TAUNTERS.has(id));
      const heals = ids.some((id) => HEALERS.has(id));

      expect(taunts && heals, board.id).toBe(false);
    }
  });

  it('never fields two ascended blocks on one board', () => {
    // One anchor is the top band in a tower, and this mode fights with a wounded party. The pair
    // that takes a fresh reference five to single digits would take a Descent party at fight nine
    // to nothing.
    for (const board of boards) {
      const anchors = bodies(board).filter((enemy) => enemy.tier === 'ascended');

      expect(anchors.length, board.id).toBeLessThanOrEqual(1);
    }
  });

  it('keeps every ascended anchor on the last floor s guardians', () => {
    for (const board of boards) {
      if (bodies(board).some((enemy) => enemy.tier === 'ascended')) {
        expect(board.floor, board.id).toBe(rules.floors);
        expect(board.guardian, board.id).toBe(true);
      }
    }
  });

  it('escalates in weight from floor to floor', () => {
    // Measured as bodies and as legendary-or-better anchors, because both are what a floor gets
    // heavier by. ⚠️ The escalation the player *feels* is their own health, which is why this is a
    // gentler ramp than a chapter's — nine fights at a flat difficulty already ramp.
    const weight = (floor: number): number => {
      const onFloor = boards.filter((board) => board.floor === floor);
      const anchors = onFloor.reduce(
        (sum, board) => sum + bodies(board).filter((enemy) => enemy.tier !== 'common').length,
        0,
      );
      return anchors / onFloor.length;
    };

    expect(weight(2)).toBeGreaterThan(weight(1));
    expect(weight(3)).toBeGreaterThan(weight(2));
  });

  it('borrows no chapter final and no chapter lieutenant', () => {
    // ⚠️ **Every chapter ends on a boss fielded nowhere else, which `chapters.ts` states as a
    // rule** — borrowing one here would break it silently. A lieutenant is a chapter's recurring
    // antagonist; borrowing one would make it a daily.
    const RESERVED = new Set([
      'fenlord',
      'pale-warden',
      'first-cinder',
      'ashfall-sovereign',
      'chainsworn',
      'hollow-seraph',
      'the-cairn-king',
      'the-withered-crown',
      'the-anvil-crowned',
      'the-everwound',
      'the-gravewright',
      'the-longshadow',
      'the-grudgekeeper',
      'the-redmaw',
      // The Unmade is the ceiling `enemies.spec.ts` holds every later block under, and a wounded
      // party at fight nine is not what it is sized against.
      'unmade',
    ]);

    for (const board of boards) {
      for (const enemy of bodies(board)) {
        expect(RESERVED.has(enemy.id), `${board.id} fields ${enemy.id}`).toBe(false);
      }
    }
  });
});

describe('the wiring the Descent needs to be reachable at all', () => {
  it('ships an activity for it, with no authored faction', () => {
    const activity = activities.find((entry) => entry.kind === 'descent');

    expect(activity?.id).toBe('descent');
    // ⚠️ **Not "no lock".** The lock is three factions drawn daily; a faction written here would be
    // a second, staler answer to the same question and the crew editor would enforce the wrong one.
    expect(activity?.faction).toBeUndefined();
  });

  it('ships exactly one Descent activity', () => {
    expect(activities.filter((entry) => entry.kind === 'descent')).toHaveLength(1);
  });

  it('pays two achievement tracks off one counter rather than inventing a second', () => {
    // ⚠️ `core/achievements.ts` forbids a counter whose only purpose is to be rewarded. One counter
    // at two intervals says the same two things a second field would have: a rhythm for the habit,
    // and a milestone for the month it takes to reach.
    const mine = tracks.filter((track) => track.counter === 'descentRuns');

    expect(mine).toHaveLength(2);
    expect(new Set(mine.map((track) => track.every)).size).toBe(2);
    for (const track of mine) {
      expect((track.reward.summons ?? 0) > 0, track.id).toBe(true);
    }
  });

  it('asks its daily quest for exactly one run', () => {
    // The mode is once a day, so any larger target is a quest nobody can finish — which is the
    // same failure the counter rule exists to prevent, arriving by the other door.
    const daily = quests.filter((quest) => quest.counter === 'descentRuns');

    expect(daily).toHaveLength(1);
    expect(daily[0].period).toBe('daily');
    expect(daily[0].target).toBe(1);
  });

  it('opens where the mode is finishable rather than where the towers open', () => {
    // ⚠️ **The one place this mode deliberately parts from "everything optional opens at once".**
    // A run finishes 0 times in 20 at chapters 1 and 2 — a party with no ascension rung fields one
    // skill each — and the daily quest above would then be a row nobody could ever claim. See
    // `descent.balance.ts` and the note on `DESCENT_RULES.unlockChapters`.
    expect(rules.unlockChapters).toBeGreaterThan(1);
  });
});

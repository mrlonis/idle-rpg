// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import { type CharacterData, type CombatantData, type SkillData, type StatusData } from '../core';
import { CHARACTERS } from './characters';
import { ENEMIES } from './enemies';
import { SKILLS } from './skills';
import { STATUSES } from './statuses';

/** Conformance through typed locals, for the reason every other `data/` spec uses them. */
const skills: readonly SkillData[] = SKILLS;
const statuses: readonly StatusData[] = STATUSES;
const characters: readonly CharacterData[] = CHARACTERS;
const enemies: readonly CombatantData[] = ENEMIES;
const combatants: readonly CombatantData[] = [...characters, ...enemies];

/** Every skill any character or enemy actually carries. */
const carried = combatants.flatMap((combatant) => combatant.skills ?? []);

describe('the skill library', () => {
  it('gives every skill a unique id and a name', () => {
    expect(new Set(skills.map((skill) => skill.id)).size).toBe(skills.length);

    for (const skill of skills) {
      expect(skill.name.length, skill.id).toBeGreaterThan(0);
    }
  });

  it('gives every skill something to do', () => {
    for (const skill of skills) {
      expect(skill.effects.length, skill.id).toBeGreaterThan(0);
    }
  });

  it('leaves nothing in the library that nobody carries', () => {
    // An orphan skill is content that can never appear in a fight, and it reads as a kit somebody
    // forgot to attach rather than as a decision.
    const used = new Set(carried.map((skill) => skill.id));
    const orphans = skills.filter((skill) => !used.has(skill.id)).map((skill) => skill.id);

    expect(orphans).toEqual([]);
  });

  it('aims every ally-targeting skill at something that helps', () => {
    // A heal pointed at an enemy or a damage clause pointed at an ally would both resolve
    // perfectly happily, which is exactly why it is worth asserting.
    for (const skill of skills) {
      const helpful = skill.target.startsWith('ally') || skill.target === 'self';
      for (const effect of skill.effects) {
        const hurts = effect.kind === 'damage' || effect.kind === 'drain';
        const heals = effect.kind === 'heal' || effect.kind === 'cleanse';

        expect(helpful && hurts, `${skill.id}/${effect.kind}`).toBe(false);
        expect(!helpful && heals, `${skill.id}/${effect.kind}`).toBe(false);
      }
    }
  });

  it('only ever applies a status the library authors', () => {
    const known = new Set(statuses.map((status) => status.id));

    for (const skill of skills) {
      for (const effect of skill.effects) {
        if (effect.kind === 'status') {
          expect(known.has(effect.status.id), `${skill.id}/${effect.status.id}`).toBe(true);
        }
      }
    }
  });

  it('never puts a hostile status on an ally or a friendly one on an enemy', () => {
    for (const skill of skills) {
      const helpful = skill.target.startsWith('ally') || skill.target === 'self';
      for (const effect of skill.effects) {
        if (effect.kind === 'status') {
          expect(effect.status.hostile, `${skill.id}/${effect.status.id}`).toBe(!helpful);
        }
      }
    }
  });

  it('keeps a wide skill weaker per target than a single-target one', () => {
    // Five small hits against the diminishing-DEF curve are worth far less than one big one, so
    // the multiplier on a row or wave skill has to be read against that rather than against the
    // target count. A 2× skill that also hit everybody would simply be the only skill.
    const power = (skill: SkillData): number =>
      Math.max(
        ...skill.effects.map((effect) =>
          effect.kind === 'damage' || effect.kind === 'drain' ? effect.power : 0,
        ),
      );
    const wide = ['enemy-all', 'enemy-row-front', 'enemy-row-back'];

    for (const skill of skills) {
      if (wide.includes(skill.target)) {
        expect(power(skill), skill.id).toBeLessThanOrEqual(1.2);
      }
    }
  });

  it('prices every heal and shield against something the caster actually has', () => {
    // Both scale off `matk`, so a healer authored with a physical stat line would produce a skill
    // that fires on cue and restores nothing.
    const healers = combatants.filter((combatant) =>
      (combatant.skills ?? []).some((skill) =>
        skill.effects.some(
          (effect) =>
            effect.kind === 'heal' ||
            (effect.kind === 'status' &&
              (effect.status.kind === 'regen' || effect.status.kind === 'shield')),
        ),
      ),
    );

    expect(healers.length).toBeGreaterThan(0);
    for (const healer of healers) {
      expect(Number(healer.stats.matk), healer.id).toBeGreaterThanOrEqual(
        Number(healer.stats.patk) * 0.6,
      );
    }
  });
});

describe('the status library', () => {
  it('gives every status a unique id and a name', () => {
    expect(new Set(statuses.map((status) => status.id)).size).toBe(statuses.length);

    for (const status of statuses) {
      expect(status.name.length, status.id).toBeGreaterThan(0);
    }
  });

  it('gives every status a duration long enough to happen', () => {
    // A status that expires on the tick it lands is a status that never happened, which is far
    // harder to notice than one that lasts a moment too long.
    for (const status of statuses) {
      expect(status.duration, status.id).toBeGreaterThan(0);
    }
  });

  it('keeps a stat multiplier inside a quarter to a third of the stat', () => {
    // Big enough that spending a turn on it beats swinging, small enough that landing two of them
    // is not the whole fight.
    for (const status of statuses) {
      if (status.kind === 'stat-mod') {
        expect(status.multiplier, status.id).toBeGreaterThanOrEqual(0.7);
        expect(status.multiplier, status.id).toBeLessThanOrEqual(1.4);
        expect(status.multiplier, status.id).not.toBe(1);
        // A debuff lowers and a buff raises. `hostile` is authored rather than inferred, so this
        // is the assertion that keeps the two from drifting apart.
        expect(status.multiplier < 1, status.id).toBe(status.hostile);
      }
    }
  });

  it('makes a stun the shortest thing in the library', () => {
    // A stun costs its victim the turn it had already earned, so it is tempo denial rather than
    // removal — and a fight can never deadlock behind one.
    const stun = statuses.find((status) => status.kind === 'stun');
    const others = statuses.filter((status) => status.kind !== 'stun');

    expect(stun).toBeDefined();
    for (const status of others) {
      expect(status.duration, status.id).toBeGreaterThan(stun?.duration ?? 0);
    }
  });

  it('marks every damaging status hostile and every restorative one not', () => {
    for (const status of statuses) {
      if (status.kind === 'dot') {
        expect(status.hostile, status.id).toBe(true);
      }
      if (status.kind === 'regen' || status.kind === 'shield') {
        expect(status.hostile, status.id).toBe(false);
      }
    }
  });
});

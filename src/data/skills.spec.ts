// @vitest-environment node
// Content is checked by deriving from it, not by re-typing the numbers. This spec runs headless
// for the same reason `core/` does.
import { describe, expect, it } from 'vitest';
import {
  ATB_THRESHOLD,
  type CharacterData,
  type CombatantData,
  type SkillData,
  type StatusData,
} from '../core';
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

  it('makes every heal, shield and regeneration worth the turn it costs', () => {
    // All three price against `atk`, and since 8a there is only one attack stat — so this can no
    // longer catch a healer that invested in the wrong half of its offence. What it catches now
    // is the failure the collapse created: the characters authored to restore health are healers
    // and tanks, which carry the lowest attack stats in the game, so a power tuned against the
    // old `matk` can quietly become a badge rather than a defence.
    //
    // Both halves of the bar are read off the content. A restoration is measured against a
    // typical health bar, and a regeneration is credited with the procs its authored duration
    // buys at a typical gauge fill — so adding a slower roster or a bigger one re-runs the
    // arithmetic instead of leaving a number here describing a game that has moved on.
    const median = (values: readonly number[]): number => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    };
    const typicalHp = median(combatants.map((combatant) => Number(combatant.stats.hp)));
    const typicalHaste = median(combatants.map((combatant) => combatant.stats.haste));
    const procs = (duration: number): number =>
      Math.max(Math.floor(duration / (ATB_THRESHOLD / typicalHaste)), 1);

    /** What one use of a skill restores, as a multiple of the caster's `atk`. */
    const restoration = (skill: SkillData): number => {
      let best = 0;
      for (const effect of skill.effects) {
        if (effect.kind === 'heal') {
          best = Math.max(best, effect.power);
        } else if (effect.kind === 'status' && effect.status.kind === 'shield') {
          best = Math.max(best, effect.status.power);
        } else if (effect.kind === 'status' && effect.status.kind === 'regen') {
          best = Math.max(best, effect.status.power * procs(effect.status.duration));
        }
      }
      return best;
    };

    const healers = combatants
      .map((combatant) => ({
        combatant,
        best: Math.max(0, ...(combatant.skills ?? []).map(restoration)),
      }))
      .filter((entry) => entry.best > 0);

    expect(healers.length).toBeGreaterThan(0);
    for (const { combatant, best } of healers) {
      expect(Number(combatant.stats.atk) * best, combatant.id).toBeGreaterThanOrEqual(
        typicalHp * 0.05,
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
      if (status.kind === 'dot' || status.kind === 'bomb') {
        expect(status.hostile, status.id).toBe(true);
      }
      if (
        status.kind === 'regen' ||
        status.kind === 'shield' ||
        status.kind === 'taunt' ||
        status.kind === 'reflect' ||
        status.kind === 'link'
      ) {
        // The three milestone-17 protective kinds sit here for the same reason a shield does: a
        // cleanse only ever reaches its holder's own allies, so `hostile` on one of these would
        // mean the side that cast it could dispel it and the side it is used against could not.
        expect(status.hostile, status.id).toBe(false);
      }
    }
  });

  it('leaves a window at whatever is standing behind a taunt', () => {
    // ⚠️ **The duty-cycle rule, and it is about an encounter staying answerable rather than about
    // termination.** A taunt overrides the row gate, so while it is up a party whose only reach is
    // single-target cannot touch the back rank at all. A cooldown at or under the duration would
    // hold that door shut for a whole fight. Same shape as `BULWARK`'s "cooldown above the
    // barrier's duration", and derived from both numbers rather than restating either.
    for (const skill of skills) {
      for (const effect of skill.effects) {
        if (effect.kind === 'status' && effect.status.kind === 'taunt') {
          expect(skill.cooldown ?? 0, `${skill.id}/${effect.status.id}`).toBeGreaterThan(
            effect.status.duration,
          );
        }
      }
    }
  });

  it('keeps a reflect or a link to a minority share of the hit', () => {
    // Both are shares of somebody else's damage, and both stop being a lock and start being a rule
    // of the game somewhere near a half. A reflect at 1 would answer every blow in full — a fight
    // decided by who swings, not by who is stronger — and a link at 1 would move the entire hit off
    // its target, so the thing the party is aiming at is the one thing that never takes damage.
    for (const status of statuses) {
      if (status.kind === 'reflect' || status.kind === 'link') {
        expect(status.share, status.id).toBeGreaterThan(0);
        expect(status.share, status.id).toBeLessThanOrEqual(0.5);
      }
    }
  });

  it('makes a delayed payload bigger than a tick and smaller than a swing', () => {
    // Derived from the library at both ends rather than written down. **Bigger than any
    // damage-over-time proc**, because the whole difference is that it arrives in one piece — a
    // bomb the size of a tick is a poison that is worse at being a poison. **No bigger than the
    // largest single-target hit anybody carries**, because past that a payload the party failed to
    // cleanse is not a punishment, it is a deletion.
    const dots = statuses.filter((status) => status.kind === 'dot').map((status) => status.power);
    const wide = ['enemy-all', 'enemy-row-front', 'enemy-row-back'];
    const swings = skills
      .filter((skill) => !wide.includes(skill.target))
      .flatMap((skill) =>
        skill.effects.map((effect) =>
          effect.kind === 'damage' || effect.kind === 'drain' ? effect.power : 0,
        ),
      );

    for (const status of statuses) {
      if (status.kind === 'bomb') {
        expect(status.power, status.id).toBeGreaterThan(Math.max(...dots));
        expect(status.power, status.id).toBeLessThanOrEqual(Math.max(...swings));
      }
    }
  });
});

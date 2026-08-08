import { describe, expect, it } from 'vitest';
import { lineupBonus } from '../core';
import { COMBAT } from './content';
import { lineupPanel } from './lineup-copy';

/**
 * The lineup panel's wording.
 *
 * These were assertions against the roster screen's DOM until milestone 15a moved the panel to the
 * formation editor. They test the pure function directly now, which is what the extraction bought:
 * the copy is what can go wrong here, and rendering a component to read it back out of a `<p>` was
 * testing Angular as much as the sentence.
 *
 * ⚠️ **Resolved through `core/`'s own `lineupBonus` rather than hand-written summaries.** The whole
 * point of the panel is that the screen and the simulation agree about what a composition is worth;
 * a stub returning invented numbers would test the copy against an agreement that does not exist.
 */
function panel(...factions: readonly string[]) {
  return lineupPanel(lineupBonus(factions, COMBAT.lineup));
}

describe('lineupPanel', () => {
  it('tells a crew that qualified for nothing what would qualify', () => {
    // The panel's real job. A bonus with no visible next rung is a number rather than a decision,
    // and the editor is where the decision is made.
    const { shape, effects, hint } = panel('human', 'dwarf');

    expect(shape).toBe('No faction bonus yet');
    expect(effects).toEqual([]);
    expect(hint).toContain('Angels');
  });

  it('names the composition and what it is worth', () => {
    const { shape, effects } = panel('dwarf', 'dwarf', 'dwarf', 'elf', 'elf');

    expect(shape).toBe('Dwarves ×3 · Elves ×2');
    expect(effects).toEqual(['+15% attack', '+15% health']);
  });

  it('credits Angels to the faction they stood in for', () => {
    // The wildcard is what makes a mono five reachable at all on a thin roster, so the panel has to
    // say the crew counts as five Humans. It says it in the hint rather than in the roll-call,
    // because the roll-call has to keep agreeing with the flat tracks — which count real members
    // and would disagree with a headline of "Humans ×5".
    const { shape, effects, hint } = panel('human', 'human', 'human', 'angel', 'angel');

    expect(shape).toBe('Humans ×3 · Angels ×2');
    expect(hint).toContain('Counts as Humans ×5');
    expect(effects).toEqual(['+25% attack', '+25% health']);
  });

  it('does not claim a substitution when none happened', () => {
    // Five real Humans reach the same rung with no wildcard involved, so "counts as Humans ×5"
    // under "Humans ×5" would be the panel explaining itself to itself.
    const { shape, hint } = panel('human', 'human', 'human', 'human', 'human');

    expect(shape).toBe('Humans ×5');
    expect(hint).not.toContain('Counts as');
  });

  it('names a faction once when it is both half of a rung and a flat track', () => {
    // Monsters here are the second half of a three-and-two *and* the rally track, and the panel has
    // one line for both facts. Naming them twice makes the line read as though seven characters
    // were standing, which is the worst kind of wrong: plausible.
    const { shape } = panel('human', 'human', 'human', 'monster', 'monster');

    expect(shape).toBe('Humans ×3 · Monsters ×2');
  });

  it('reports who is standing rather than what the rung counted them as', () => {
    // Three Demons and two Angels reaches a mono five, but the Demon track only ever counts real
    // Demons — so a line saying "Demons ×5" beside three rungs' worth of Demon effects invites the
    // player to wonder where the other two rungs went. The rung goes in the hint instead.
    const { shape, effects, hint } = panel('demon', 'demon', 'demon', 'angel', 'angel');

    expect(shape).toBe('Demons ×3 · Angels ×2');
    expect(hint).toContain('Demons ×5');
    // Three Demons, so three rungs of the track and not five.
    expect(effects).toEqual([
      '+25% attack',
      '+25% health',
      '+30% defence',
      '+15% crit rating',
      '+25% energy recovery while hurt',
    ]);
  });

  it('names the flat tracks separately, so a bonus without a rung is still attributable', () => {
    // One Demon reaches no rung at all and is still worth standing. "+30% defence" with no
    // composition line beside it is a number a player cannot act on.
    const { shape, effects } = panel('demon', 'monster', 'elf');

    expect(shape).toBe('Monsters ×1 · Demons ×1');
    expect(effects).toEqual(['+2% attack', '+2% health', '+30% defence']);
  });
});

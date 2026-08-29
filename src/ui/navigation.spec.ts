import { describe, expect, it } from 'vitest';
import { EXPEDITION_LIST } from './content';
import { backTo, expeditionOrigin } from './navigation';

/** What an unresolvable origin has to produce, since every case below shares it. */
const ROSTER = { path: '/roster', label: 'Roster' };

describe('backTo', () => {
  it('returns the screen a link named as its origin', () => {
    expect(backTo('home')).toEqual({ path: '/', label: 'Home' });
    expect(backTo('roster')).toEqual(ROSTER);
    expect(backTo('formations')).toEqual({ path: '/formations', label: 'Formations' });
    expect(backTo('descent')).toEqual({ path: '/descent', label: 'The Descent' });
    expect(backTo('expeditions')).toEqual({ path: '/expeditions', label: 'Expeditions' });
  });

  it('falls back to the roster when no origin arrived', () => {
    // A bookmarked or hand-typed `/roster/rin` has no `from` at all, and a back link that went
    // nowhere would strand the player on a screen with no exit.
    expect(backTo(undefined)).toEqual(ROSTER);
  });

  it('falls back to the caller’s own screen when it names one', () => {
    // The fallback is "where did players arrive from before origins were written down", and that
    // differs per detail view: the character sheet's is the roster, the formation editor's is the
    // formations index.
    expect(backTo(undefined, 'formations')).toEqual({ path: '/formations', label: 'Formations' });
    expect(backTo('summon', 'formations')).toEqual({ path: '/formations', label: 'Formations' });
  });

  it('falls back rather than trusting an origin it does not know', () => {
    // A URL saved from a build where the origin existed, or one somebody typed. Either way the
    // link still has to lead somewhere inside the app.
    expect(backTo('summon')).toEqual(ROSTER);
    expect(backTo('')).toEqual(ROSTER);
    expect(backTo('https://example.com')).toEqual(ROSTER);
  });

  it('does not mistake an inherited object property for a screen', () => {
    // The reason the lookup is a Map: `SCREENS['constructor']` is a function, and a plain object
    // index would hand that back as though it were somewhere to navigate to.
    expect(backTo('constructor')).toEqual(ROSTER);
    expect(backTo('toString')).toEqual(ROSTER);
    expect(backTo('__proto__')).toEqual(ROSTER);
  });

  describe('an expedition map as an origin', () => {
    // Derived from the shipped maps rather than retyped, per the data-testing rule: a renamed map
    // must move this assertion with it.
    const map = EXPEDITION_LIST[0];

    it('resolves to that map’s own screen, named after the map', () => {
      expect(backTo(expeditionOrigin(map.id))).toEqual({
        path: `/expeditions/${map.id}`,
        label: map.name,
      });
    });

    it('degrades to the Expeditions index for a map this build does not ship', () => {
      // A stale bookmark from a build whose maps differed. The index is one screen up from where
      // the link pointed, where the caller's fallback would be a different part of the app.
      expect(backTo(expeditionOrigin('no-such-map'), 'formations')).toEqual({
        path: '/expeditions',
        label: 'Expeditions',
      });
    });
  });
});

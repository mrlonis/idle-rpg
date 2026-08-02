import { describe, expect, it } from 'vitest';
import { backTo } from './navigation';

/** What an unresolvable origin has to produce, since every case below shares it. */
const ROSTER = { path: '/roster', label: 'Roster' };

describe('backTo', () => {
  it('returns the screen a link named as its origin', () => {
    expect(backTo('home')).toEqual({ path: '/', label: 'Home' });
    expect(backTo('roster')).toEqual(ROSTER);
  });

  it('falls back to the roster when no origin arrived', () => {
    // A bookmarked or hand-typed `/roster/rin` has no `from` at all, and a back link that went
    // nowhere would strand the player on a screen with no exit.
    expect(backTo(undefined)).toEqual(ROSTER);
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
});

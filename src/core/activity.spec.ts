// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import {
  type ActivityData,
  CAMPAIGN_ACTIVITY,
  crewFor,
  factionMeetsLock,
  partyMeetsLock,
} from './activity';
import { CAMPAIGN_FORMATION, type PartyFormation } from './state';

const TOWER: ActivityData = {
  id: 'tower-dwarf',
  name: 'The Deep Hold',
  kind: 'tower',
  faction: 'dwarf',
};

const FACTIONS: Readonly<Record<string, string>> = {
  dorn: 'dwarf',
  grimna: 'dwarf',
  rin: 'human',
};

const factionOf = (defId: string): string | undefined => FACTIONS[defId];

const crew = (front: readonly string[], back: readonly string[] = []): PartyFormation => ({
  front: [...front],
  back: [...back],
});

describe('factionMeetsLock', () => {
  it('admits anybody to an activity with no lock', () => {
    expect(factionMeetsLock(CAMPAIGN_ACTIVITY, 'dwarf')).toBe(true);
    expect(factionMeetsLock(CAMPAIGN_ACTIVITY, 'angel')).toBe(true);
  });

  it('admits only the named faction to a locked one', () => {
    expect(factionMeetsLock(TOWER, 'dwarf')).toBe(true);
    expect(factionMeetsLock(TOWER, 'human')).toBe(false);
  });
});

describe('partyMeetsLock', () => {
  it('passes an empty crew, because a player mid-reshuffle has done nothing wrong', () => {
    // ⚠️ The lock is a filter on *who may stand*, never a requirement that the crew be full. What
    // refuses an empty crew is the Fight control, exactly as it does for the campaign.
    expect(partyMeetsLock(TOWER, crew([]), factionOf)).toBe(true);
  });

  it('passes a crew drawn entirely from the locked faction, across both ranks', () => {
    expect(partyMeetsLock(TOWER, crew(['dorn'], ['grimna']), factionOf)).toBe(true);
  });

  it('fails as soon as one member is from elsewhere, wherever they are standing', () => {
    expect(partyMeetsLock(TOWER, crew(['dorn'], ['rin']), factionOf)).toBe(false);
    expect(partyMeetsLock(TOWER, crew(['rin'], ['dorn']), factionOf)).toBe(false);
  });

  it('fails an id that resolves to no faction rather than giving it the benefit of the doubt', () => {
    // A crew naming somebody this build cannot identify is a crew to rebuild. Passing it would
    // send an unresolvable member into a fight the lock exists to shape.
    expect(partyMeetsLock(TOWER, crew(['ghost']), factionOf)).toBe(false);
  });

  it('passes anything at all for an unlocked activity, unknown ids included', () => {
    expect(partyMeetsLock(CAMPAIGN_ACTIVITY, crew(['rin', 'ghost']), factionOf)).toBe(true);
  });
});

describe('crewFor', () => {
  it('reads the activity’s own key out of the book', () => {
    const book = {
      [CAMPAIGN_FORMATION]: crew(['rin']),
      'tower-dwarf': crew(['dorn']),
    };

    expect(crewFor(book, CAMPAIGN_ACTIVITY)).toEqual(crew(['rin']));
    expect(crewFor(book, TOWER)).toEqual(crew(['dorn']));
  });

  it('answers an activity that has never been crewed with an empty formation', () => {
    expect(crewFor({}, TOWER)).toEqual({ front: [], back: [] });
  });

  it('returns the same empty formation every time, so a computed does not churn', () => {
    // `ui/` reads this from `computed()` values that compare by reference. A fresh object per call
    // would republish every screen watching an empty crew on every change-detection pass.
    expect(crewFor({}, TOWER)).toBe(crewFor({}, CAMPAIGN_ACTIVITY));
  });
});

describe('CAMPAIGN_ACTIVITY', () => {
  it('is filed under the key `core/` seeds a new run’s starters into', () => {
    // `grantStarters` writes `CAMPAIGN_FORMATION` directly, so a campaign activity under any other
    // id would show an empty crew over a run that demonstrably has one.
    expect(CAMPAIGN_ACTIVITY.id).toBe(CAMPAIGN_FORMATION);
  });

  it('carries no lock, so the campaign never refuses a legal party', () => {
    expect(CAMPAIGN_ACTIVITY.faction).toBeUndefined();
  });
});

// @vitest-environment node
// core/ must run headless: no Angular TestBed, no DOM. This overrides the Angular unit-test
// builder's jsdom default so a stray DOM reference fails here rather than only in the
// balance sweeps. Keep this on every core/ spec.
import { describe, expect, it } from 'vitest';
import { type CombatantData } from '../battle/types';
import { num } from '../numeric';
import { rarityIndex } from '../roster/rarity';
import { newGame, type GameState } from '../state';
import {
  applySignatureAbility,
  clampSignatureLevel,
  levelSignature,
  maxSignatureLevel,
  mergeBonus,
  nextSignatureTierAt,
  signatureBonus,
  signatureCost,
  signatureTier,
  signatureTierIndex,
  signatureTotalCost,
  signatureUnlocked,
} from './signature';
import { type SignatureItemData, type SignatureRulesData } from './types';

const T0 = 1_700_000_000_000;

/** The shipped shape, with round numbers so a total is arithmetic a reader can check. */
const RULES: SignatureRulesData = {
  unlockRarity: 'mythic',
  maxLevel: 30,
  tierEvery: 10,
  cost: { base: 10, perLevel: 2 },
};

const ITEM: SignatureItemData = {
  id: 'test-signature',
  defId: 'alpha',
  name: 'Test Signature',
  description: 'A signature item for testing.',
  perLevel: { atk: 0.04, hp: 0.01 },
  tiers: [
    { name: 'I', description: 'base' },
    {
      name: 'II',
      description: 'wider',
      skills: [{ skillId: 'strike', target: 'enemy-row-front' }],
    },
    { name: 'III', description: 'faster', skills: [{ skillId: 'strike', cooldown: 20 }] },
    {
      name: 'IV',
      description: 'and a ward',
      skills: [{ skillId: 'strike', target: 'enemy-all' }],
      opening: [
        {
          kind: 'stat-mod',
          id: 'test-ward',
          name: 'Ward',
          hostile: false,
          duration: 9999,
          stat: 'def',
          multiplier: 1.5,
        },
      ],
    },
  ],
};

const COMBATANT: CombatantData = {
  id: 'alpha',
  name: 'Alpha',
  faction: 'human',
  stats: { hp: 100, atk: 10, def: 5, haste: 100, critChance: 0, critDamageAmp: 0 },
  skills: [
    { id: 'strike', name: 'Strike', target: 'enemy-front', effects: [], cooldown: 40 },
    { id: 'other', name: 'Other', target: 'ally-all', effects: [] },
  ],
};

function run(overrides: Partial<GameState> = {}): GameState {
  return { ...newGame({ seed: 0x51617, nowMs: T0 }), ...overrides };
}

/** A run owning `alpha` at `rarity`, with `signature` levels bought and `emblem` in the wallet. */
function owning(rarity: number, signature: number, emblem: number): GameState {
  const base = run();
  return {
    ...base,
    wallet: { ...base.wallet, emblem: num(emblem) },
    roster: [{ defId: 'alpha', rarity, level: 1, copies: 0, gear: {}, signature }],
  };
}

describe('signatureUnlocked', () => {
  const MYTHIC = rarityIndex('mythic');

  it('is false below the unlock rung, however high the tier', () => {
    expect(signatureUnlocked(RULES, 'ascended', MYTHIC - 1)).toBe(false);
  });

  it('is true at the unlock rung and above', () => {
    expect(signatureUnlocked(RULES, 'ascended', MYTHIC)).toBe(true);
    expect(signatureUnlocked(RULES, 'ascended', MYTHIC + 4)).toBe(true);
  });

  it.each(['common', 'legendary'] as const)(
    'is false for a %s-tier character at any rung',
    (tier) => {
      // ⚠️ The tier check is the content rule, and it is enforced here rather than left to
      // authoring — so a signature item accidentally pointed at a legendary-tier character is
      // inert rather than a quiet exception to "ascended tier only".
      expect(signatureUnlocked(RULES, tier, MYTHIC)).toBe(false);
      expect(signatureUnlocked(RULES, tier, rarityIndex('ascended-5'))).toBe(false);
    },
  );

  it('resolves an unlock rarity that names no rung as locked rather than as unlocked', () => {
    // The direction that cannot hand out content nobody authored.
    const broken: SignatureRulesData = { ...RULES, unlockRarity: 'not-a-rarity' };

    expect(signatureUnlocked(broken, 'ascended', rarityIndex('ascended-5'))).toBe(false);
  });
});

describe('the cost curve', () => {
  it('prices level 1 at the base alone, because level 1 is the unlock', () => {
    expect(signatureCost(RULES, 1)).toBe(RULES.cost.base);
  });

  it('rises by the step for every level above the first', () => {
    expect(signatureCost(RULES, 2)).toBe(12);
    expect(signatureCost(RULES, 30)).toBe(10 + 2 * 29);
  });

  it('never falls as the level rises', () => {
    // The property that makes the last level worth buying: a linear ramp, not a curve with a
    // cheap tail. Derived across the whole range rather than spot-checked.
    for (let level = 2; level <= maxSignatureLevel(RULES); level++) {
      expect(signatureCost(RULES, level)).toBeGreaterThanOrEqual(signatureCost(RULES, level - 1));
    }
  });

  it('totals the levels actually charged rather than a closed form', () => {
    // ⚠️ The closed form of a rounded ramp is not the rounded closed form. The number a screen
    // shows has to be the number the player will be charged, level by level.
    let summed = 0;
    for (let level = 1; level <= maxSignatureLevel(RULES); level++) {
      summed += signatureCost(RULES, level);
    }

    expect(signatureTotalCost(RULES, maxSignatureLevel(RULES))).toBe(summed);
  });

  it('clamps a total past the ceiling to the ceiling', () => {
    expect(signatureTotalCost(RULES, 999)).toBe(
      signatureTotalCost(RULES, maxSignatureLevel(RULES)),
    );
  });
});

describe('ability tiers', () => {
  it('puts levels 1 to 9 on the first rung and 10 on the second', () => {
    expect(signatureTierIndex(RULES, 1)).toBe(0);
    expect(signatureTierIndex(RULES, 9)).toBe(0);
    expect(signatureTierIndex(RULES, 10)).toBe(1);
    expect(signatureTierIndex(RULES, 29)).toBe(2);
    expect(signatureTierIndex(RULES, 30)).toBe(3);
  });

  it('has no tier at all while the item is locked', () => {
    // Distinct from "tier 0": a locked item grants nothing, and level 1 grants the first rung.
    expect(signatureTier(RULES, ITEM, 0)).toBeUndefined();
    expect(signatureTier(RULES, ITEM, 1)?.name).toBe('I');
  });

  it('names the next level at which the ability grows, and stops naming one at the top', () => {
    expect(nextSignatureTierAt(RULES, ITEM, 1)).toBe(10);
    expect(nextSignatureTierAt(RULES, ITEM, 10)).toBe(20);
    expect(nextSignatureTierAt(RULES, ITEM, 30)).toBeUndefined();
  });

  it('clamps to the last authored tier rather than reading past the end', () => {
    const short: SignatureItemData = { ...ITEM, tiers: [ITEM.tiers[0]] };

    expect(signatureTier(RULES, short, 30)?.name).toBe('I');
  });
});

describe('signatureBonus', () => {
  it('is worth nothing at all while locked', () => {
    expect(signatureBonus(RULES, ITEM, 0)).toEqual({});
  });

  it('is linear in the level', () => {
    expect(signatureBonus(RULES, ITEM, 1)).toEqual({ atk: 0.04, hp: 0.01 });
    expect(signatureBonus(RULES, ITEM, 30)).toEqual({ atk: 0.04 * 30, hp: 0.01 * 30 });
  });

  it('clamps a level past the ceiling rather than paying for it', () => {
    expect(signatureBonus(RULES, ITEM, 999)).toEqual(
      signatureBonus(RULES, ITEM, maxSignatureLevel(RULES)),
    );
  });

  it('clamps a damaged level to locked', () => {
    expect(signatureBonus(RULES, ITEM, Number.NaN)).toEqual({});
    expect(signatureBonus(RULES, ITEM, -7)).toEqual({});
  });
});

describe('mergeBonus', () => {
  it('adds rather than compounds', () => {
    // ⚠️ The property a panel can explain: "+60% gear, +150% signature" totals +210%, not +300%.
    // Compounding would make whichever bonus applied last the more valuable one.
    expect(mergeBonus({ atk: 0.6 }, { atk: 1.5 })).toEqual({ atk: 2.1 });
  });

  it('keeps a stat only one side mentions', () => {
    expect(mergeBonus({ hp: 0.2 }, { atk: 0.5 })).toEqual({ hp: 0.2, atk: 0.5 });
  });
});

describe('applySignatureAbility', () => {
  it('leaves a combatant untouched when there is no tier', () => {
    expect(applySignatureAbility(COMBATANT, undefined)).toBe(COMBATANT);
  });

  it('rewrites only the field the override names, keeping the rest of the skill', () => {
    const applied = applySignatureAbility(COMBATANT, ITEM.tiers[1]);
    const strike = applied.skills?.find((skill) => skill.id === 'strike');

    expect(strike?.target).toBe('enemy-row-front');
    // Absent on the override, so the authored value survives. That is the whole difference
    // between "not mentioned" and "set to a falsy value".
    expect(strike?.cooldown).toBe(40);
  });

  it('leaves every other skill in the kit alone', () => {
    const applied = applySignatureAbility(COMBATANT, ITEM.tiers[1]);

    expect(applied.skills?.find((skill) => skill.id === 'other')).toEqual(
      COMBATANT.skills?.find((skill) => skill.id === 'other'),
    );
  });

  it('is inert when the override names a skill the kit does not have', () => {
    // Keeps a stale `skillId` a content bug for `data/signature.spec.ts` to catch rather than a
    // runtime surprise — and specifically does not invent a skill nobody authored.
    const stale = { name: 'X', description: 'x', skills: [{ skillId: 'missing', cooldown: 1 }] };

    expect(applySignatureAbility(COMBATANT, stale)).toBe(COMBATANT);
  });

  it('adds an opening status without disturbing the kit', () => {
    const applied = applySignatureAbility(COMBATANT, ITEM.tiers[3]);

    expect(applied.opening?.map((status) => status.id)).toEqual(['test-ward']);
    expect(applied.skills?.find((skill) => skill.id === 'strike')?.target).toBe('enemy-all');
  });

  it('does not mutate the combatant it is given', () => {
    applySignatureAbility(COMBATANT, ITEM.tiers[3]);

    expect(COMBATANT.opening).toBeUndefined();
    expect(COMBATANT.skills?.find((skill) => skill.id === 'strike')?.target).toBe('enemy-front');
  });
});

describe('levelSignature', () => {
  const MYTHIC = rarityIndex('mythic');

  it('buys a level and charges the wallet', () => {
    const result = levelSignature(owning(MYTHIC, 0, 100), 'alpha', 'ascended', ITEM, RULES);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.roster[0].signature).toBe(1);
      expect(result.state.wallet.emblem.eq(100 - signatureCost(RULES, 1))).toBe(true);
    }
  });

  it.each([
    { label: 'below the unlock rung', rarity: rarityIndex('mythic') - 1, reason: 'locked' },
    { label: 'at the rung but broke', rarity: rarityIndex('mythic'), reason: 'insufficient' },
  ])('refuses when $label', ({ rarity, reason }) => {
    const emblem = reason === 'insufficient' ? 0 : 500;

    const result = levelSignature(owning(rarity, 0, emblem), 'alpha', 'ascended', ITEM, RULES);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe(reason);
    }
  });

  it('refuses a character that is not ascended tier', () => {
    const result = levelSignature(owning(MYTHIC, 0, 500), 'alpha', 'legendary', ITEM, RULES);

    expect(result).toEqual({ ok: false, reason: 'locked' });
  });

  it('refuses when this build ships no item for the character', () => {
    const result = levelSignature(owning(MYTHIC, 0, 500), 'alpha', 'ascended', undefined, RULES);

    expect(result).toEqual({ ok: false, reason: 'no-item' });
  });

  it('refuses a character the run does not own', () => {
    const result = levelSignature(owning(MYTHIC, 0, 500), 'nobody', 'ascended', ITEM, RULES);

    expect(result).toEqual({ ok: false, reason: 'unknown-character' });
  });

  it('refuses once maxed rather than charging for nothing', () => {
    const maxed = owning(MYTHIC, maxSignatureLevel(RULES), 5000);

    const result = levelSignature(maxed, 'alpha', 'ascended', ITEM, RULES);

    expect(result).toEqual({ ok: false, reason: 'maxed' });
  });

  it('charges the price of the level being bought, not of the level being left', () => {
    const result = levelSignature(owning(MYTHIC, 9, 1000), 'alpha', 'ascended', ITEM, RULES);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.roster[0].signature).toBe(10);
      expect(result.state.wallet.emblem.eq(1000 - signatureCost(RULES, 10))).toBe(true);
    }
  });

  it('does not mutate the state it is given', () => {
    const state = owning(MYTHIC, 0, 100);

    levelSignature(state, 'alpha', 'ascended', ITEM, RULES);

    expect(state.roster[0].signature).toBe(0);
    expect(state.wallet.emblem.eq(100)).toBe(true);
  });

  it('leaves every other roster entry alone', () => {
    const base = owning(MYTHIC, 0, 100);
    const state: GameState = {
      ...base,
      roster: [
        ...base.roster,
        { defId: 'beta', rarity: 2, level: 5, copies: 1, gear: {}, signature: 0 },
      ],
    };

    const result = levelSignature(state, 'alpha', 'ascended', ITEM, RULES);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.roster[1]).toBe(state.roster[1]);
    }
  });
});

describe('clampSignatureLevel', () => {
  it('keeps zero as locked rather than clamping it up to the first level', () => {
    // ⚠️ Locked and level 1 are different states — one shows a price, the other an ability — and
    // collapsing them would hand every eligible character a free level.
    expect(clampSignatureLevel(RULES, 0)).toBe(0);
  });

  it('clamps a level past the ceiling and a damaged one to zero', () => {
    expect(clampSignatureLevel(RULES, 999)).toBe(maxSignatureLevel(RULES));
    expect(clampSignatureLevel(RULES, Number.NaN)).toBe(0);
    expect(clampSignatureLevel(RULES, -3)).toBe(0);
  });
});

import { type CombatantData, type SkillData } from '../battle/types';
import { canAfford, debit } from '../currency';
import { num } from '../numeric';
import { rarityIndex } from '../roster/rarity';
import { type CharacterTier, type OwnedCharacter } from '../roster/types';
import { type GameState } from '../state';
import {
  NO_SIGNATURE_BONUS,
  type SignatureAbilityTierData,
  type SignatureBonus,
  type SignatureFailure,
  type SignatureItemData,
  type SignatureRulesData,
} from './types';

/**
 * What a signature level is worth, what it costs, and how the ability reaches the fight.
 *
 * Everything here is a pure function of the item, the rules and one integer. There is no state
 * beyond `OwnedCharacter.signature`, which is what keeps this module small enough to hold in
 * one's head beside the three progression axes it sits alongside.
 */

/** Signature items keyed by the character they belong to. Built by `ui/` from `data/`. */
export type SignatureLookup = ReadonlyMap<string, SignatureItemData>;

/** The outcome of a signature purchase, in the shape the roster operations use. */
export type SignatureResult =
  | { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly reason: SignatureFailure };

const fail = (reason: SignatureFailure): SignatureResult => ({ ok: false, reason });

/** The tier that may hold a signature item at all. A content rule, enforced in one place. */
const ELIGIBLE_TIER: CharacterTier = 'ascended';

/** A whole level at or above zero, treating damage as "locked". */
function wholeLevel(value: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0;
}

/** The highest level this build allows, never below 1. */
export function maxSignatureLevel(rules: SignatureRulesData): number {
  return Number.isFinite(rules.maxLevel) ? Math.max(Math.floor(rules.maxLevel), 1) : 1;
}

/**
 * A stored level clamped into `[0, maxLevel]`.
 *
 * Zero is kept rather than clamped up to one, because zero is **locked** and one is the first
 * bought level. Those are genuinely different states — a locked item shows a price and an unlocked
 * one shows an ability — and collapsing them would hand every eligible character a free level.
 */
export function clampSignatureLevel(rules: SignatureRulesData, level: number): number {
  return Math.min(wholeLevel(level), maxSignatureLevel(rules));
}

/**
 * Whether this character may hold a signature item at all.
 *
 * Two conditions, and both are checked here rather than one being left to `data/` authoring:
 * ascended **tier**, and at or above the unlock **rung**. Those two words are the collision this
 * project carries deliberately — see [glossary](../../../docs/glossary.md) — so it is worth being
 * exact: the tier is which character was pulled and never changes, and the rung is how far that
 * character has been ascended. A signature item wants a top-tier character that has also been
 * invested in, which is why it takes both.
 *
 * An unlock rarity naming a rung that does not exist resolves to **locked** rather than to
 * unlocked, which is the direction that cannot hand out content nobody authored.
 */
export function signatureUnlocked(
  rules: SignatureRulesData,
  tier: CharacterTier,
  rarity: number,
): boolean {
  if (tier !== ELIGIBLE_TIER) {
    return false;
  }
  const gate = rarityIndex(rules.unlockRarity);
  return gate >= 0 && wholeLevel(rarity) >= gate;
}

/**
 * What buying `level` costs in emblems: `base + perLevel × (level − 1)`.
 *
 * The level being **bought**, not the level being left. Level 1 is the unlock, so it is priced by
 * `base` alone — a signature item is never granted, and there is no level 0 to sit at.
 */
export function signatureCost(rules: SignatureRulesData, level: number): number {
  const target = Math.max(wholeLevel(level), 1);
  const base = Number.isFinite(rules.cost.base) ? Math.max(rules.cost.base, 0) : 0;
  const step = Number.isFinite(rules.cost.perLevel) ? Math.max(rules.cost.perLevel, 0) : 0;
  return Math.round(base + step * (target - 1));
}

/**
 * What reaching `level` from scratch costs in total.
 *
 * Derived by summing rather than by a closed form, because the closed form of a rounded linear
 * ramp is not the rounded closed form — and the number a screen shows has to be the number the
 * player will actually be charged, level by level.
 */
export function signatureTotalCost(rules: SignatureRulesData, level: number): number {
  let total = 0;
  for (let step = 1; step <= clampSignatureLevel(rules, level); step++) {
    total += signatureCost(rules, step);
  }
  return total;
}

/**
 * Which rung of the ability a given level has reached, as an index into
 * {@link SignatureItemData.tiers}.
 *
 * Levels 1–9 are tier 0, 10–19 tier 1, 20–29 tier 2 and 30 tier 3 at the shipped numbers. A locked
 * item — level 0 — reports tier 0 as well, which is what lets the sheet show what the *first* rung
 * will be before it has been bought. Callers that care about the difference ask whether the level
 * is above zero; nothing about the ability itself changes between "locked" and "level 1" except
 * that one of them is live.
 */
export function signatureTierIndex(rules: SignatureRulesData, level: number): number {
  const every = Number.isFinite(rules.tierEvery) ? Math.max(Math.floor(rules.tierEvery), 1) : 1;
  const reached = clampSignatureLevel(rules, level);
  if (reached <= 0) {
    return 0;
  }
  return Math.floor(reached / every);
}

/** The ability rung `level` has reached, or nothing when content authors no tier for it. */
export function signatureTier(
  rules: SignatureRulesData,
  item: SignatureItemData,
  level: number,
): SignatureAbilityTierData | undefined {
  if (clampSignatureLevel(rules, level) <= 0) {
    return undefined;
  }
  const index = Math.min(signatureTierIndex(rules, level), item.tiers.length - 1);
  return index < 0 ? undefined : item.tiers[index];
}

/**
 * The next level at which the ability gets stronger, or `undefined` once it cannot.
 *
 * Shown on the sheet beside the current rung, because "what does the next ten levels buy" is the
 * question a player levelling a signature item is actually asking, and a bare level counter does
 * not answer it.
 */
export function nextSignatureTierAt(
  rules: SignatureRulesData,
  item: SignatureItemData,
  level: number,
): number | undefined {
  const every = Number.isFinite(rules.tierEvery) ? Math.max(Math.floor(rules.tierEvery), 1) : 1;
  const max = maxSignatureLevel(rules);
  const current = signatureTierIndex(rules, level);
  const next = (current + 1) * every;
  return next <= max && current + 1 < item.tiers.length ? next : undefined;
}

/**
 * What a signature item at `level` is worth, per stat, as fractions of the wearer's own value.
 *
 * Linear in the level, and that is the one place this deliberately does **not** copy the character
 * curve. A character's levels compound because the game is tuned around a power fantasy that
 * outruns its own content; a signature item is a bounded track thirty levels long sitting beside
 * that, and an exponential over thirty rungs would put a maxed item several orders of magnitude
 * ahead of a fresh one — at which point it is not an axis, it is the game.
 *
 * A locked item is worth nothing at all, which is what makes reaching level 1 a visible step
 * rather than a rounding difference.
 */
export function signatureBonus(
  rules: SignatureRulesData,
  item: SignatureItemData,
  level: number,
): SignatureBonus {
  const reached = clampSignatureLevel(rules, level);
  if (reached <= 0) {
    return NO_SIGNATURE_BONUS;
  }
  const bonus: Record<string, number> = {};
  for (const [stat, share] of Object.entries(item.perLevel)) {
    if (Number.isFinite(share) && share > 0) {
      bonus[stat] = share * reached;
    }
  }
  return bonus;
}

/**
 * Merges two bonus tables by **adding** them, per stat.
 *
 * Summed rather than compounded, which is the same choice `loadoutBonus` makes across gear pieces
 * and for the same reason: a summed bonus is worth what it says whatever else is equipped, so a
 * screen can list "gear +60%, signature +150%" and have the total be the sum a player can check.
 * Compounding would make whichever bonus was applied last the most valuable, which is a property
 * no panel can explain and no player would guess.
 */
export function mergeBonus(a: SignatureBonus, b: SignatureBonus): SignatureBonus {
  const merged: Record<string, number> = { ...a };
  for (const [stat, share] of Object.entries(b)) {
    if (share !== undefined) {
      merged[stat] = (merged[stat] ?? 0) + share;
    }
  }
  return merged;
}

/**
 * Applies a signature ability's skill override to a combatant, before the fight starts.
 *
 * ⚠️ **This runs once per combatant per battle, never per tick**, which is what makes a signature
 * ability free at runtime. The simulation loop never learns that signature items exist — it is
 * handed a kit that already says what the ability made it say.
 *
 * A field left absent on the override keeps whatever the authored skill said, so an override that
 * only shortens a cooldown does not have to restate a target it is not changing. An override
 * naming a skill the kit does not have is inert: the combatant comes back unchanged rather than
 * gaining a skill nobody authored, which keeps a stale `skillId` a content bug for
 * `data/signature.spec.ts` to catch instead of a runtime surprise.
 */
export function applySignatureAbility(
  combatant: CombatantData,
  tier: SignatureAbilityTierData | undefined,
): CombatantData {
  if (tier === undefined) {
    return combatant;
  }
  const withOpening =
    tier.opening === undefined || tier.opening.length === 0
      ? combatant
      : { ...combatant, opening: [...(combatant.opening ?? []), ...tier.opening] };

  const overrides = tier.skills ?? [];
  if (overrides.length === 0) {
    return withOpening;
  }
  // Keyed by skill id so the merge is one pass over the kit rather than one pass per override, and
  // so a tier naming the same skill twice resolves to the last entry rather than to whichever the
  // loop happened to reach first.
  const byId = new Map(overrides.map((override) => [override.skillId, override]));
  const skills = withOpening.skills ?? [];
  if (!skills.some((skill) => byId.has(skill.id))) {
    return withOpening;
  }
  const rewritten: SkillData[] = skills.map((skill) => {
    const override = byId.get(skill.id);
    if (override === undefined) {
      return skill;
    }
    return {
      ...skill,
      ...(override.target === undefined ? {} : { target: override.target }),
      ...(override.cooldown === undefined ? {} : { cooldown: override.cooldown }),
      ...(override.condition === undefined ? {} : { condition: override.condition }),
      ...(override.effects === undefined ? {} : { effects: override.effects }),
    };
  });
  return { ...withOpening, skills: rewritten };
}

/**
 * Buys one level of a character's signature item.
 *
 * One level per call, and deliberately no "buy as many as I can afford" companion. `levelUp` has
 * one because gold, xp and essence are earned per character's worth of content and spending them
 * on one character costs nothing anybody else could have had. Emblems are shared across every
 * ascended-tier character a run owns, so spending them **is** the decision the resource exists to
 * create — and a control that resolves it greedily makes it for the player, on the currency where
 * that matters most.
 *
 * It is also the reason this is not `ascendAll`'s shape. That one is licensed by copies being
 * spendable on exactly one character, so no two characters compete and nothing is foregone. Here
 * everything competes.
 */
export function levelSignature(
  state: GameState,
  defId: string,
  tier: CharacterTier,
  item: SignatureItemData | undefined,
  rules: SignatureRulesData,
): SignatureResult {
  const index = state.roster.findIndex((entry) => entry.defId === defId);
  if (index < 0) {
    return fail('unknown-character');
  }
  const owned = state.roster[index];
  if (item === undefined) {
    return fail('no-item');
  }
  if (!signatureUnlocked(rules, tier, owned.rarity)) {
    return fail('locked');
  }

  const current = clampSignatureLevel(rules, owned.signature);
  if (current >= maxSignatureLevel(rules)) {
    return fail('maxed');
  }

  const cost = { emblem: num(signatureCost(rules, current + 1)) };
  if (!canAfford(state.wallet, cost)) {
    return fail('insufficient');
  }

  const roster = [...state.roster];
  roster[index] = { ...owned, signature: current + 1 } satisfies OwnedCharacter;
  return { ok: true, state: { ...state, wallet: debit(state.wallet, cost), roster } };
}

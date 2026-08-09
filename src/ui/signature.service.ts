import { computed, inject, Service } from '@angular/core';
import {
  clampSignatureLevel,
  findOwned,
  GEAR_STATS,
  type GearBonus,
  type GearStat,
  levelSignature,
  maxSignatureLevel,
  nextSignatureTierAt,
  type Numeric,
  num,
  rarityLabel,
  rarityIndex,
  type SignatureAbilityTierData,
  signatureBonus,
  signatureCost,
  type SignatureFailure,
  type SignatureItemData,
  type SignatureResult,
  signatureTier,
  signatureTierIndex,
  signatureUnlocked,
  ZERO,
} from '../core';
import { CHARACTERS_BY_ID, SIGNATURE, SIGNATURE_BY_DEF } from './content';
import { GameLoopService } from './game-loop.service';

/**
 * The signature item panel's read model, and the one action it offers.
 *
 * A service of its own rather than more surface on `RosterService`, for the reason `GearService` is
 * one: the roster is **who you own and what they are worth**, and this is a single progression
 * track with its own currency, its own gate and its own vocabulary. It is also the seam that keeps
 * the panel liftable — the character sheet is where it is drawn today, and nothing here knows that.
 *
 * ## Everything is resolved here rather than in the template
 *
 * Same reason `RosterEntryView` exists. Working out whether a character is eligible, what the next
 * level costs, which ability rung is live and what the next one gives is several reads of content
 * plus a wallet comparison, and a template binding would run all of them on every
 * change-detection pass.
 */

/** One stat a signature item moves, as whole percentage points. */
export interface SignatureBonusView {
  readonly stat: GearStat;
  readonly label: string;
  readonly percent: number;
}

/** An ability rung, resolved for display. */
export interface SignatureTierView {
  readonly name: string;
  readonly description: string;
  /** The level this rung arrives at, which is what the sheet counts toward. */
  readonly at: number;
}

/**
 * Everything the panel draws, for one character.
 *
 * ⚠️ **`null` from {@link SignatureService.view} means "draw nothing at all", and it is the common
 * case** — forty-two of the forty-nine characters have no signature item and never will. That is
 * deliberately different from {@link locked}, which means "this character will have one and does
 * not yet": a locked panel is a destination and an absent one is not content this character is
 * short of.
 */
export interface SignatureView {
  readonly defId: string;
  readonly characterName: string;
  readonly item: SignatureItemData;
  /** `true` until the character reaches the unlock rung. Level 0. */
  readonly locked: boolean;
  /** The rarity that unlocks it, named — what a locked panel promises. */
  readonly unlocksAt: string;
  readonly level: number;
  readonly maxLevel: number;
  readonly atMax: boolean;
  /** What the item is worth right now. Empty while locked. */
  readonly bonuses: readonly SignatureBonusView[];
  /** What it would be worth at the next level, for the panel to show what a purchase buys. */
  readonly nextBonuses: readonly SignatureBonusView[];
  /** The ability rung in force, or `null` while locked. */
  readonly tier: SignatureTierView | null;
  /** The rung after this one, or `null` at the top. */
  readonly nextTier: SignatureTierView | null;
  /** Emblems for the next level, or `null` at the top. */
  readonly cost: number | null;
  /** Emblems the run holds. */
  readonly held: Numeric;
  /** `true` when the next level is affordable — which is the whole of what enables the button. */
  readonly canBuy: boolean;
}

const STAT_LABELS: Readonly<Record<GearStat, string>> = {
  hp: 'Health',
  atk: 'Attack',
  def: 'Defence',
  haste: 'Haste',
};

/**
 * Bonuses as whole percentage points, in a fixed order, dropping anything that rounds to nothing.
 *
 * The same shape and the same two decisions as `toBonusViews` in `gear.service.ts`: a fixed order
 * so rows do not move between two readings, and no zero row because "+0% defence" reads as a bug.
 */
function toBonusViews(bonus: GearBonus): readonly SignatureBonusView[] {
  const views: SignatureBonusView[] = [];
  for (const stat of GEAR_STATS) {
    const percent = Math.round((bonus[stat] ?? 0) * 100);
    if (percent > 0) {
      views.push({ stat, label: STAT_LABELS[stat], percent });
    }
  }
  return views;
}

/** An authored rung paired with the level it arrives at. */
function toTierView(
  tier: SignatureAbilityTierData | undefined,
  at: number,
): SignatureTierView | null {
  return tier === undefined ? null : { name: tier.name, description: tier.description, at };
}

@Service()
export class SignatureService {
  private readonly game = inject(GameLoopService);

  /** Emblems the run holds, for any screen that wants to show the balance beside a price. */
  readonly held = computed<Numeric>(() => this.game.snapshot()?.wallet.emblem ?? ZERO);

  /**
   * The panel for one character, or `null` when there is nothing to draw.
   *
   * Not a `computed` because it is keyed by an argument, and a memo per character would be a cache
   * to invalidate. The work is a handful of content reads; recomputing is cheaper than remembering.
   */
  view(defId: string): SignatureView | null {
    const state = this.game.snapshot();
    const character = CHARACTERS_BY_ID.get(defId);
    const item = SIGNATURE_BY_DEF.get(defId);
    if (state === null || character === undefined || item === undefined) {
      return null;
    }
    const owned = findOwned(state, defId);
    if (owned === undefined) {
      return null;
    }

    // ⚠️ Checked rather than assumed from the item existing. An item is authored per character and
    // eligibility is a question about the *rung* as well as the tier, so a character can hold an
    // authored item and still have nothing unlocked — which is exactly the state the panel is most
    // useful in, because it names the destination.
    const unlocked = signatureUnlocked(SIGNATURE, character.tier, owned.rarity);
    const level = unlocked ? clampSignatureLevel(SIGNATURE, owned.signature) : 0;
    const max = maxSignatureLevel(SIGNATURE);
    const atMax = level >= max;
    const cost = atMax ? null : signatureCost(SIGNATURE, level + 1);
    const held = state.wallet.emblem;

    const nextAt = nextSignatureTierAt(SIGNATURE, item, level);
    const nextIndex = signatureTierIndex(SIGNATURE, nextAt ?? level);

    return {
      defId,
      characterName: character.name,
      item,
      locked: level <= 0,
      unlocksAt: rarityLabel(rarityIndex(SIGNATURE.unlockRarity)),
      level,
      maxLevel: max,
      atMax,
      bonuses: toBonusViews(signatureBonus(SIGNATURE, item, level)),
      // What the *next* level is worth in total, not what it adds — a panel showing "+5%" beside a
      // price cannot be compared against anything, and the same panel showing the new total can.
      nextBonuses: atMax ? [] : toBonusViews(signatureBonus(SIGNATURE, item, level + 1)),
      tier: toTierView(
        signatureTier(SIGNATURE, item, level),
        Math.max(signatureTierIndex(SIGNATURE, level) * SIGNATURE.tierEvery, 1),
      ),
      nextTier: nextAt === undefined ? null : toTierView(item.tiers[nextIndex], nextAt),
      cost,
      held,
      canBuy: cost !== null && held.gte(num(cost)),
    };
  }

  /**
   * Buys one level of a character's signature item.
   *
   * ⚠️ **One level per call, and deliberately no "buy as far as I can afford" companion.**
   * Levelling has one because gold, xp and essence are earned per character's worth of content, so
   * spending them on one costs nothing anybody else could have had. Emblems are shared across every
   * ascended-tier character a run owns, so spending them **is** the decision the currency exists to
   * create — and a control that resolved it greedily would make it for the player, on the one
   * currency where that matters. It is also not `ascendAll`, which is licensed precisely because
   * copies are spendable on one character and nothing competes.
   */
  levelUp(defId: string): SignatureResult {
    const state = this.game.current;
    if (state === null) {
      return { ok: false, reason: 'unknown-character' };
    }
    const character = CHARACTERS_BY_ID.get(defId);
    if (character === undefined) {
      return { ok: false, reason: 'unknown-character' };
    }
    const result = levelSignature(
      state,
      defId,
      character.tier,
      SIGNATURE_BY_DEF.get(defId),
      SIGNATURE,
    );
    if (result.ok) {
      this.game.apply(() => result.state);
      void this.game.persist();
    }
    return result;
  }
}

/** Why a signature purchase was refused, in words a player can act on. */
export const SIGNATURE_FAILURES: Readonly<Record<SignatureFailure, string>> = {
  'unknown-character': 'That character is not in this build.',
  'no-item': 'This character has no signature item.',
  locked: 'This character has not reached the rung that unlocks it.',
  maxed: 'This signature item is already at its highest level.',
  insufficient: 'Not enough emblems for the next level.',
};

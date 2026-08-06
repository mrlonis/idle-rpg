import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  type CharacterTier,
  type PullFailure,
  rarityFamily,
  rarityLabel,
  startRarityIndex,
} from '../core';
import { MULTI_PULL_COUNT, PITY, TIER_WEIGHTS } from '../data';
import { formatNumeric } from './format-numeric';
import { GachaService } from './gacha.service';
import { GameLoopService } from './game-loop.service';

/** The tiers as the rates table lists them: the rarest first, because that is what pity buys. */
const TIERS: readonly CharacterTier[] = ['ascended', 'legendary', 'common'];

/** Tier names as prose. The bare id is the class suffix; this is what a player reads. */
const TIER_NAMES: Readonly<Record<CharacterTier, string>> = {
  ascended: 'Ascended tier',
  legendary: 'Legendary tier',
  common: 'Common tier',
};

/** Why a pull could not be made, in words a player can act on. */
const FAILURE_MESSAGES: Readonly<Record<PullFailure, string>> = {
  'insufficient-currency': 'Not enough summon crystals yet. They accrue while you are away.',
  'empty-pool': 'This banner has no characters in it.',
  'unknown-banner': 'That banner is no longer available.',
  'bad-count': 'That is not a number of pulls.',
};

/**
 * The summon screen.
 *
 * ## The pity counters are the point of this screen, not a footnote
 *
 * The live rate, the pulls since the last ascended-tier character, and the exact pull the
 * guarantee fires on are all on screen, all the time, before the player commits to anything. A
 * commercial gacha hides these because uncertainty is what it is selling; there is nothing to
 * sell here, so there is nothing to hide, and a player deciding whether to pull now or save
 * should be able to read the answer rather than infer it.
 *
 * **Both counters are shown, and only one gets a bar.** The legendary cycle is a third the length
 * of the ascended one and clears several times inside it, so a second bar of equal weight would
 * read as two competing goals rather than one goal and one floor beneath it. It gets a line of
 * text with the same two facts on it — the live rate and the pull the guarantee lands on — which
 * is the whole of what the bar communicates anyway.
 */
@Component({
  selector: 'app-summon-view',
  imports: [RouterLink],
  templateUrl: './summon-view.html',
  styleUrl: './summon-view.scss',
})
export class SummonView {
  private readonly game = inject(GameLoopService);
  private readonly gacha = inject(GachaService);

  protected readonly multiCount = MULTI_PULL_COUNT;
  protected readonly hardPity = PITY.ascended.hardPity;
  protected readonly legendaryHardPity = PITY.legendary.hardPity;

  protected readonly banner = this.gacha.banner;
  protected readonly results = this.gacha.lastResults;

  protected readonly crystals = computed(() => formatNumeric(this.game.summons()));
  protected readonly singleCost = computed(() => formatNumeric(this.gacha.singleCost()));
  protected readonly multiCost = computed(() => formatNumeric(this.gacha.multiCost()));

  protected readonly canPullSingle = this.gacha.canPullSingle;
  protected readonly canPullMulti = this.gacha.canPullMulti;

  protected readonly pity = this.gacha.pity;
  protected readonly pullsToGuarantee = this.gacha.pullsToGuarantee;
  protected readonly inSoftPity = this.gacha.inSoftPity;

  protected readonly legendaryPity = this.gacha.legendaryPity;
  protected readonly pullsToLegendary = this.gacha.pullsToLegendary;

  /** The live rates, as percentage strings. Read from the same functions the draw uses. */
  protected readonly currentChance = computed(() => formatPercent(this.gacha.currentChance()));
  protected readonly currentLegendaryChance = computed(() =>
    formatPercent(this.gacha.currentLegendaryChance()),
  );
  protected readonly baseChance = formatPercent(TIER_WEIGHTS.ascended);

  /** How far along the pity cycle the player is, for the progress bar. */
  protected readonly pityFraction = computed(() =>
    Math.min(this.pity() / Math.max(this.hardPity, 1), 1),
  );

  protected readonly shortfall = computed(() => {
    const missing = this.gacha.shortOfMulti();
    return missing === null ? null : formatNumeric(missing);
  });

  protected readonly failureMessage = computed(() => {
    const failure = this.gacha.failure();
    return failure === null ? null : FAILURE_MESSAGES[failure];
  });

  /** The authored pre-pity odds, for the rates table. */
  /**
   * The three tiers and what each one is worth, best first.
   *
   * Where a tier lands on the ladder is read off `startRarityIndex` rather than written out as
   * a caption. An ascended-tier character skipping the bottom two rungs is a `core/` decision
   * and most of what the tier is worth — a hand-typed "Starts at Elite" would keep saying so
   * after a retune moved it.
   */
  protected readonly rateRows = TIERS.map((tier) => {
    const startsAt = startRarityIndex(tier);
    return {
      tier,
      name: TIER_NAMES[tier],
      chance: formatPercent(TIER_WEIGHTS[tier]),
      startsAt: rarityLabel(startsAt),
      startsAtFamily: rarityFamily(startsAt),
    };
  });

  protected pullOnce(): void {
    this.gacha.pullOnce();
  }

  protected pullMulti(): void {
    this.gacha.pullMulti();
  }

  protected dismiss(): void {
    this.gacha.clearResults();
  }
}

/** A 0–1 probability as a percentage, trimmed so `2.50%` reads as `2.5%`. */
function formatPercent(value: number): string {
  const percent = Math.max(Math.min(value, 1), 0) * 100;
  const text = percent >= 10 ? percent.toFixed(1) : percent.toFixed(2);
  return `${text.replace(/\.?0+$/, '')}%`;
}

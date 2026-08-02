import { computed, inject, Service, signal } from '@angular/core';
import {
  ascendedChance,
  type BannerData,
  num,
  pull,
  type PullFailure,
  type PullResult,
  type RarityFamily,
  rarityFamily,
  rarityLabel,
} from '../core';
import { DEFAULT_BANNER_ID, MULTI_PULL_COUNT, PITY } from '../data';
import { ASCENSION, BANNERS_BY_ID, CHARACTERS_BY_ID, FACTIONS_BY_ID, GACHA_RULES } from './content';
import { GameLoopService } from './game-loop.service';

/** One pull, as the results panel shows it. */
export interface PullResultView extends PullResult {
  readonly rarityLabel: string;
  /** Which of the five colour families this rung belongs to. */
  readonly rarityFamily: RarityFamily;
  /** `true` for an ascended-tier result — the thing pity is pointed at. */
  readonly isTop: boolean;
}

/**
 * Summoning.
 *
 * Thin on purpose: `core/gacha/pull.ts` decides everything, and this holds the banner
 * selection, the last batch of results for the reveal panel, and the failure reason. The rate
 * shown on screen is read straight from the same function the draw uses, so what the player is
 * told and what actually happens cannot drift apart.
 */
@Service()
export class GachaService {
  private readonly game = inject(GameLoopService);

  /** Which banner is on screen. One exists today; the selection is here for when more do. */
  readonly bannerId = signal<string>(DEFAULT_BANNER_ID);

  /** The most recent batch of results, for the reveal panel. Cleared on dismissal. */
  readonly lastResults = signal<readonly PullResultView[]>([]);

  /** Why the last attempt failed, or `null`. */
  readonly failure = signal<PullFailure | null>(null);

  readonly banner = computed<BannerData | null>(() => BANNERS_BY_ID.get(this.bannerId()) ?? null);

  /** Pulls made since the last ascended-tier character. Always visible, never hidden. */
  readonly pity = computed(() => this.game.pity());

  /** The live chance of an ascended-tier result on the very next pull. */
  readonly currentChance = computed(() => ascendedChance(GACHA_RULES, this.pity() + 1));

  /** Pulls remaining until the guarantee fires. */
  readonly pullsToGuarantee = computed(() => Math.max(PITY.hardPity - this.pity(), 0));

  /** `true` once soft pity has started raising the rate above its base. */
  readonly inSoftPity = computed(() => this.pity() >= PITY.softPityStart);

  readonly singleCost = computed(() => num(GACHA_RULES.pullCost));
  readonly multiCost = computed(() => num(GACHA_RULES.pullCost * MULTI_PULL_COUNT));

  readonly canPullSingle = computed(() => this.game.summons().gte(this.singleCost()));
  readonly canPullMulti = computed(() => this.game.summons().gte(this.multiCost()));

  /** How many crystals short the player is of a ten-pull, for a "nearly there" hint. */
  readonly shortOfMulti = computed(() => {
    const missing = this.multiCost().sub(this.game.summons());
    return missing.gt(0) ? missing : null;
  });

  pullOnce(): void {
    this.draw(1);
  }

  pullMulti(): void {
    this.draw(MULTI_PULL_COUNT);
  }

  /** Dismisses the reveal panel. */
  clearResults(): void {
    this.lastResults.set([]);
    this.failure.set(null);
  }

  /**
   * Resolves `count` pulls and publishes the results.
   *
   * The whole batch resolves synchronously against the authoritative run, exactly as a battle
   * does. The reveal is presentation played over a result that already exists — which is why a
   * player who closes the app mid-reveal still keeps everything they pulled, unlike a battle
   * abandoned mid-animation.
   */
  private draw(count: number): void {
    const banner = this.banner();
    if (banner === null) {
      this.failure.set('unknown-banner');
      return;
    }

    const state = this.game.current;
    if (state === null) {
      return;
    }

    const outcome = pull(
      state,
      banner,
      count,
      GACHA_RULES,
      ASCENSION,
      CHARACTERS_BY_ID,
      FACTIONS_BY_ID,
    );
    if (!outcome.ok) {
      this.failure.set(outcome.reason);
      this.lastResults.set([]);
      return;
    }

    this.failure.set(null);
    this.game.apply(() => outcome.state);
    this.lastResults.set(
      outcome.results.map((result) => ({
        ...result,
        rarityLabel: rarityLabel(result.rarity),
        rarityFamily: rarityFamily(result.rarity),
        isTop: result.tier === 'ascended',
      })),
    );
  }
}

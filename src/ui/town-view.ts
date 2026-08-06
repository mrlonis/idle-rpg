import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';

/** One destination in town. */
interface Place {
  /** Where the card goes. A child of `/town`, which is what keeps the tab lit inside it. */
  readonly path: string;
  /** What the card calls it, and what a screen reader announces first. */
  readonly name: string;
  /**
   * Decorative only — the card is also named in text, so this is `aria-hidden`.
   *
   * It is deliberately the **same glyph the destination carried in the tab bar**. A player who
   * learned to find summoning by its crystal ball should find the same crystal ball here rather
   * than having to learn the screen again. The gear shop keeps that promise too: the toolbox came
   * here with it, and the tab it left behind took a new glyph for what it now is.
   */
  readonly icon: string;
  /** What the destination is for, in a line. */
  readonly description: string;
  /** What the player currently holds of the currency the destination spends. */
  readonly amount: string;
  /** What that currency is called. */
  readonly unit: string;
}

/**
 * Town: the hub the currency sinks live behind.
 *
 * Summoning and the spark shop each had a tab of their own, which is one tab per screen and does
 * not scale — the bar holds six, and both of these are places a player visits *deliberately*
 * rather than screens they live on. Folding them behind one entry buys back a slot and gives the
 * next sink somewhere to land that costs no navigation at all.
 *
 * **The gear shop is the first sink to land here rather than take a tab**, which is what the hub
 * was built for. It arrived attached to the gear tab, above the bag; the tab became the Bag, an
 * inventory rather than a system, and the shop came here to sit beside the other two places a
 * currency gets spent.
 *
 * **The balance is on the card because the trip is the cost.** A player who taps through to the
 * spark shop to find they have no spark has spent two navigations to learn a number, and spark in
 * particular is zero for most of a run. Showing what each place spends is the same argument the
 * summon screen makes for putting pity on screen before the pull: the information that decides
 * whether to go should be readable before going.
 *
 * The cards are **links, not buttons**. They change where the player is, and a link is what
 * survives a long-press, a middle click and a screen reader's list-of-links.
 */
@Component({
  selector: 'app-town-view',
  imports: [RouterLink],
  templateUrl: './town-view.html',
  styleUrl: './town-view.scss',
})
export class TownView {
  private readonly game = inject(GameLoopService);

  /**
   * The places, rebuilt whenever a balance moves.
   *
   * Deliberately not an `aria-live` region — these track the wallet at roughly 6Hz, and a screen
   * reader told about every crystal would be announcing rather than usable. Each amount is named
   * by the card it sits on, so it stays readable on demand without being shouted continuously.
   *
   * Ordered by what a run reaches for soonest: crystals arrive from the first clear, gold shortly
   * after, and spark only from a duplicate of an `Ascended★5` — which is most of a run away.
   */
  protected readonly places = computed<readonly Place[]>(() => [
    {
      path: '/town/summon',
      name: 'Summon',
      icon: '🔮',
      description: 'Pull for new characters. Pity is global and always on screen.',
      amount: formatNumeric(this.game.summons()),
      unit: 'crystals',
    },
    {
      path: '/town/gear-shop',
      name: 'Gear Shop',
      icon: '🧰',
      description: 'Six pieces, restocked on the hour. Buy the slot you keep missing.',
      amount: formatNumeric(this.game.gold()),
      unit: 'gold',
    },
    {
      path: '/town/shop',
      name: 'Spark Shop',
      icon: '✨',
      description: 'Spend spark on exactly the character you are short of.',
      amount: formatNumeric(this.game.spark()),
      unit: 'spark',
    },
  ]);
}

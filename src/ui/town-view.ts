import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AchievementsService } from './achievements.service';
import { BountiesService } from './bounties.service';
import { formatNumeric } from './format-numeric';
import { GameLoopService } from './game-loop.service';
import { QuestsService } from './quests.service';
import { RosterService } from './roster.service';

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
  /**
   * What the player is holding, in whatever unit decides whether the trip is worth taking.
   *
   * A wallet balance for the three shops. **Not always a currency**: the Altar spends copies,
   * which are held per character rather than in the wallet, so there is no single balance to
   * quote — what it shows instead is how many characters could ascend right now, which is the
   * same question a balance answers on the other cards.
   */
  readonly amount: string;
  /** What that quantity is called. */
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
 * **The Altar is the first place here that is not a shop**, which is what settles what Town is: a
 * hub for anything a player goes to *do* rather than a row of storefronts. Ascension used to be a
 * button on every character sheet — see `altar-view.ts` for why one place beats twenty-three — and
 * it landed here rather than on the tab bar because the bar's spare slot is not for spending.
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
  private readonly roster = inject(RosterService);
  private readonly achievements = inject(AchievementsService);
  private readonly quests = inject(QuestsService);
  private readonly bounties = inject(BountiesService);

  /**
   * The places, rebuilt whenever a balance moves.
   *
   * Deliberately not an `aria-live` region — these track the wallet at roughly 6Hz, and a screen
   * reader told about every crystal would be announcing rather than usable. Each amount is named
   * by the card it sits on, so it stays readable on demand without being shouted continuously.
   *
   * Ordered by what a run reaches for soonest: crystals arrive from the first clear, the first
   * duplicate follows out of the same banner, the first achievement award lands five clears in,
   * gold shortly after, and spark only from a duplicate of an `Ascended★5` — which is most of a
   * run away.
   *
   * **Quests, the Bounty Board and Achievements all spend nothing**, like the Altar before them,
   * and all three quote a count of things waiting rather than a quantity of anything. Four of
   * seven cards now answer "what is here for me" rather than "what can I afford" — which settles
   * what Town is. The hub's test was always "somewhere you go deliberately, with something you
   * have earned"; a currency sink is one shape of that rather than the definition.
   *
   * ⚠️ **Seven cards is not a tab-bar problem and must not become one.** The bar's ceiling is what
   * makes a hub necessary; the hub itself has none, which is the whole reason each new sink lands
   * here. The bar is still Home · Town · Roster · Bag · Settings.
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
      path: '/town/altar',
      icon: '🕯️',
      name: 'Altar',
      description: 'Spend duplicate copies to climb the rarity ladder. Ascend one, or all at once.',
      amount: String(this.roster.readyToAscend()),
      unit: 'ready',
    },
    {
      path: '/town/quests',
      name: 'Quests',
      icon: '📜',
      description: 'Daily and weekly goals. Missing a day costs nothing.',
      amount: String(this.quests.claimable()),
      unit: 'ready',
    },
    {
      path: '/town/bounties',
      name: 'Bounty Board',
      icon: '🗺️',
      description: 'Send the bench on timed missions. Your party stays home.',
      amount: String(this.bounties.ready()),
      unit: 'back',
    },
    {
      path: '/town/achievements',
      name: 'Achievements',
      icon: '🏆',
      description: 'Crystals for progress already made. Nothing here expires.',
      amount: String(this.achievements.unclaimed()),
      unit: 'waiting',
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

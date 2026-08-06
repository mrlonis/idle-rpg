import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BattleView } from '../ui/battle-view';
import { BattleService } from '../ui/battle.service';
import { GameLoopService } from '../ui/game-loop.service';

/** One entry in the tab bar. */
interface Tab {
  readonly path: string;
  readonly label: string;
  /** Decorative only — every tab is also labelled in text, so this is `aria-hidden`. */
  readonly icon: string;
  /** Home matches exactly; everything else keeps its tab lit on child routes. */
  readonly exact: boolean;
}

/**
 * The application shell.
 *
 * Owns three things and nothing else: starting the run, the single `main` landmark, and whether
 * the player is in a battle or on a screen.
 *
 * ## Routes and one mode
 *
 * Home, town, roster, the bag and settings are **routes**, because each describes saved state and
 * survives a reload — `/roster/rin` is somewhere a player can come back to. The battle screen is
 * still a signal-swapped **mode**, because everything it shows (a resolved log, an animator
 * playhead) lives only in memory; a `/battle` URL could never be anything but a broken bookmark.
 *
 * The tab bar disappears during a fight. A battle has no exit until it ends — leaving early
 * would discard rewards the player is moments from collecting — so showing navigation that
 * refuses to work would be worse than showing none.
 */
@Component({
  selector: 'app-root',
  imports: [BattleView, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly game = inject(GameLoopService);
  private readonly battles = inject(BattleService);

  protected readonly isReady = this.game.isReady;
  protected readonly isBattleOpen = this.battles.isOpen;

  /**
   * The tab bar.
   *
   * Six is what fits across a small phone at a legible label size; a seventh has to either shrink
   * the text below where it can be read or drop it, and a bar of unlabelled glyphs is a puzzle
   * rather than navigation.
   *
   * **Five are used, and the spare slot is not for spending.** Summon and Shop gave it back by
   * moving behind Town, which is the "different shape of navigation" the milestone-13 note said
   * the next screen would need — a hub costs one tap and has no ceiling, and a tab has both a
   * ceiling and a queue behind it. A new sink belongs in Town. A seventh tab still is not the
   * answer, and now a sixth mostly is not either.
   *
   * Town takes Summon's old position deliberately: the destination behind it is the one a player
   * reaches for most, and muscle memory for where the bar's second entry sits outlives what it
   * was called.
   *
   * **The fourth tab is the Bag, and it is the one entry named for a category rather than a
   * screen.** It was Gear, which was the third progression axis wearing a tab; the forge half of
   * it went to Town with the other sinks, and what stayed is an inventory. Naming it for what it
   * holds is what stops the next item type from arguing for a sixth tab.
   */
  protected readonly tabs: readonly Tab[] = [
    { path: '/', label: 'Home', icon: '🏕', exact: true },
    { path: '/town', label: 'Town', icon: '🏘', exact: false },
    { path: '/roster', label: 'Roster', icon: '🛡', exact: false },
    { path: '/bag', label: 'Bag', icon: '🎒', exact: false },
    { path: '/settings', label: 'Settings', icon: '⚙', exact: false },
  ];

  ngOnInit(): void {
    // The clock lives here: core takes time as a parameter and never reads one itself.
    void this.game.start(Date.now());
  }
}

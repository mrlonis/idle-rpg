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
 * Home, summon, roster and shop are **routes**, because each describes saved state and survives
 * a reload — `/roster/rin` is somewhere a player can come back to. The battle screen is still a
 * signal-swapped **mode**, because everything it shows (a resolved log, an animator playhead)
 * lives only in memory; a `/battle` URL could never be anything but a broken bookmark.
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

  protected readonly tabs: readonly Tab[] = [
    { path: '/', label: 'Home', icon: '🏕', exact: true },
    { path: '/summon', label: 'Summon', icon: '🔮', exact: false },
    { path: '/roster', label: 'Roster', icon: '🛡', exact: false },
    { path: '/gear', label: 'Gear', icon: '🧰', exact: false },
    { path: '/shop', label: 'Shop', icon: '✨', exact: false },
  ];

  ngOnInit(): void {
    // The clock lives here: core takes time as a parameter and never reads one itself.
    void this.game.start(Date.now());
  }
}

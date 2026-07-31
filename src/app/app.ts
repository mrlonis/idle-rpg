import { Component, inject, OnInit } from '@angular/core';
import { BattleView } from '../ui/battle-view';
import { BattleService } from '../ui/battle.service';
import { GameLoopService } from '../ui/game-loop.service';
import { HomeView } from '../ui/home-view';

/**
 * The application shell.
 *
 * Owns three things and nothing else: starting the run, the single `main` landmark, and which
 * of the two screens is showing. Everything a screen displays belongs to that screen.
 *
 * The swap is a signal rather than a route. `app.routes.ts` stays empty deliberately — the
 * battle screen's entire content lives in memory and cannot survive a reload, so it is a mode
 * the player is in rather than a place they can link to. When a screen arrives that genuinely
 * deserves a URL, this is a small change to make.
 */
@Component({
  selector: 'app-root',
  imports: [BattleView, HomeView],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly game = inject(GameLoopService);
  private readonly battles = inject(BattleService);

  protected readonly isReady = this.game.isReady;
  protected readonly isBattleOpen = this.battles.isOpen;

  ngOnInit(): void {
    // The clock lives here: core takes time as a parameter and never reads one itself.
    void this.game.start(Date.now());
  }
}

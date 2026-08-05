import { Routes } from '@angular/router';

/**
 * The app's screens.
 *
 * Routing arrives with this milestone, and the trigger is exactly the one the design notes
 * named: a screen that genuinely **survives a reload**. Home, the summon banner, the roster and
 * a character sheet all describe saved state, so `/roster/rin` is a place a player can be, come
 * back to, and link to.
 *
 * The battle screen is still not a route, for the same reason it never was. Everything it shows
 * — the resolved log, the animator's playhead — lives in memory and cannot survive a reload, so
 * a `/battle` URL could only ever be a broken bookmark that needed a guard to redirect home.
 * `App` keeps swapping to it on a signal, which is what a mode is.
 *
 * Every route is lazily loaded. None of them is on the path to first paint — the run has to load
 * before there is anything to show — so bundling them into the initial download would cost
 * startup time on a mid-range phone to save a navigation that happens once.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../ui/home-view').then((m) => m.HomeView),
    title: 'Idle RPG',
  },
  {
    path: 'summon',
    loadComponent: () => import('../ui/summon-view').then((m) => m.SummonView),
    title: 'Summon — Idle RPG',
  },
  {
    path: 'roster',
    loadComponent: () => import('../ui/roster-view').then((m) => m.RosterView),
    title: 'Roster — Idle RPG',
  },
  {
    path: 'roster/:defId',
    loadComponent: () => import('../ui/character-view').then((m) => m.CharacterView),
    title: 'Character — Idle RPG',
  },
  {
    path: 'gear',
    loadComponent: () => import('../ui/gear-view').then((m) => m.GearView),
    title: 'Gear — Idle RPG',
  },
  {
    path: 'shop',
    loadComponent: () => import('../ui/shop-view').then((m) => m.ShopView),
    title: 'Spark Shop — Idle RPG',
  },
  // A stale or hand-typed URL lands home rather than on a blank screen.
  { path: '**', redirectTo: '' },
];

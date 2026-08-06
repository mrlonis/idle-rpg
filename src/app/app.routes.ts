import { Routes } from '@angular/router';

/**
 * The app's screens.
 *
 * Routing arrives with this milestone, and the trigger is exactly the one the design notes
 * named: a screen that genuinely **survives a reload**. Home, the summon banner, the roster and
 * a character sheet all describe saved state, so `/roster/rin` is a place a player can be, come
 * back to, and link to.
 *
 * **Every currency sink sits under `/town`, and the nesting is what makes the hub work.** The
 * tab bar lights a tab with a non-exact `routerLinkActive`, so a player standing in
 * `/town/summon` is still visibly in Town. Left at `/summon` the tab would go dark the moment the
 * player arrived somewhere it sent them, which reads as having navigated out of the app's
 * structure rather than into it. Nothing redirects the old flat paths — nor `/gear`, which is now
 * `/bag` with its shop half at `/town/gear-shop`: the game is pre-release, so no bookmark
 * carrying one exists.
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
    path: 'town',
    loadComponent: () => import('../ui/town-view').then((m) => m.TownView),
    title: 'Town — Idle RPG',
  },
  {
    path: 'town/summon',
    loadComponent: () => import('../ui/summon-view').then((m) => m.SummonView),
    title: 'Summon — Idle RPG',
  },
  {
    path: 'town/shop',
    loadComponent: () => import('../ui/shop-view').then((m) => m.ShopView),
    title: 'Spark Shop — Idle RPG',
  },
  {
    path: 'town/gear-shop',
    loadComponent: () => import('../ui/gear-shop-view').then((m) => m.GearShopView),
    title: 'Gear Shop — Idle RPG',
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
    path: 'bag',
    loadComponent: () => import('../ui/bag-view').then((m) => m.BagView),
    title: 'Bag — Idle RPG',
  },
  {
    path: 'settings',
    loadComponent: () => import('../ui/settings-view').then((m) => m.SettingsView),
    title: 'Settings — Idle RPG',
  },
  // A stale or hand-typed URL lands home rather than on a blank screen.
  { path: '**', redirectTo: '' },
];

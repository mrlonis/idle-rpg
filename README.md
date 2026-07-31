# Idle RPG

A 2D incremental idle RPG for mobile — gacha pulls, idle progression, team building, and
stage climbing. iOS-first, Android secondary. Solo dev project.

**Stack:** TypeScript, Angular 22 (zoneless), Angular Material, Capacitor 8. No backend.

The game is **completely free and fully offline**: no in-app purchases, no ads, no
accounts, no servers, no network calls. Balance is tuned as a _time economy_ rather than a
money economy — there is nothing to sell, so generosity is free. See [AGENTS.md](AGENTS.md)
for the full set of design constraints and engineering rules.

---

## Getting started

Requires the Node version pinned in [`.nvmrc`](.nvmrc) (v26.5.0) and npm 11+.

```bash
npm ci
```

Start the local development server:

```bash
npm start
```

Then open `http://localhost:4200/`. The app reloads automatically as you edit source files.
You should see a gold counter at zero and a Fight button: win the first stage and the counter
starts ticking. Refresh and the run resumes where it left off.

---

## Roadmap

Ordered so there is **always something playable**. Each step layers onto the previous
skeleton without changing its shape. [AGENTS.md](AGENTS.md) carries the full detail and the
design rationale for each.

| #   | Milestone                              | Status                                           |
| --- | -------------------------------------- | ------------------------------------------------ |
| 1   | Tick loop, one resource, save/load     | ✅ **Complete**                                  |
| 2   | Battle up a stage ladder               | ✅ **Complete** — introduced `data/`             |
| 3   | Gacha: seeded rolls, visible pity      | ⬜ Next                                          |
| 4   | Team composition affecting combat math | ⬜                                               |
| 5   | Offline catch-up on resume             | 🟡 Continuous done; segmented solver outstanding |
| 6   | Run on a physical iPhone               | ⬜                                               |
| 7   | Prestige layer, then content           | ⬜                                               |

**What milestone 1 shipped.** A gold counter that accrues at 10Hz, samples into the UI at
~6Hz, persists through `@capacitor/preferences`, and settles offline earnings in closed form
on resume. Underneath that: `Numeric` (a `break_infinity` wrapper so the backing numeric type
is a one-file swap), a seeded mulberry32 PRNG with O(1) resume and derived sub-streams ready
for combat, and a versioned save layer with a migration chain, fixtures, and repair that
clamps damage rather than throwing.

**What milestone 2 shipped.** A party of three that fights up an eight-stage ladder, one battle
at a time, whenever the player taps Fight. `simulateBattle(team, stage, seed)` resolves a whole
fight synchronously and headlessly into an event log, and the UI narrates that log afterwards at
1x, 2x or 4x. Combat is deliberately not driven by the render tick, which is what makes the speed
control a single multiplication in the animator rather than a second combat implementation — and
what will make offline resolution and skipping cheap when they arrive.

**Clearing a stage is what switches the idle game on.** A run starts at zero gold per second and
earns nothing while idle; the first clear takes it to 0.5/s and every stage after that is a
permanent raise, up to 16/s at the top of the ladder. The one-off gold for a clear is the smaller
half of the deal, tuned to roughly 40 seconds of the income it unlocks — the rate is the
progression, the lump is the bonus.

Nothing fights on its own. The two features "auto-battle" could mean — the party sparring
ambiently behind the idle screen, and an unlockable that re-enters stages until the party loses —
are both later work, and [AGENTS.md](AGENTS.md) records what each one implies.

Turn order is an ATB gauge (`gauge += spd` per tick, act at 1000) rather than fixed rounds, so
SPD buys turns instead of just going first. The loop jumps straight to the tick of the next
action instead of stepping tick by tick — the same closed-form instinct as offline resume, and
[`clock.spec.ts`](src/core/battle/clock.spec.ts) pins the jump against a brute-force per-tick
count. Damage is `atk² / (atk + def)`: strictly positive, so a battle always terminates, and
diminishing in DEF, so defence never becomes the only stat. Crits are the only RNG consumer, at
exactly one draw per attack, from a sub-stream derived via
`deriveSeed(seed, 'battle:<stageId>:<battleCount>')` — so replaying a battle is reproducible
and never shifts the gacha sequence.

Combat also drove the save layer's **first real migration**: v2 adds `stage` and `battleCount`,
and a pre-combat v1 save keeps its gold and RNG position and simply joins the ladder at stage 1.

**Milestone 5 is partly done.** The pieces that never needed combat are built and tested: the
fixed-rate closed form, the offline cap, the backwards-clock guard, and expected-value drop
accrual with a carried remainder. What is left is a drop source to feed `accrueDiscrete()`.

The segmented solver — for an away window in which the earning rate changes — is deliberately
still unbuilt. Because the player starts every battle, no stage is ever cleared while they are
away, so `goldPerSec` is constant across any offline window and the fixed-rate closed form is
exactly right. That changes the day an unattended auto-battle lands, and not before.

Deliberately deferred: native foreground/background handling (`@capacitor/app`), routing,
and Angular Material. All three are cheap to add later and add debugging surface now.

---

## Project layout

```
src/
  core/   Pure TypeScript. The entire game simulation. Runs headless in Node.
  data/   Content as plain data: characters, enemies, stages, upgrades, banners.
  ui/     Angular components and services that wrap core/.
scripts/  Repo tooling, run directly with tsx. See scripts/README.md.
tests/    Playwright end-to-end specs.
ios/      Committed Capacitor iOS project — source, not a build artifact.
android/  Committed Capacitor Android project — source, not a build artifact.
```

`data/` holds characters, enemies and stages as **plain data** — numbers and strings, never
`Numeric` instances, so every stat block is JSON-expressible and could be loaded from a file
without touching the simulation. Converting it into the types combat works in is
[`core/battle/content.ts`](src/core/battle/content.ts)'s job. `core/` holds the simulation and
`ui/` the Angular services and components that wrap it; `src/app/` is the bootstrap shell.

**The dependency rule is one-way.** `ui/` may import from `core/` and `data/`; never the
reverse. `core/` may not import Angular, Capacitor, `src/ui/*`, or any DOM API — it has to
run headless in Node. That constraint is what lets balance be tested by simulating thousands
of hours headlessly instead of playing them.

The boundary is enforced mechanically, not by convention. A `src/core/**/*.ts` block in
[`eslint.config.js`](eslint.config.js) fails the build on a restricted import (`@angular/*`,
`@capacitor/*`, `@ionic/*`, `ui/`, `data/`), a DOM global (`window`, `document`,
`localStorage`, `navigator`, `fetch`), or a call to `Math.random()`, `Date.now()` or
`new Date()`. Each rule carries a message explaining the alternative. Do not disable them.

ESLint flat config is additive, so `core/` files match both that block and the general
`**/*.ts` block and receive every rule from both — the boundary restrictions come **on top
of** the full TypeScript, Angular, import and Prettier rule set, not instead of it.

`core/` is pure and deterministic: it returns new state rather than mutating, draws from a
seeded mulberry32 PRNG whose seed and call count live in the save, and takes time as a
parameter because it has no clock.

`core/` specs run through the normal `npm run test:unit` alongside the Angular specs. Each
one carries a `// @vitest-environment node` docblock so it runs headless instead of under
the builder's jsdom default, and [`src/core/environment.spec.ts`](src/core/environment.spec.ts)
fails if that ever stops working. The lint rules above are the real enforcement; the Node
environment is defence in depth.

---

## Scripts

### Develop

| Command         | Description                                              |
| --------------- | -------------------------------------------------------- |
| `npm start`     | Dev server at `http://localhost:4200/` with hot reload.  |
| `npm run watch` | Rebuild to `dist/` on change, development configuration. |
| `npm run build` | Production build into `dist/idle-rpg/browser`.           |

### Test

| Command                      | Description                                        |
| ---------------------------- | -------------------------------------------------- |
| `npm test`                   | Everything: unit, e2e, then scripts. What CI runs. |
| `npm run test:unit`          | Unit tests — `core/` and Angular — with coverage.  |
| `npm run test:e2e`           | Playwright end-to-end tests from `tests/`.         |
| `npm run test:scripts`       | Vitest tests for `scripts/`.                       |
| `npm run playwright:install` | Install Playwright browsers and their system deps. |

Prefer scoping test runs to what you changed:

```bash
npm run test:unit -- --include src/app/app.spec.ts
```

### Lint and format

| Command                   | Description                        |
| ------------------------- | ---------------------------------- |
| `npm run lint`            | Angular + Playwright + scripts.    |
| `npm run lint:angular`    | `src/**/*.ts` and `src/**/*.html`. |
| `npm run lint:playwright` | `tests/`.                          |
| `npm run lint:scripts`    | `scripts/`.                        |
| `npm run lint:fix`        | All three with `--fix`.            |
| `npm run prettier`        | Format the repo.                   |
| `npm run prettier:test`   | Check formatting without writing.  |

Linting is required for every change set, not optional. Fix lint failures in code — do not
silence them with `eslint-disable`, at any level.

### Mobile

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `npm run ios`              | Build → `cap sync` → open Xcode.               |
| `npm run android`          | Build → `cap sync` → open Android Studio.      |
| `npm run cap:sync`         | Copy web assets and update native plugin deps. |
| `npm run cap:open:ios`     | Open the Xcode project only.                   |
| `npm run cap:open:android` | Open the Android Studio project only.          |

### Codegen and tooling

| Command                                 | Description                                           |
| --------------------------------------- | ----------------------------------------------------- |
| `npm run ng -- generate component X`    | Angular schematics (`npm run ng -- generate --help`). |
| `npm run cap -- <args>`                 | Any Capacitor CLI command.                            |
| `npm run sync:agent-instructions`       | Regenerate AI instruction files from `AGENTS.md`.     |
| `npm run sync:agent-instructions:check` | Verify they are in sync. Runs first in CI.            |

---

## Mobile builds

`ios/` and `android/` are **committed source**. Capacitor generated them once and never
regenerates them — edit them in place, do not delete and re-add. `dist/idle-rpg/browser` is
the `webDir` in [`capacitor.config.ts`](capacitor.config.ts), and the generated
`android/app/src/main/assets/public/` and `ios/App/App/public/` directories are outputs, not
source. Prefer `capacitor.config.ts` over per-platform Xcode or Android Studio settings
whenever the option exists in both.

Build order matters:

```bash
npm run build && npm run cap:sync
```

Syncing before building ships stale assets. `npm run ios` and `npm run android` do both
steps in the right order and then open the native IDE.

Two things that will bite you if ignored:

- The project has no explicit `browserslist` yet. One should be added and kept aligned with
  Capacitor 8's floors (iOS 15+, API 24+): Angular's default target can emit syntax old
  Android System WebView cannot parse, which fails at parse time and renders a blank screen
  with no visible error.
- Never ship a build with `server.url` set in `capacitor.config.ts`. It is dev-only and
  triggers App Store rejection under Guideline 4.2.

---

## Saves

Persistence goes through `@capacitor/preferences`. **Do not use `localStorage`** — on iOS,
WKWebView local storage lives in a cache-class container the OS can purge under storage
pressure, which loses player saves.

Every save carries a `version`. Bumping `SAVE_VERSION` without adding the matching migration
is a bug, migrations are pure `(old) => (new)` steps, and old migrations are never deleted.
Loading clamps and defaults on recoverable damage rather than throwing — a thrown error
costs the player their entire run.

The current version is **2**: v1 was the gold counter, and v2 added `stage` and `battleCount`
when combat landed. Every historical version keeps a fixture in
[`src/core/save/fixtures/`](src/core/save/fixtures/), and
[`fixtures.spec.ts`](src/core/save/fixtures.spec.ts) migrates all of them to current on every
run — that is the test that catches the migration written months ago and never exercised since.

---

## Contributing / AI assistants

[`AGENTS.md`](AGENTS.md) is the **single source of truth** for project conventions. The
tool-specific instruction files (`.claude/CLAUDE.md`, `.github/copilot-instructions.md`,
`.gemini/GEMINI.md`, `.junie/guidelines.md`, `.windsurf/rules/guidelines.md`,
`.cursor/rules/cursor.mdc`) are generated from it — never edit them by hand.

After editing `AGENTS.md`:

```bash
npm run sync:agent-instructions && npm run sync:agent-instructions:check
```

CI runs the check as its first step, so an un-synced `AGENTS.md` fails the build before lint
or tests run. See [`scripts/README.md`](scripts/README.md) for details.

Accessibility is a hard requirement: the UI must pass AXE checks and meet WCAG AA minimums,
including focus management, color contrast, and ARIA attributes.

---

## Additional resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Capacitor documentation](https://capacitorjs.com/docs)
- [Vitest](https://vitest.dev/) · [Playwright](https://playwright.dev/)

Generated with [Angular CLI](https://github.com/angular/angular-cli) version 22.0.8.

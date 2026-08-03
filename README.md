# Idle RPG

A 2D incremental idle RPG for mobile — gacha pulls, idle progression, team building, and
stage climbing. iOS-first, Android secondary. Solo dev project.

**Stack:** TypeScript, Angular 22 (zoneless), Capacitor 8. No backend, and no UI framework —
the screens are hand-written components over a shared palette.

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
You should see a gold counter at zero, your starting party of three, and a Fight button: win the
first stage and the counter starts ticking — along with a first-clear payout of summon crystals.
Spend those on the Summon tab, then level and ascend what you pull from the Roster. Refresh and
the run resumes where it left off.

---

## Roadmap

Ordered so there is **always something playable**: each step layers onto the previous skeleton
without changing its shape, from the tick loop and save layer through combat, the gacha and
formations, on to offline catch-up, a combat rework and chapters of content.

**[docs/milestones.md](docs/milestones.md)** is the single source of truth — the status of every
milestone, what each one shipped, and the design rationale behind each decision.

Alongside it, one reference per system: **[glossary](docs/glossary.md)** for the vocabulary (start
here if tier, rarity and faction are running together), **[attributes](docs/attributes.md)** for
the stat block, **[combat](docs/combat.md)** for how a battle resolves,
**[economy](docs/economy.md)** for currencies and curves, **[ascension](docs/ascension.md)** for
the rung ladders, and **[saves](docs/saves.md)** for persistence and migrations.

---

## Project layout

```
src/
  core/   Pure TypeScript. The entire game simulation. Runs headless in Node.
  data/   Content as plain data: characters, enemies, stages, upgrades, banners.
  ui/     Angular components and services that wrap core/.
docs/     Long-form project documentation. Roadmap, glossary, attributes, ascension.
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

### Signing an iOS build

`DEVELOPMENT_TEAM` is intentionally not in `project.pbxproj`. Before your first run on a
physical device:

```bash
cp ios/signing.example.xcconfig ios/signing.xcconfig   # then put your Team ID in it
```

That file is git-ignored, and `ios/debug.xcconfig` / `ios/release.xcconfig` pull it in with
`#include?` — the optional include, so the project still builds without it and Xcode just asks
for a team. Note that picking a team in Xcode's Signing & Capabilities tab writes
`DEVELOPMENT_TEAM` back into `project.pbxproj`; if that happens, move the value into
`signing.xcconfig` rather than committing it.

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

The current version is **3**: v1 was the gold counter, v2 added `stage` and `battleCount` when
combat landed, and v3 turned the single gold pair into a keyed wallet and rate table and added
the roster, the active party and the pity counter. Every historical version keeps a fixture in
[`src/core/save/fixtures/`](src/core/save/fixtures/), and
[`fixtures.spec.ts`](src/core/save/fixtures.spec.ts) migrates all of them to current on every
run — that is the test that catches the migration written months ago and never exercised since.

**A migration only does what it can see.** `core/` cannot import `data/`, so a migration cannot
know who the starter characters are or what a stage grants. Anything needing content belongs in
an idempotent load-time repair instead — `grantStarters` seeds a missing roster, and
`reconcileClearedStages` rebuilds the idle rates and first-clear bonuses a returning run had
already earned. Both run on **every** load rather than behind a version gate, and both only ever
raise, so a healthy save passes through untouched.
[`tests/save-recovery.spec.ts`](tests/save-recovery.spec.ts) covers the whole path from a v2 save
on disk to a working run.

### Clearing your save during development

There is deliberately **no reset button in the game yet** — a destructive, irreversible action
belongs behind a settings menu, and there is no settings menu. Until there is, clear the save by
hand.

The catch is that you cannot do it from a tab running the game. The app holds the authoritative
state in memory and writes it back on autosave and on `visibilitychange` — which fires as you
reload — so clearing storage from the app's own tab is immediately undone by the app itself.
Clearing browser site data has the same problem for the same reason.

Instead, get a console on the same origin with **no app running**. `public/favicon.ico` is served
as a static file, so it shares `localhost:4200`'s storage and boots no Angular:

1. Navigate to `http://localhost:4200/favicon.ico`
2. Open devtools there and run:

```js
localStorage.clear();
```

3. Navigate back to `http://localhost:4200/`

Nothing was alive to write the save back, so you get a genuinely fresh run.

The same trick is how you **edit** a save rather than delete it: read and write
`CapacitorStorage.save` from that favicon tab and the change sticks. (Capacitor's Preferences web
backend is `localStorage` under a `CapacitorStorage.` prefix.) Editing your own save is
explicitly fine — see the no-anti-cheat design constraint in [`AGENTS.md`](AGENTS.md) — it just
has to happen while the game is not running.

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
or tests run.

Links inside `AGENTS.md` are authored **relative to the repository root** — the copies live at
three different depths, and the sync script retargets every href for its destination and refuses
to write if one points at a missing path. See
[`scripts/README.md`](scripts/README.md#relative-links) for the details.

Accessibility is a hard requirement: the UI must pass AXE checks and meet WCAG AA minimums,
including focus management, color contrast, and ARIA attributes.

---

## Additional resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [Capacitor documentation](https://capacitorjs.com/docs)
- [Vitest](https://vitest.dev/) · [Playwright](https://playwright.dev/)

Generated with [Angular CLI](https://github.com/angular/angular-cli) version 22.0.8.

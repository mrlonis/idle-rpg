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

> **Note:** `data/` and `ui/` do not exist yet — game content and the Angular game UI land
> there as they are built. `core/` holds the simulation foundation: numbers, RNG, tick,
> offline resume, and the save/migration layer.

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

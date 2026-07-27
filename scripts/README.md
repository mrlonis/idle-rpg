# scripts/

Node.js tooling scripts for the repository. Each script is written in TypeScript and executed directly via [`tsx`](https://github.com/privatenumber/tsx) — no separate build step required.

Scripts are linted alongside the rest of the project (`npm run lint`) and tested with Vitest (`npm run test:scripts`).

---

## `sync-agent-instructions.ts`

Keeps AI coding-assistant instruction files in sync with the single source of truth: [`AGENTS.md`](../AGENTS.md) at the repository root.

Many AI tools load their context from tool-specific files in fixed locations (`.claude/CLAUDE.md`, `.github/copilot-instructions.md`, etc.). Maintaining identical content across all of them by hand is error-prone. This script automates that: edit `AGENTS.md` once, run the script, and every target file is updated.

### How it works

1. Reads `AGENTS.md` from the repository root.
2. Normalises trailing whitespace and line endings.
3. Writes the content to each selected target file, creating any missing parent directories automatically.
4. For the Cursor target (`.cursor/rules/cursor.mdc`) it prepends a YAML front-matter header that Cursor requires.
5. Each file preserves its own existing line-ending style (LF or CRLF) so cross-platform repositories stay clean.
6. In `--check` mode no files are written; the script exits with code `1` if any file is out of sync.

### Targets

| Short name | Output file                                               |
| ---------- | --------------------------------------------------------- |
| `claude`   | `.claude/CLAUDE.md`                                       |
| `gemini`   | `.gemini/GEMINI.md`                                       |
| `github`   | `.github/copilot-instructions.md`                         |
| `junie`    | `.junie/guidelines.md`                                    |
| `windsurf` | `.windsurf/rules/guidelines.md`                           |
| `cursor`   | `.cursor/rules/cursor.mdc` _(prepends YAML front-matter)_ |

### Usage

Run via the npm scripts defined in `package.json`:

```shell
# Sync all targets (default)
npm run sync:agent-instructions

# Sync specific targets only
npm run sync:agent-instructions -- --targets=claude,github

# Check whether all targets are up to date (exits 1 if any are outdated)
npm run sync:agent-instructions:check

# Check specific targets only
npm run sync:agent-instructions:check -- --targets=cursor
```

Or invoke directly with `tsx`:

```shell
npx tsx scripts/sync-agent-instructions.ts
npx tsx scripts/sync-agent-instructions.ts --targets=claude,gemini
npx tsx scripts/sync-agent-instructions.ts --check
npx tsx scripts/sync-agent-instructions.ts --check --targets=github
```

### Flags

| Flag                | Description                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `--targets=<names>` | Comma-separated list of target short names to process. Use `all` (or omit the flag entirely) to process every target. |
| `--check`           | Dry-run mode. Reports which files are outdated and exits with code `1` if any are found; writes nothing.              |

### Environment variables

| Variable     | Values                   | Default    | Description                                                                                                                                |
| ------------ | ------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `CURSOR_EOL` | `lf`, `crlf`, `preserve` | `preserve` | Forces a specific line-ending style for `.cursor/rules/cursor.mdc`. When `preserve`, the file's existing style is kept (LF for new files). |

### CI integration

The repository's CI workflow runs `npm run sync:agent-instructions:check` as its first step. Any PR where `AGENTS.md` was edited without re-syncing will fail immediately, before lint or tests run.

To keep things in sync locally, run both commands after editing `AGENTS.md`:

```shell
npm run sync:agent-instructions
npm run sync:agent-instructions:check
```

### Copying to another repository

The script has no dependencies on this project beyond Node.js built-ins and `tsx`. To reuse it elsewhere:

1. Copy `scripts/sync-agent-instructions.ts` (and optionally `scripts/sync-agent-instructions.spec.ts`) into the target repo's `scripts/` directory.
2. Ensure `tsx` is available (`npm install --save-dev tsx`).
3. Add the npm scripts to `package.json`:
   ```json
   "sync:agent-instructions": "tsx scripts/sync-agent-instructions.ts",
   "sync:agent-instructions:check": "tsx scripts/sync-agent-instructions.ts --check"
   ```
4. Create an `AGENTS.md` at the repository root with your instruction content.
5. Use `--targets` to opt out of any tools you don't use in that repo.

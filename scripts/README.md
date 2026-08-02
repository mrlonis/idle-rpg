# scripts/

Node.js tooling scripts for the repository. Each script is written in TypeScript and executed directly via [`tsx`](https://github.com/privatenumber/tsx) — no separate build step required.

Scripts are linted alongside the rest of the project (`npm run lint`) and tested with Vitest (`npm run test:scripts`).

---

## `sync-agent-instructions.ts`

Keeps AI coding-assistant instruction files in sync with the single source of truth: [`AGENTS.md`](../AGENTS.md) at the repository root.

Many AI tools load their context from tool-specific files in fixed locations (`.claude/CLAUDE.md`, `.github/copilot-instructions.md`, etc.). Maintaining identical content across all of them by hand is error-prone. This script automates that: edit `AGENTS.md` once, run the script, and every target file is updated.

### How it works

1. Reads `AGENTS.md` from the repository root.
2. Validates every repo-relative markdown link and exits with code `1` if any points at a path that does not exist — before writing anything.
3. Normalises trailing whitespace and line endings.
4. Rewrites each repo-relative link so it resolves from the target's own directory (see [Relative links](#relative-links)).
5. Writes the content to each selected target file, creating any missing parent directories automatically.
6. For the Cursor target (`.cursor/rules/cursor.mdc`) it prepends a YAML front-matter header that Cursor requires.
7. Each file preserves its own existing line-ending style (LF or CRLF) so cross-platform repositories stay clean.
8. In `--check` mode no files are written; the script exits with code `1` if any file is out of sync.

### Targets

| Short name | Output file                                               |
| ---------- | --------------------------------------------------------- |
| `claude`   | `.claude/CLAUDE.md`                                       |
| `gemini`   | `.gemini/GEMINI.md`                                       |
| `github`   | `.github/copilot-instructions.md`                         |
| `junie`    | `.junie/guidelines.md`                                    |
| `windsurf` | `.windsurf/rules/guidelines.md`                           |
| `cursor`   | `.cursor/rules/cursor.mdc` _(prepends YAML front-matter)_ |

### Relative links

The targets sit at three different depths, so a link that is correct in `AGENTS.md` is broken in every copy of it. **Author links relative to the repository root** — exactly as they resolve from `AGENTS.md` itself — and the script retargets each one per destination:

| Authored in `AGENTS.md` | `.claude/CLAUDE.md` (depth 1) | `.windsurf/rules/guidelines.md` (depth 2) |
| ----------------------- | ----------------------------- | ----------------------------------------- |
| `docs/milestones.md`    | `../docs/milestones.md`       | `../../docs/milestones.md`                |
| `src/core/battle/x.ts`  | `../src/core/battle/x.ts`     | `../../src/core/battle/x.ts`              |

Details worth knowing:

- **Left alone:** external URLs (`https:`, `mailto:` — any scheme), protocol-relative hrefs (`//host/x`), bare anchors (`#section`), and root-absolute paths (`/docs/x.md`).
- **Fragments survive:** `docs/milestones.md#status` becomes `../docs/milestones.md#status`.
- **Rejected:** any path that climbs out of the repository (`../outside.md`, `a/../../b`, or a percent-encoded spelling). Links are repo-relative by definition, so an escaping one is treated as broken and aborts the run — it is never resolved against the filesystem, and never silently clamped to the root.
- **Fenced code blocks are skipped**, so a path-like string inside a directory tree or shell snippet is never rewritten. Fence matching follows CommonMark: a closing fence uses the same character, is at least as long as the opening one, and carries no info string — so neither a tilde fence, a shorter fence, nor a ` ```ts ` line can close a block early.
- **Images and titles are handled:** `![alt](path)` keeps its bang, and `[text](path "Title")` keeps its title. Angle-bracketed hrefs (`[text](<path>)`) keep their wrapper.
- **Reference-style links are not supported.** `[text][ref]` with a separate `[ref]: path` definition is not matched and would not be rewritten — use inline links.

Because a typo propagates to six files at once, the script resolves every repo-relative link against the repository root before writing and aborts the whole run if one does not land inside it:

```text
AGENTS.md has 1 link(s) that do not resolve inside the repository:

  docs/nope.md

Links are authored relative to the repository root, and may not climb above it with "..". Nothing was written.
```

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

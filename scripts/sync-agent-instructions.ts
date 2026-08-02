#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const sourcePath = resolve(root, 'AGENTS.md');
const cursorHeader = ['---', 'context: true', 'priority: high', 'scope: project', '---'].join('\n');

interface TargetDef {
  path: string;
  isCursor?: boolean;
}

export const TARGETS: Record<string, TargetDef> = {
  claude: { path: '.claude/CLAUDE.md' },
  gemini: { path: '.gemini/GEMINI.md' },
  github: { path: '.github/copilot-instructions.md' },
  junie: { path: '.junie/guidelines.md' },
  windsurf: { path: '.windsurf/rules/guidelines.md' },
  cursor: { path: '.cursor/rules/cursor.mdc', isCursor: true },
};

export function parseTargets(argv: string[]): TargetDef[] {
  const flag = argv.find((arg) => arg.startsWith('--targets='));

  const names = flag ? flag.slice('--targets='.length).split(',').filter(Boolean) : ['all'];

  if (names.includes('all')) {
    return Object.values(TARGETS);
  }

  const unknown = names.filter((name) => !(name in TARGETS));

  if (unknown.length > 0) {
    console.error(
      `Unknown target(s): ${unknown.join(', ')}. Valid targets: all, ${Object.keys(TARGETS).join(', ')}`,
    );
    process.exit(1);
  }

  return names.map((name) => TARGETS[name]);
}

const options = {
  check: process.argv.includes('--check'),
  cursorEol: getCursorEol(),
  targets: parseTargets(process.argv),
};

function getCursorEol() {
  const raw = (process.env['CURSOR_EOL'] ?? 'preserve').toLowerCase();

  if (raw === 'lf') {
    return '\n';
  }

  if (raw === 'crlf') {
    return '\r\n';
  }

  return 'preserve';
}

export function detectEol(content: string): '\r\n' | '\n' {
  return content.includes('\r\n') ? '\r\n' : '\n';
}

export function normalizeEol(content: string, eol: string): string {
  return content.replace(/\r?\n/g, eol);
}

export function ensureTrailingNewline(content: string): string {
  return content.endsWith('\n') ? content : `${content}\n`;
}

/**
 * Inline markdown links and images: `[text](href)`, `![alt](href "title")`, `[text](<href>)`.
 * Reference-style links (`[text][ref]` plus a `[ref]: href` definition) are not matched — the
 * source has never used them, and adding one would silently skip rewriting.
 */
const LINK_PATTERN = /(!?)\[([^\]]*)\]\(\s*(<[^>]*>|[^()\s]+)((?:\s+(?:"[^"]*"|'[^']*'))?)\s*\)/g;

const FENCE_PATTERN = /^\s{0,3}(`{3,}|~{3,})/;

const ABSOLUTE_HREF_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Placeholders standing in for inline code spans while the link pattern runs. Written as
 * escapes rather than literals so this file stays plain ASCII — a raw NUL byte would make
 * it binary to `grep` and to diff tooling.
 */
const MASK_OPEN = '\u0000';
const MASK_CLOSE = '\u0001';

/** Index of a run of exactly `length` backticks at or after `from`, or -1. */
function findBacktickRun(line: string, from: number, length: number): number {
  let index = from;

  while (index < line.length) {
    if (line[index] !== '`') {
      index += 1;
      continue;
    }

    let end = index;

    while (end < line.length && line[end] === '`') {
      end += 1;
    }

    if (end - index === length) {
      return index;
    }

    index = end;
  }

  return -1;
}

/**
 * Replaces each inline code span with an inert placeholder.
 *
 * Masking rather than splitting is deliberate: link text routinely *contains* a code span
 * (`` [`AGENTS.md`](AGENTS.md) ``), so a splitter would tear the link in half and never match
 * it. A placeholder keeps the link intact while making a `[text](href)` that is *itself* inside
 * a code span invisible — that one is prose a renderer never linkifies, so neither do we.
 *
 * An unterminated run is treated as a stray literal backtick and the remainder stays prose.
 */
function maskCodeSpans(line: string): { masked: string; spans: string[] } {
  const spans: string[] = [];
  let masked = '';
  let index = 0;

  while (index < line.length) {
    const open = line.indexOf('`', index);

    if (open === -1) {
      masked += line.slice(index);
      break;
    }

    let runEnd = open;

    while (runEnd < line.length && line[runEnd] === '`') {
      runEnd += 1;
    }

    const length = runEnd - open;
    const close = findBacktickRun(line, runEnd, length);

    if (close === -1) {
      masked += line.slice(index);
      break;
    }

    masked += `${line.slice(index, open)}${MASK_OPEN}${spans.length}${MASK_CLOSE}`;
    spans.push(line.slice(open, close + length));
    index = close + length;
  }

  return { masked, spans };
}

function unmaskCodeSpans(masked: string, spans: string[]): string {
  return masked.replace(
    new RegExp(`${MASK_OPEN}(\\d+)${MASK_CLOSE}`, 'g'),
    (_match, index: string) => spans[Number(index)],
  );
}

/**
 * Applies `transform` to every line outside a fenced code block, with inline code spans masked
 * out. `AGENTS.md` fences directory trees and shell snippets, and a path-like string inside one
 * is not a link to rewrite.
 */
function mapProseLines(content: string, transform: (line: string) => string): string {
  let fence: string | null = null;

  return content
    .split('\n')
    .map((line) => {
      const match = FENCE_PATTERN.exec(line);

      if (match) {
        const marker = match[1];

        if (fence === null) {
          fence = marker[0];
          return line;
        }

        if (marker.startsWith(fence)) {
          fence = null;
        }

        return line;
      }

      if (fence !== null) {
        return line;
      }

      const { masked, spans } = maskCodeSpans(line);
      return unmaskCodeSpans(transform(masked), spans);
    })
    .join('\n');
}

/** Strips the optional `<...>` wrapper an inline href may carry. */
function unwrapHref(href: string): { value: string; wrapped: boolean } {
  return href.startsWith('<') && href.endsWith('>')
    ? { value: href.slice(1, -1), wrapped: true }
    : { value: href, wrapped: false };
}

/**
 * A repo-relative href is one this script can retarget. External URLs, protocol-relative
 * hrefs, bare `#anchors` and root-absolute paths are all left exactly as authored.
 */
export function splitHref(href: string): { path: string; fragment: string } | null {
  const { value } = unwrapHref(href);
  const hashIndex = value.indexOf('#');
  const path = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : value.slice(hashIndex);

  if (path === '' || path.startsWith('/') || ABSOLUTE_HREF_PATTERN.test(path)) {
    return null;
  }

  return { path, fragment };
}

/**
 * Rewrites a repo-relative href authored against the repository root so that it resolves from
 * `targetPath` instead. `AGENTS.md` lives at the root, so its links are already root-relative;
 * a copy at `.windsurf/rules/guidelines.md` needs the same target reached via `../../`.
 */
export function rewriteHref(href: string, targetPath: string): string {
  const parts = splitHref(href);

  if (!parts) {
    return href;
  }

  const fromDir = posix.resolve('/', posix.dirname(targetPath));
  const to = posix.resolve('/', parts.path);
  const relativePath = posix.relative(fromDir, to);

  if (relativePath === '') {
    return href;
  }

  const { wrapped } = unwrapHref(href);
  const rebuilt = `${relativePath}${parts.fragment}`;

  return wrapped ? `<${rebuilt}>` : rebuilt;
}

/** Retargets every repo-relative inline link in `content` for a copy living at `targetPath`. */
export function rewriteRelativeLinks(content: string, targetPath: string): string {
  return mapProseLines(content, (line) =>
    line.replace(LINK_PATTERN, (match, bang: string, text: string, href: string, title: string) => {
      const rewritten = rewriteHref(href, targetPath);
      return rewritten === href ? match : `${bang}[${text}](${rewritten}${title})`;
    }),
  );
}

/** Every distinct repo-relative path linked from `content`, in first-seen order. */
export function collectRelativePaths(content: string): string[] {
  const paths = new Set<string>();

  mapProseLines(content, (line) => {
    for (const match of line.matchAll(LINK_PATTERN)) {
      const parts = splitHref(match[3]);

      if (parts) {
        paths.add(parts.path);
      }
    }

    return line;
  });

  return [...paths];
}

/**
 * Repo-relative links are copied into six files at three different depths, so a typo here
 * becomes six broken links. Resolve each against the repository root before anything is
 * written.
 */
export function findBrokenLinks(content: string, rootDir: string): string[] {
  return collectRelativePaths(content).filter((path) => {
    let decoded: string;

    try {
      decoded = decodeURIComponent(path);
    } catch {
      decoded = path;
    }

    return !existsSync(resolve(rootDir, decoded));
  });
}

export function readExisting(filePath: string): {
  exists: boolean;
  content: string;
  eol: '\r\n' | '\n';
} {
  if (!existsSync(filePath)) {
    return { exists: false, content: '', eol: '\n' };
  }

  const content = readFileSync(filePath, 'utf8');
  return { exists: true, content, eol: detectEol(content) };
}

export function maybeWrite(
  filePath: string,
  nextContent: string,
): { changed: boolean; wrote: boolean } {
  const existing = readExisting(filePath);
  const changed = existing.content !== nextContent;

  if (options.check) {
    return { changed, wrote: false };
  }

  if (changed) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, nextContent, 'utf8');
  }

  return { changed, wrote: changed };
}

function main() {
  const sourceRaw = readFileSync(sourcePath, 'utf8');
  const sourceBody = ensureTrailingNewline(sourceRaw.trimEnd());
  const broken = findBrokenLinks(sourceBody, root);

  if (broken.length > 0) {
    console.error(`AGENTS.md links to ${broken.length} path(s) that do not exist:\n`);

    for (const path of broken) {
      console.error(`  ${path}`);
    }

    console.error('\nLinks are authored relative to the repository root. Nothing was written.');
    process.exit(1);
  }

  const results = [];

  for (const target of options.targets) {
    const targetPath = resolve(root, target.path);
    const existing = readExisting(targetPath);
    const retargeted = rewriteRelativeLinks(sourceBody, target.path);

    let content: string;

    if (target.isCursor) {
      const eol = options.cursorEol === 'preserve' ? existing.eol : options.cursorEol;
      content = normalizeEol(`${cursorHeader}\n\n${retargeted}`, eol);
    } else {
      content = normalizeEol(retargeted, existing.eol);
    }

    results.push({
      file: target.path,
      ...maybeWrite(targetPath, content),
    });
  }

  const changedCount = results.filter((result) => result.changed).length;

  for (const result of results) {
    const status = result.changed ? (options.check ? 'OUTDATED' : 'UPDATED') : 'UNCHANGED';
    console.log(`${status} ${result.file}`);
  }

  if (options.check && changedCount > 0) {
    console.error(
      `\n${changedCount} file(s) are out of sync. Run: npm run sync:agent-instructions`,
    );
    process.exit(1);
  }

  console.log(`\nDone. ${changedCount} file(s) ${options.check ? 'out of sync' : 'updated'}.`);
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

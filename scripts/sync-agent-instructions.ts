#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
  const results = [];

  for (const target of options.targets) {
    const targetPath = resolve(root, target.path);
    const existing = readExisting(targetPath);

    let content: string;

    if (target.isCursor) {
      const eol = options.cursorEol === 'preserve' ? existing.eol : options.cursorEol;
      content = normalizeEol(`${cursorHeader}\n\n${sourceBody}`, eol);
    } else {
      content = normalizeEol(sourceBody, existing.eol);
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

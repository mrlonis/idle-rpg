import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  TARGETS,
  collectRelativePaths,
  detectEol,
  ensureTrailingNewline,
  escapesRoot,
  findBrokenLinks,
  maybeWrite,
  normalizeEol,
  parseTargets,
  readExisting,
  rewriteHref,
  rewriteRelativeLinks,
  splitHref,
} from './sync-agent-instructions';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let tmpDir: string;

beforeAll(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'sync-agent-test-'));
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true });
});

describe('detectEol', () => {
  it('returns \\r\\n for Windows line endings', () => {
    expect(detectEol('line1\r\nline2')).toBe('\r\n');
  });

  it('returns \\n for Unix line endings', () => {
    expect(detectEol('line1\nline2')).toBe('\n');
  });

  it('returns \\n when no line endings are present', () => {
    expect(detectEol('no newlines')).toBe('\n');
  });

  it('returns \\n for empty string', () => {
    expect(detectEol('')).toBe('\n');
  });
});

describe('normalizeEol', () => {
  it('converts Windows to Unix line endings', () => {
    expect(normalizeEol('a\r\nb\r\n', '\n')).toBe('a\nb\n');
  });

  it('converts Unix to Windows line endings', () => {
    expect(normalizeEol('a\nb\n', '\r\n')).toBe('a\r\nb\r\n');
  });

  it('normalizes mixed line endings to Unix', () => {
    expect(normalizeEol('a\r\nb\nc', '\n')).toBe('a\nb\nc');
  });

  it('is a no-op when content already uses the target EOL', () => {
    expect(normalizeEol('a\nb\n', '\n')).toBe('a\nb\n');
  });
});

describe('ensureTrailingNewline', () => {
  it('appends a newline when absent', () => {
    expect(ensureTrailingNewline('content')).toBe('content\n');
  });

  it('is a no-op when a newline is already present', () => {
    expect(ensureTrailingNewline('content\n')).toBe('content\n');
  });

  it('preserves multiple trailing newlines', () => {
    expect(ensureTrailingNewline('content\n\n')).toBe('content\n\n');
  });
});

describe('readExisting', () => {
  it('returns exists:false with defaults when file does not exist', () => {
    expect(readExisting(join(tmpDir, 'nonexistent.txt'))).toEqual({
      exists: false,
      content: '',
      eol: '\n',
    });
  });

  it('reads content and detects Unix EOL', () => {
    const filePath = join(tmpDir, 'read-unix.txt');
    writeFileSync(filePath, 'hello\nworld\n', 'utf8');
    expect(readExisting(filePath)).toEqual({
      exists: true,
      content: 'hello\nworld\n',
      eol: '\n',
    });
  });

  it('reads content and detects Windows EOL', () => {
    const filePath = join(tmpDir, 'read-windows.txt');
    writeFileSync(filePath, 'hello\r\nworld\r\n', 'utf8');
    const result = readExisting(filePath);
    expect(result.eol).toBe('\r\n');
    expect(result.exists).toBe(true);
    expect(result.content).toBe('hello\r\nworld\r\n');
  });
});

describe('maybeWrite', () => {
  it('writes file and returns changed:true when content differs', () => {
    const filePath = join(tmpDir, 'write-changed.txt');
    writeFileSync(filePath, 'original', 'utf8');
    const result = maybeWrite(filePath, 'updated');
    expect(result).toEqual({ changed: true, wrote: true });
    expect(readFileSync(filePath, 'utf8')).toBe('updated');
  });

  it('skips write and returns changed:false when content is identical', () => {
    const filePath = join(tmpDir, 'write-unchanged.txt');
    writeFileSync(filePath, 'same', 'utf8');
    const result = maybeWrite(filePath, 'same');
    expect(result).toEqual({ changed: false, wrote: false });
  });

  it('creates the file when it does not yet exist', () => {
    const filePath = join(tmpDir, 'write-new.txt');
    const result = maybeWrite(filePath, 'brand new');
    expect(result).toEqual({ changed: true, wrote: true });
    expect(readFileSync(filePath, 'utf8')).toBe('brand new');
  });

  it('creates missing parent directories before writing', () => {
    const filePath = join(tmpDir, 'nested', 'deep', 'write-nested.txt');
    const result = maybeWrite(filePath, 'nested content');
    expect(result).toEqual({ changed: true, wrote: true });
    expect(readFileSync(filePath, 'utf8')).toBe('nested content');
  });
});

describe('splitHref', () => {
  it('splits a repo-relative path from its fragment', () => {
    expect(splitHref('docs/milestones.md#status')).toEqual({
      path: 'docs/milestones.md',
      fragment: '#status',
    });
  });

  it('reports an empty fragment when none is present', () => {
    expect(splitHref('docs/milestones.md')).toEqual({
      path: 'docs/milestones.md',
      fragment: '',
    });
  });

  it('returns null for an http(s) URL', () => {
    expect(splitHref('https://angular.dev/tools/cli')).toBeNull();
  });

  it('returns null for a non-http scheme', () => {
    expect(splitHref('mailto:someone@example.com')).toBeNull();
  });

  it('returns null for a protocol-relative URL', () => {
    expect(splitHref('//cdn.example.com/x.png')).toBeNull();
  });

  it('returns null for a bare anchor', () => {
    expect(splitHref('#milestones')).toBeNull();
  });

  it('returns null for a root-absolute path', () => {
    expect(splitHref('/docs/milestones.md')).toBeNull();
  });

  it('unwraps an angle-bracketed href', () => {
    expect(splitHref('<docs/milestones.md>')).toEqual({
      path: 'docs/milestones.md',
      fragment: '',
    });
  });
});

describe('escapesRoot', () => {
  it('is false for an ordinary repo-relative path', () => {
    expect(escapesRoot('docs/milestones.md')).toBe(false);
  });

  it('is false for a path that dips into a subdirectory and back', () => {
    expect(escapesRoot('docs/../src/core/offline.ts')).toBe(false);
  });

  it('is false for an explicitly current-directory path', () => {
    expect(escapesRoot('./docs/milestones.md')).toBe(false);
  });

  it('is true for a leading parent segment', () => {
    expect(escapesRoot('../outside.md')).toBe(true);
  });

  it('is true for a bare parent segment', () => {
    expect(escapesRoot('..')).toBe(true);
  });

  it('is true when nested parent segments climb past the root', () => {
    expect(escapesRoot('docs/../../outside.md')).toBe(true);
  });

  it('is true for a percent-encoded parent segment', () => {
    expect(escapesRoot('%2e%2e/outside.md')).toBe(true);
  });

  it('falls back to the raw path when percent-decoding fails', () => {
    expect(escapesRoot('../bad%zz.md')).toBe(true);
  });
});

describe('rewriteHref', () => {
  it('adds one level for a target nested one directory deep', () => {
    expect(rewriteHref('docs/milestones.md', '.claude/CLAUDE.md')).toBe('../docs/milestones.md');
  });

  it('adds two levels for a target nested two directories deep', () => {
    expect(rewriteHref('docs/milestones.md', '.windsurf/rules/guidelines.md')).toBe(
      '../../docs/milestones.md',
    );
  });

  it('preserves a fragment while retargeting the path', () => {
    expect(rewriteHref('docs/milestones.md#status', '.cursor/rules/cursor.mdc')).toBe(
      '../../docs/milestones.md#status',
    );
  });

  it('rewrites a deep source path', () => {
    expect(rewriteHref('src/core/battle/clock.spec.ts', '.junie/guidelines.md')).toBe(
      '../src/core/battle/clock.spec.ts',
    );
  });

  it('drops the shared prefix when the target sits in the linked directory', () => {
    expect(rewriteHref('.claude/settings.json', '.claude/CLAUDE.md')).toBe('settings.json');
  });

  it('is an exact no-op for a target at the repository root', () => {
    expect(rewriteHref('docs/milestones.md', 'AGENTS.md')).toBe('docs/milestones.md');
  });

  it('leaves an external URL untouched', () => {
    expect(rewriteHref('https://capacitorjs.com/docs', '.claude/CLAUDE.md')).toBe(
      'https://capacitorjs.com/docs',
    );
  });

  it('leaves a bare anchor untouched', () => {
    expect(rewriteHref('#milestones', '.claude/CLAUDE.md')).toBe('#milestones');
  });

  it('leaves an escaping path exactly as authored rather than clamping it to the root', () => {
    expect(rewriteHref('../outside.md', '.claude/CLAUDE.md')).toBe('../outside.md');
  });

  it('leaves a nested escaping path untouched', () => {
    expect(rewriteHref('docs/../../outside.md', '.windsurf/rules/guidelines.md')).toBe(
      'docs/../../outside.md',
    );
  });

  it('keeps the angle-bracket wrapper when rewriting', () => {
    expect(rewriteHref('<docs/milestones.md>', '.claude/CLAUDE.md')).toBe(
      '<../docs/milestones.md>',
    );
  });
});

describe('rewriteRelativeLinks', () => {
  it('rewrites a link in prose', () => {
    expect(
      rewriteRelativeLinks('See [the roadmap](docs/milestones.md).', '.claude/CLAUDE.md'),
    ).toBe('See [the roadmap](../docs/milestones.md).');
  });

  it('rewrites every link on a line', () => {
    expect(
      rewriteRelativeLinks('[a](docs/a.md) and [b](docs/b.md)', '.windsurf/rules/guidelines.md'),
    ).toBe('[a](../../docs/a.md) and [b](../../docs/b.md)');
  });

  it('preserves a link title', () => {
    expect(rewriteRelativeLinks('[a](docs/a.md "Roadmap")', '.claude/CLAUDE.md')).toBe(
      '[a](../docs/a.md "Roadmap")',
    );
  });

  it('rewrites an image href and keeps the leading bang', () => {
    expect(rewriteRelativeLinks('![diagram](docs/img.png)', '.claude/CLAUDE.md')).toBe(
      '![diagram](../docs/img.png)',
    );
  });

  it('preserves code-span link text', () => {
    expect(rewriteRelativeLinks('[`AGENTS.md`](AGENTS.md)', '.claude/CLAUDE.md')).toBe(
      '[`AGENTS.md`](../AGENTS.md)',
    );
  });

  it('leaves a link inside an inline code span alone', () => {
    const content = 'Author `[a](docs/a.md)`, not `[a](../docs/a.md)`.';
    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(content);
  });

  it('rewrites a real link on the same line as a code-span example', () => {
    expect(
      rewriteRelativeLinks('Write `[a](docs/a.md)` — see [b](docs/b.md).', '.claude/CLAUDE.md'),
    ).toBe('Write `[a](docs/a.md)` — see [b](../docs/b.md).');
  });

  it('handles a double-backtick span containing a backtick', () => {
    const content = 'Like `` [`x`](docs/x.md) `` here.';
    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(content);
  });

  it('treats an unterminated backtick as prose', () => {
    expect(rewriteRelativeLinks('stray ` and [a](docs/a.md)', '.claude/CLAUDE.md')).toBe(
      'stray ` and [a](../docs/a.md)',
    );
  });

  it('restores multiple code spans in order', () => {
    expect(rewriteRelativeLinks('`one` [x](docs/x.md) `two` `three`', '.claude/CLAUDE.md')).toBe(
      '`one` [x](../docs/x.md) `two` `three`',
    );
  });

  it('leaves links inside a fenced code block alone', () => {
    const content = [
      'Before [x](docs/x.md)',
      '```md',
      '[y](docs/y.md)',
      '```',
      'After [z](docs/z.md)',
    ].join('\n');

    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(
      [
        'Before [x](../docs/x.md)',
        '```md',
        '[y](docs/y.md)',
        '```',
        'After [z](../docs/z.md)',
      ].join('\n'),
    );
  });

  it('leaves links inside a tilde-fenced block alone', () => {
    const content = ['~~~', '[y](docs/y.md)', '~~~', '[z](docs/z.md)'].join('\n');

    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(
      ['~~~', '[y](docs/y.md)', '~~~', '[z](../docs/z.md)'].join('\n'),
    );
  });

  it('does not let a shorter fence close a longer one', () => {
    const content = ['````', '```', '[y](docs/y.md)', '````', '[z](docs/z.md)'].join('\n');

    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(
      ['````', '```', '[y](docs/y.md)', '````', '[z](../docs/z.md)'].join('\n'),
    );
  });

  it('lets a longer fence close a shorter one', () => {
    const content = ['```', '[y](docs/y.md)', '`````', '[z](docs/z.md)'].join('\n');

    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(
      ['```', '[y](docs/y.md)', '`````', '[z](../docs/z.md)'].join('\n'),
    );
  });

  it('does not let a fence carrying an info string close a block', () => {
    const content = [
      '```',
      '[y](docs/y.md)',
      '```ts',
      '[w](docs/w.md)',
      '```',
      '[z](docs/z.md)',
    ].join('\n');

    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(
      ['```', '[y](docs/y.md)', '```ts', '[w](docs/w.md)', '```', '[z](../docs/z.md)'].join('\n'),
    );
  });

  it('opens a block from a fence that carries an info string', () => {
    const content = ['```md', '[y](docs/y.md)', '```', '[z](docs/z.md)'].join('\n');

    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(
      ['```md', '[y](docs/y.md)', '```', '[z](../docs/z.md)'].join('\n'),
    );
  });

  it('does not let a tilde fence close a backtick fence', () => {
    const content = ['```', '~~~', '[y](docs/y.md)', '```', '[z](docs/z.md)'].join('\n');

    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(
      ['```', '~~~', '[y](docs/y.md)', '```', '[z](../docs/z.md)'].join('\n'),
    );
  });

  it('preserves line endings and content when nothing is rewritable', () => {
    const content = 'No links here.\nJust [external](https://example.com).\n';
    expect(rewriteRelativeLinks(content, '.claude/CLAUDE.md')).toBe(content);
  });
});

describe('collectRelativePaths', () => {
  it('collects repo-relative paths and ignores external ones', () => {
    const content = '[a](docs/a.md) [b](https://example.com) [c](docs/c.md#frag)';
    expect(collectRelativePaths(content)).toEqual(['docs/a.md', 'docs/c.md']);
  });

  it('deduplicates repeated paths', () => {
    expect(collectRelativePaths('[a](docs/a.md) [again](docs/a.md)')).toEqual(['docs/a.md']);
  });

  it('ignores paths inside fenced code blocks', () => {
    expect(collectRelativePaths(['```', '[y](docs/y.md)', '```'].join('\n'))).toEqual([]);
  });

  it('ignores paths inside inline code spans', () => {
    expect(collectRelativePaths('an example: `[a](docs/a.md)`')).toEqual([]);
  });
});

describe('findBrokenLinks', () => {
  it('returns nothing when every linked path exists', () => {
    writeFileSync(join(tmpDir, 'exists.md'), 'x', 'utf8');
    expect(findBrokenLinks('[a](exists.md)', tmpDir)).toEqual([]);
  });

  it('reports a path that does not exist', () => {
    expect(findBrokenLinks('[a](docs/missing.md)', tmpDir)).toEqual(['docs/missing.md']);
  });

  it('ignores external URLs and bare anchors', () => {
    expect(findBrokenLinks('[a](https://example.com) [b](#anchor)', tmpDir)).toEqual([]);
  });

  it('resolves a percent-encoded path before checking', () => {
    writeFileSync(join(tmpDir, 'a b.md'), 'x', 'utf8');
    expect(findBrokenLinks('[a](a%20b.md)', tmpDir)).toEqual([]);
  });

  it('reports a path that climbs out of the repository', () => {
    expect(findBrokenLinks('[a](../outside.md)', tmpDir)).toEqual(['../outside.md']);
  });

  it('reports an escaping path even when the file outside the root exists', () => {
    // The sibling genuinely exists on disk. It is still broken: links are repo-relative, and
    // resolving this one would stat a file outside the repository.
    const sibling = mkdtempSync(join(tmpdir(), 'sync-agent-outside-'));
    writeFileSync(join(sibling, 'outside.md'), 'x', 'utf8');

    try {
      const href = `../${basename(sibling)}/outside.md`;
      expect(findBrokenLinks(`[a](${href})`, tmpDir)).toEqual([href]);
    } finally {
      rmSync(sibling, { recursive: true });
    }
  });

  it('reports a percent-encoded escaping path', () => {
    expect(findBrokenLinks('[a](%2e%2e/outside.md)', tmpDir)).toEqual(['%2e%2e/outside.md']);
  });

  it('every relative link in AGENTS.md resolves', () => {
    const agents = readFileSync(join(repoRoot, 'AGENTS.md'), 'utf8');
    expect(findBrokenLinks(agents, repoRoot)).toEqual([]);
  });
});

describe('parseTargets', () => {
  it('returns all targets when no --targets flag is provided', () => {
    expect(parseTargets([])).toEqual(Object.values(TARGETS));
  });

  it('returns all targets for --targets=all', () => {
    expect(parseTargets(['--targets=all'])).toEqual(Object.values(TARGETS));
  });

  it('returns only the specified target', () => {
    expect(parseTargets(['--targets=claude'])).toEqual([TARGETS['claude']]);
  });

  it('returns multiple specified targets in order', () => {
    expect(parseTargets(['--targets=claude,github,gemini'])).toEqual([
      TARGETS['claude'],
      TARGETS['github'],
      TARGETS['gemini'],
    ]);
  });

  it('cursor target has isCursor flag', () => {
    const result = parseTargets(['--targets=cursor']);
    expect(result).toEqual([TARGETS['cursor']]);
    expect(result[0].isCursor).toBe(true);
  });

  it('exits with error for unknown target', () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    expect(() => parseTargets(['--targets=unknown'])).toThrow('process.exit called');
    exitSpy.mockRestore();
  });
});

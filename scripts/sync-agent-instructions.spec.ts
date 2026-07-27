import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  TARGETS,
  detectEol,
  ensureTrailingNewline,
  maybeWrite,
  normalizeEol,
  parseTargets,
  readExisting,
} from './sync-agent-instructions';

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

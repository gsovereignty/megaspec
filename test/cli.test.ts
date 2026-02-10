import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execFileSync } from 'node:child_process';

const CLI_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'dist',
  'cli.js',
);

describe('CLI integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-cli-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('docflow init --json returns valid JSON with created file list', () => {
    const result = execFileSync('node', [CLI_PATH, 'init', '--json'], {
      cwd: tmpDir,
      encoding: 'utf-8',
    });

    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.created).toBeInstanceOf(Array);
    expect(parsed.created.length).toBe(9);
    expect(parsed.skipped).toBeInstanceOf(Array);
    expect(parsed.skipped.length).toBe(0);
  });

  it('docflow init is idempotent — second run reports skipped', () => {
    execFileSync('node', [CLI_PATH, 'init', '--json'], {
      cwd: tmpDir,
      encoding: 'utf-8',
    });

    const result = execFileSync('node', [CLI_PATH, 'init', '--json'], {
      cwd: tmpDir,
      encoding: 'utf-8',
    });

    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(parsed.created.length).toBe(0);
    expect(parsed.skipped.length).toBe(9);
  });

  it('docflow init [path] creates a subdirectory', () => {
    const result = execFileSync(
      'node',
      [CLI_PATH, 'init', 'my-project', '--json'],
      {
        cwd: tmpDir,
        encoding: 'utf-8',
      },
    );

    const parsed = JSON.parse(result);
    expect(parsed.success).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, 'my-project', 'project.md')),
    ).toBe(true);
  });

  it('docflow init in existing project reports skipped files', () => {
    // First init
    execFileSync('node', [CLI_PATH, 'init', '--json'], {
      cwd: tmpDir,
      encoding: 'utf-8',
    });

    // Remove one file
    fs.unlinkSync(path.join(tmpDir, 'project.md'));

    // Second init
    const result = execFileSync('node', [CLI_PATH, 'init', '--json'], {
      cwd: tmpDir,
      encoding: 'utf-8',
    });

    const parsed = JSON.parse(result);
    expect(parsed.created).toContain('project.md');
    expect(parsed.skipped.length).toBeGreaterThan(0);
  });

  it('docflow --help works', () => {
    const result = execFileSync('node', [CLI_PATH, '--help'], {
      encoding: 'utf-8',
    });
    expect(result).toMatch(/docflow/);
    expect(result).toMatch(/init/);
    expect(result).toMatch(/--json/);
    expect(result).toMatch(/--no-interactive/);
  });
});

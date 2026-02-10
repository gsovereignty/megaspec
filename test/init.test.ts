import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { scaffold } from '../src/commands/init.js';

describe('docflow init', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates all expected directories and files', () => {
    const result = scaffold(tmpDir);

    // Directories
    expect(fs.existsSync(path.join(tmpDir, 'publish'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'drafts'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'archive'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'templates'))).toBe(true);

    // Files
    expect(fs.existsSync(path.join(tmpDir, 'project.md'))).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, 'templates', 'tutorial.md')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, 'templates', 'reference.md')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, 'templates', 'guide.md')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, 'templates', 'whitepaper.md')),
    ).toBe(true);

    // All should be created, none skipped
    expect(result.created.length).toBe(9);
    expect(result.skipped.length).toBe(0);
  });

  it('is idempotent — second run skips existing files', () => {
    scaffold(tmpDir);
    const result = scaffold(tmpDir);

    expect(result.created.length).toBe(0);
    expect(result.skipped.length).toBe(9);
  });

  it('reports skipped and created files on partial re-run', () => {
    scaffold(tmpDir);

    // Remove one file to simulate a partial state
    fs.unlinkSync(path.join(tmpDir, 'project.md'));

    const result = scaffold(tmpDir);
    expect(result.created).toContain('project.md');
    expect(result.skipped).toContain('publish/');
    expect(result.skipped).toContain('templates/tutorial.md');
  });

  it('creates a subdirectory when path argument is provided', () => {
    const subDir = path.join(tmpDir, 'my-project');
    const result = scaffold(subDir);

    expect(fs.existsSync(subDir)).toBe(true);
    expect(fs.existsSync(path.join(subDir, 'project.md'))).toBe(true);
    expect(result.created.length).toBe(9);
  });
});

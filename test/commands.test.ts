import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execSync } from 'node:child_process';

let tmpDir: string;
const CLI = path.resolve('dist/cli.js');

function run(args: string, cwd?: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI} ${args}`, {
      cwd: cwd ?? tmpDir,
      encoding: 'utf-8',
      timeout: 10000,
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      exitCode: err.status ?? 1,
    };
  }
}

function writeDoc(
  location: 'publish' | 'drafts' | 'archive',
  slug: string,
  content: string,
): void {
  if (location === 'drafts') {
    const dir = path.join(tmpDir, 'drafts', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'content.md'), content, 'utf-8');
  } else {
    const dir = path.join(tmpDir, location);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${slug}.md`), content, 'utf-8');
  }
}

const validDoc = `---
id: test-doc
title: "Test Document"
type: guide
audience: beginner
---

Have you ever wondered how to write great docs?

## Getting Started

You can start by reading this guide.

\`\`\`js
// Install the package
npm install docflow
\`\`\`

## Next Steps

Continue learning about documentation best practices.
`;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-cmd-'));
  // Init the project
  run('init', tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('docflow list', () => {
  it('shows no documents initially', () => {
    const { stdout } = run('list');
    expect(stdout).toContain('No documents found');
  });

  it('lists documents in publish/', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout } = run('list');
    expect(stdout).toContain('my-guide');
    expect(stdout).toContain('guide');
  });

  it('supports --json', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout } = run('--json list');
    const data = JSON.parse(stdout);
    expect(data.success).toBe(true);
    expect(data.count).toBe(1);
    expect(data.documents[0].slug).toBe('my-guide');
  });

  it('filters by --type', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout: guideOut } = run('list --type guide');
    expect(guideOut).toContain('my-guide');
    const { stdout: tutOut } = run('list --type tutorial');
    expect(tutOut).toContain('No documents found');
  });
});

describe('docflow show', () => {
  it('shows document details', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout } = run('show my-guide');
    expect(stdout).toContain('Test Document');
    expect(stdout).toContain('guide');
  });

  it('errors on missing slug', () => {
    const { exitCode } = run('show nonexistent');
    expect(exitCode).toBe(1);
  });

  it('supports --json', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout } = run('--json show my-guide');
    const data = JSON.parse(stdout);
    expect(data.success).toBe(true);
    expect(data.slug).toBe('my-guide');
  });
});

describe('docflow validate', () => {
  it('validates a file', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const { stdout } = run(`validate ${filePath}`);
    expect(stdout).toContain('Validating');
  });

  it('supports --json', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const { stdout } = run(`--json validate ${filePath}`);
    const data = JSON.parse(stdout);
    expect(data.success).toBe(true);
    expect(data.diagnostics).toBeDefined();
  });

  it('errors on missing file', () => {
    const { exitCode } = run('validate /nonexistent.md');
    expect(exitCode).toBe(1);
  });
});

describe('docflow publish', () => {
  it('publishes a draft', () => {
    writeDoc('drafts', 'my-guide', validDoc);
    const { stdout, exitCode } = run('publish my-guide --skip-validation');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Published');
    expect(fs.existsSync(path.join(tmpDir, 'publish', 'my-guide.md'))).toBe(true);
  });

  it('errors on missing draft', () => {
    const { exitCode } = run('publish nonexistent');
    expect(exitCode).toBe(1);
  });

  it('supports --json', () => {
    writeDoc('drafts', 'my-guide', validDoc);
    const { stdout } = run('--json publish my-guide --skip-validation');
    const data = JSON.parse(stdout);
    expect(data.success).toBe(true);
  });
});

describe('docflow archive', () => {
  it('archives a published document', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout, exitCode } = run('archive my-guide');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Archived');
    expect(fs.existsSync(path.join(tmpDir, 'archive', 'my-guide.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'publish', 'my-guide.md'))).toBe(false);
  });

  it('archives with reason', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout } = run('archive my-guide --reason "outdated"');
    expect(stdout).toContain('outdated');
    const archived = fs.readFileSync(path.join(tmpDir, 'archive', 'my-guide.md'), 'utf-8');
    expect(archived).toContain('archive_reason');
  });

  it('errors on missing document', () => {
    const { exitCode } = run('archive nonexistent');
    expect(exitCode).toBe(1);
  });
});

describe('docflow metrics', () => {
  it('computes engagement score', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const { stdout, exitCode } = run(`metrics ${filePath}`);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Engagement Score');
    expect(stdout).toContain('Total');
  });

  it('supports --json', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const { stdout } = run(`--json metrics ${filePath}`);
    const data = JSON.parse(stdout);
    expect(data.success).toBe(true);
    expect(data.total).toBeDefined();
    expect(data.dimensions).toBeDefined();
  });

  it('errors on missing file', () => {
    const { exitCode } = run('metrics /nonexistent.md');
    expect(exitCode).toBe(1);
  });
});

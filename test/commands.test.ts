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

function writeChecklist(
  slug: string,
  status: string = 'approved',
  extras: string = '',
): void {
  const dir = path.join(tmpDir, 'drafts', slug);
  fs.mkdirSync(dir, { recursive: true });
  const checklist = `# Checklist

## Human Review
- **Reviewer**: Test Reviewer
- **Date**: 2026-02-10
- **Status**: ${status}
- **Notes**: Review notes
${extras}
`;
  fs.writeFileSync(path.join(dir, 'checklist.md'), checklist, 'utf-8');
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
npm install example-pkg
\`\`\`

## Next Steps

Now that you've learned the basics, continue learning about documentation techniques.
`;

/** A doc that passes strict validation (no warnings). */
const publishableDoc = `---
id: test-doc
title: "Test Document"
type: guide
audience: beginner
---

Have you ever wondered how to write great docs?

## Getting Started

You can start by reading this guide. It covers all the basics you need.

\`\`\`bash
echo "Hello world"
\`\`\`

Next, we will look at what comes after.

## Next Steps

Continue learning about documentation techniques.
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

  it('supports --publish flag with ID, TITLE, AUDIENCE, READING TIME columns', () => {
    writeDoc('publish', 'my-guide', publishableDoc);
    const { stdout } = run('list --publish');
    expect(stdout).toContain('ID');
    expect(stdout).toContain('TITLE');
    expect(stdout).toContain('AUDIENCE');
    expect(stdout).toContain('READING TIME');
    expect(stdout).toContain('test-doc');
    expect(stdout).toContain('Test Document');
    expect(stdout).toContain('min');
  });

  it('--publish shows only published docs', () => {
    writeDoc('drafts', 'draft-guide', validDoc);
    writeDoc('publish', 'pub-guide', publishableDoc);
    const { stdout } = run('list --publish');
    // ID column shows front matter id, not the slug
    expect(stdout).toContain('test-doc');
    expect(stdout).not.toContain('draft-guide');
  });

  it('--publish --json includes readingTime', () => {
    writeDoc('publish', 'my-guide', publishableDoc);
    const { stdout } = run('--json list --publish');
    const data = JSON.parse(stdout);
    expect(data.success).toBe(true);
    expect(data.documents[0].readingTime).toBeDefined();
    expect(data.documents[0].id).toBe('test-doc');
  });

  it('--publish with no published docs shows message', () => {
    const { stdout } = run('list --publish');
    expect(stdout).toContain('No published documents found');
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

  it('shows engagement scores for drafts', () => {
    writeDoc('drafts', 'my-guide', validDoc);
    const { stdout } = run('show my-guide');
    expect(stdout).toContain('Engagement');
    expect(stdout).toContain('/100');
    expect(stdout).toContain('Total');
  });

  it('does not show engagement scores for published docs', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout } = run('show my-guide');
    expect(stdout).not.toContain('Engagement');
  });

  it('--json includes engagement for drafts', () => {
    writeDoc('drafts', 'my-guide', validDoc);
    const { stdout } = run('--json show my-guide');
    const data = JSON.parse(stdout);
    expect(data.engagement).toBeDefined();
    expect(data.engagement.total).toBeDefined();
    expect(data.engagement.dimensions).toBeDefined();
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

  it('--engagement-report shows score report', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const { stdout } = run(`validate --engagement-report ${filePath}`);
    expect(stdout).toContain('Engagement Report');
    expect(stdout).toContain('/100');
    expect(stdout).toContain('Total');
  });

  it('--engagement-report --json includes engagement', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const { stdout } = run(`--json validate --engagement-report ${filePath}`);
    const data = JSON.parse(stdout);
    expect(data.engagement).toBeDefined();
    expect(data.engagement.total).toBeDefined();
    expect(data.engagement.dimensions).toBeDefined();
  });

  it('without --engagement-report does not show scores', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const { stdout } = run(`validate ${filePath}`);
    expect(stdout).not.toContain('Engagement Report');
  });
});

describe('docflow publish', () => {
  it('publishes a draft with all gates passing', () => {
    writeDoc('drafts', 'my-guide', publishableDoc);
    writeChecklist('my-guide');
    const { stdout, exitCode } = run('publish my-guide');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Published');
    expect(fs.existsSync(path.join(tmpDir, 'publish', 'my-guide.md'))).toBe(true);
  });

  it('errors on missing draft', () => {
    const { exitCode } = run('publish nonexistent');
    expect(exitCode).toBe(1);
  });

  it('supports --json', () => {
    writeDoc('drafts', 'my-guide', publishableDoc);
    writeChecklist('my-guide');
    const { stdout } = run('--json publish my-guide');
    const data = JSON.parse(stdout);
    expect(data.success).toBe(true);
  });

  it('rejects publish when human review is missing', () => {
    writeDoc('drafts', 'my-guide', publishableDoc);
    // No checklist.md written
    const { exitCode, stderr } = run('publish my-guide');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Human review gate failed');
  });

  it('rejects publish when human review status is rejected', () => {
    writeDoc('drafts', 'my-guide', publishableDoc);
    writeChecklist('my-guide', 'rejected');
    const { exitCode, stderr } = run('publish my-guide');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('rejected');
  });

  it('rejects publish when human review status is needs-revision', () => {
    writeDoc('drafts', 'my-guide', publishableDoc);
    writeChecklist('my-guide', 'needs-revision');
    const { exitCode, stderr } = run('publish my-guide');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('needs-revision');
  });

  it('rejects publish when unknowns exist and are not acknowledged', () => {
    const docWithUnknowns = publishableDoc + `
## Agent Contributions

### Role
Writer

### Unknowns
- Is the API stable?
- What about edge cases?
`;
    writeDoc('drafts', 'my-guide', docWithUnknowns);
    writeChecklist('my-guide');
    const { exitCode, stderr } = run('publish my-guide');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('nknown');
  });

  it('publishes when unknowns are acknowledged in human review', () => {
    const docWithUnknowns = publishableDoc + `
## Agent Contributions

### Role
Writer

### Unknowns
- Is the API stable?
`;
    writeDoc('drafts', 'my-guide', docWithUnknowns);
    writeChecklist('my-guide', 'approved', '- **acknowledged_unknowns**: true');
    const { exitCode } = run('publish my-guide');
    expect(exitCode).toBe(0);
  });

  it('strips Agent Contributions from published file', () => {
    const docWithAgent = publishableDoc + `
## Agent Contributions

### Role
Writer

### Unknowns
None
`;
    writeDoc('drafts', 'my-guide', docWithAgent);
    writeChecklist('my-guide');
    const { exitCode } = run('publish my-guide');
    expect(exitCode).toBe(0);
    const published = fs.readFileSync(path.join(tmpDir, 'publish', 'my-guide.md'), 'utf-8');
    expect(published).not.toContain('Agent Contributions');
    expect(published).not.toContain('### Role');
  });

  it('adds published_at timestamp to published file', () => {
    writeDoc('drafts', 'my-guide', publishableDoc);
    writeChecklist('my-guide');
    run('publish my-guide');
    const published = fs.readFileSync(path.join(tmpDir, 'publish', 'my-guide.md'), 'utf-8');
    expect(published).toContain('published_at');
  });
});

describe('docflow archive', () => {
  it('archives a published document with date-prefixed filename', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout, exitCode } = run('archive my-guide');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Archived');
    // Verify date-prefixed filename
    const archiveFiles = fs.readdirSync(path.join(tmpDir, 'archive'));
    const dated = archiveFiles.find((f) => f.endsWith('-my-guide.md'));
    expect(dated).toBeDefined();
    expect(dated).toMatch(/^\d{4}-\d{2}-\d{2}-my-guide\.md$/);
    expect(fs.existsSync(path.join(tmpDir, 'publish', 'my-guide.md'))).toBe(false);
  });

  it('archives with reason', () => {
    writeDoc('publish', 'my-guide', validDoc);
    const { stdout } = run('archive my-guide --reason "outdated"');
    expect(stdout).toContain('outdated');
    const archiveFiles = fs.readdirSync(path.join(tmpDir, 'archive'));
    const dated = archiveFiles.find((f) => f.endsWith('-my-guide.md'))!;
    const archived = fs.readFileSync(path.join(tmpDir, 'archive', dated), 'utf-8');
    expect(archived).toContain('archive_reason');
  });

  it('also moves drafts/ directory when archiving from publish/', () => {
    writeDoc('publish', 'my-guide', validDoc);
    writeDoc('drafts', 'my-guide', validDoc);
    const { exitCode } = run('archive my-guide');
    expect(exitCode).toBe(0);
    // Draft dir should be moved
    expect(fs.existsSync(path.join(tmpDir, 'drafts', 'my-guide'))).toBe(false);
    // Should exist as date-prefixed directory in archive
    const archiveEntries = fs.readdirSync(path.join(tmpDir, 'archive'));
    const datedDir = archiveEntries.find((e) =>
      e.match(/^\d{4}-\d{2}-\d{2}-my-guide$/) &&
      fs.statSync(path.join(tmpDir, 'archive', e)).isDirectory()
    );
    expect(datedDir).toBeDefined();
  });

  it('errors when document is only in drafts (not published)', () => {
    writeDoc('drafts', 'my-guide', validDoc);
    const { exitCode, stderr } = run('archive my-guide');
    expect(exitCode).toBe(1);
    expect(stderr).toContain('not found');
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

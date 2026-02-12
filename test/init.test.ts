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
    expect(fs.existsSync(path.join(tmpDir, 'docflow'))).toBe(true);

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
    expect(
      fs.existsSync(path.join(tmpDir, 'docflow', 'AGENTS.md')),
    ).toBe(true);

    // All should be created, none skipped
    expect(result.created.length).toBe(11);
    expect(result.skipped.length).toBe(0);
  });

  it('is idempotent — second run skips existing files', () => {
    scaffold(tmpDir);
    const result = scaffold(tmpDir);

    expect(result.created.length).toBe(0);
    expect(result.skipped.length).toBe(11);
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
    expect(fs.existsSync(path.join(subDir, 'docflow', 'AGENTS.md'))).toBe(
      true,
    );
    expect(result.created.length).toBe(11);
  });

  it('includes docflow/AGENTS.md in created list', () => {
    const result = scaffold(tmpDir);
    expect(result.created).toContain('docflow/AGENTS.md');
  });

  it('does not overwrite existing AGENTS.md on re-run', () => {
    scaffold(tmpDir);

    // Modify the file to prove it is not overwritten
    const agentsPath = path.join(tmpDir, 'docflow', 'AGENTS.md');
    fs.writeFileSync(agentsPath, '# Custom content\n', 'utf-8');

    const result = scaffold(tmpDir);
    expect(result.skipped).toContain('docflow/AGENTS.md');

    const content = fs.readFileSync(agentsPath, 'utf-8');
    expect(content).toBe('# Custom content\n');
  });

  it('AGENTS.md contains all required sections', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    // Top-level sections
    expect(content).toContain('## Quick Reference Checklist');
    expect(content).toContain('## Content Type Rules');
    expect(content).toContain('## Research-Based Writing Guidance');
    expect(content).toContain('## Common Mistakes');
    expect(content).toContain('## Self-Validation Checklist');
    expect(content).toContain('## Interview Mode');
    expect(content).toContain('## Transform Mode');
    expect(content).toContain('## Agent Modes');
    expect(content).toContain('## Agent Contributions Format');
    expect(content).toContain('## Role Contracts');
  });

  it('AGENTS.md contains all 4 content type subsections', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    expect(content).toContain('### Tutorial');
    expect(content).toContain('### Guide');
    expect(content).toContain('### Reference');
    expect(content).toContain('### Whitepaper');
  });

  it('AGENTS.md contains all 19 research foundation entries', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    for (let i = 1; i <= 19; i++) {
      const rfId = `RF-${String(i).padStart(2, '0')}`;
      expect(content).toContain(rfId);
    }
  });

  it('AGENTS.md contains all 7 interview questions (DF-070)', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    expect(content).toContain('Who is the target reader?');
    expect(content).toContain(
      'What should they be able to do after reading',
    );
    expect(content).toContain('What do they already know?');
    expect(content).toContain("What's the core problem this solves?");
    expect(content).toContain(
      'Walk me through the main steps/concepts',
    );
    expect(content).toContain(
      'What mistakes do people commonly make?',
    );
    expect(content).toContain(
      "What's the surprising insight or key takeaway?",
    );
  });

  it('AGENTS.md contains transform mode no-hallucination directive (DF-071)', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    expect(content).toContain('never hallucinate domain claims');
    expect(content).toContain('### Unknowns');
  });

  it('AGENTS.md documents all 3 agent modes (DF-072)', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    expect(content).toContain('### Single Mode');
    expect(content).toContain('### Role-Based Mode');
    expect(content).toContain('### Consensus Mode');
  });

  it('AGENTS.md specifies Agent Contributions format (DF-073)', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    expect(content).toContain('## Agent Contributions');
    expect(content).toContain('### Role');
    expect(content).toContain('### Assumptions');
    expect(content).toContain('### Unknowns');
  });

  it('AGENTS.md defines researcher/writer/reviewer role contracts (DF-075)', () => {
    scaffold(tmpDir);
    const content = fs.readFileSync(
      path.join(tmpDir, 'docflow', 'AGENTS.md'),
      'utf-8',
    );

    expect(content).toContain('### Researcher');
    expect(content).toContain('### Writer');
    expect(content).toContain('### Reviewer');
    expect(content).toContain('**Receives**:');
    expect(content).toContain('**Produces**:');
  });
});

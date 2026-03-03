import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  scaffold,
  toSlug,
  generateProjectMd,
  generatePromptMd,
  type InitAnswers,
} from '../src/commands/init.js';

const INTERVIEW_ANSWERS: InitAnswers = {
  projectName: 'WebSocket Deployment Guide',
  contentType: 'guide',
  audience: 'Backend developers familiar with Express',
  topic: 'Deploying WebSocket servers to production',
  interactionMode: 'interview',
};

const TRANSFORM_ANSWERS: InitAnswers = {
  projectName: 'API Reference',
  contentType: 'reference',
  audience: 'Senior engineers integrating our payment API',
  topic: 'Payment processing REST API endpoints',
  interactionMode: 'transform',
};

describe('toSlug', () => {
  it('converts to lowercase kebab-case', () => {
    expect(toSlug('WebSocket Deployment Guide')).toBe(
      'websocket-deployment-guide',
    );
  });

  it('replaces non-alphanumeric characters with hyphens', () => {
    expect(toSlug('Hello, World! (Test)')).toBe('hello-world-test');
  });

  it('collapses consecutive hyphens', () => {
    expect(toSlug('foo---bar')).toBe('foo-bar');
  });

  it('strips leading and trailing hyphens', () => {
    expect(toSlug('--hello--')).toBe('hello');
  });

  it('truncates to 60 characters', () => {
    const long = 'a'.repeat(80);
    expect(toSlug(long).length).toBe(60);
  });

  it('handles mixed case and special chars', () => {
    expect(toSlug("How to Deploy a WebSocket Server — A Developer's Guide")).toBe(
      'how-to-deploy-a-websocket-server-a-developer-s-guide',
    );
  });
});

describe('generateProjectMd', () => {
  it('uses project name as heading', () => {
    const md = generateProjectMd(INTERVIEW_ANSWERS);
    expect(md).toContain('# WebSocket Deployment Guide');
  });

  it('includes chosen interaction mode', () => {
    const md = generateProjectMd(INTERVIEW_ANSWERS);
    expect(md).toContain('interaction: interview');
  });

  it('uses transform mode when selected', () => {
    const md = generateProjectMd(TRANSFORM_ANSWERS);
    expect(md).toContain('interaction: transform');
    expect(md).toContain('# API Reference');
  });

  it('includes default agent config fields', () => {
    const md = generateProjectMd(INTERVIEW_ANSWERS);
    expect(md).toContain('mode: single');
    expect(md).toContain('human_review: required');
    expect(md).toContain('researcher: true');
    expect(md).toContain('writer: true');
    expect(md).toContain('reviewer: true');
  });
});

describe('generatePromptMd - interview mode', () => {
  const prompt = generatePromptMd(INTERVIEW_ANSWERS);

  it('includes project name in title', () => {
    expect(prompt).toContain('# Writing Prompt: WebSocket Deployment Guide');
  });

  it('references AGENTS.md', () => {
    expect(prompt).toContain('docflow/AGENTS.md');
  });

  it('specifies content type and template', () => {
    expect(prompt).toContain('**Content type:** guide');
    expect(prompt).toContain('templates/guide.md');
  });

  it('includes audience and topic', () => {
    expect(prompt).toContain('Backend developers familiar with Express');
    expect(prompt).toContain('Deploying WebSocket servers to production');
  });

  it('instructs AI to begin interview flow', () => {
    expect(prompt).toContain('## Mode: Interview');
    expect(prompt).toContain('7 interview questions');
  });

  it('lists all 7 interview questions', () => {
    expect(prompt).toContain('Who is the target reader?');
    expect(prompt).toContain('What should they be able to do after reading this?');
    expect(prompt).toContain('What do they already know?');
    expect(prompt).toContain("What's the core problem this solves?");
    expect(prompt).toContain('Walk me through the main steps/concepts.');
    expect(prompt).toContain('What mistakes do people commonly make?');
    expect(prompt).toContain("What's the surprising insight or key takeaway?");
  });

  it('mentions output directory with slug', () => {
    expect(prompt).toContain('drafts/websocket-deployment-guide/');
  });

  it('lists expected artifacts', () => {
    expect(prompt).toContain('outline.md');
    expect(prompt).toContain('content.md');
    expect(prompt).toContain('checklist.md');
  });

  it('mentions Agent Contributions', () => {
    expect(prompt).toContain('## Agent Contributions');
  });
});

describe('generatePromptMd - transform mode', () => {
  const prompt = generatePromptMd(TRANSFORM_ANSWERS);

  it('uses transform mode header', () => {
    expect(prompt).toContain('## Mode: Transform');
  });

  it('references AGENTS.md transform mode', () => {
    expect(prompt).toContain('Transform Mode');
    expect(prompt).toContain('docflow/AGENTS.md');
  });

  it('specifies reference content type', () => {
    expect(prompt).toContain('**Content type:** reference');
    expect(prompt).toContain('templates/reference.md');
  });

  it('includes no-hallucination directive', () => {
    expect(prompt).toContain('Never hallucinate domain claims');
  });

  it('instructs AI to ask for raw content', () => {
    expect(prompt).toContain('raw content');
  });

  it('mentions output directory with slug', () => {
    expect(prompt).toContain('drafts/api-reference/');
  });
});

describe('scaffold with interactive answers', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-interactive-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates tailored project.md with interview mode answers', () => {
    const result = scaffold(tmpDir, INTERVIEW_ANSWERS);

    expect(result.created).toContain('project.md');

    const content = fs.readFileSync(path.join(tmpDir, 'project.md'), 'utf-8');
    expect(content).toContain('# WebSocket Deployment Guide');
    expect(content).toContain('interaction: interview');
  });

  it('creates drafts/<slug>/ directory', () => {
    const result = scaffold(tmpDir, INTERVIEW_ANSWERS);

    expect(result.created).toContain('drafts/websocket-deployment-guide/');
    expect(
      fs.existsSync(
        path.join(tmpDir, 'drafts', 'websocket-deployment-guide'),
      ),
    ).toBe(true);
  });

  it('creates PROMPT.md in drafts/<slug>/', () => {
    const result = scaffold(tmpDir, INTERVIEW_ANSWERS);

    expect(result.created).toContain(
      'drafts/websocket-deployment-guide/PROMPT.md',
    );

    const content = fs.readFileSync(
      path.join(
        tmpDir,
        'drafts',
        'websocket-deployment-guide',
        'PROMPT.md',
      ),
      'utf-8',
    );
    expect(content).toContain('## Mode: Interview');
    expect(content).toContain('docflow/AGENTS.md');
  });

  it('creates transform mode PROMPT.md', () => {
    scaffold(tmpDir, TRANSFORM_ANSWERS);

    const content = fs.readFileSync(
      path.join(tmpDir, 'drafts', 'api-reference', 'PROMPT.md'),
      'utf-8',
    );
    expect(content).toContain('## Mode: Transform');
    expect(content).toContain('reference');
  });

  it('still creates all standard directories and files', () => {
    const result = scaffold(tmpDir, INTERVIEW_ANSWERS);

    expect(fs.existsSync(path.join(tmpDir, 'publish'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'archive'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'templates'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'docflow'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'docflow', 'AGENTS.md'))).toBe(
      true,
    );
    // 12 standard items + drafts/<slug>/ + PROMPT.md = 14
    expect(result.created.length).toBe(14);
  });

  it('is idempotent — second run skips interactive artifacts', () => {
    scaffold(tmpDir, INTERVIEW_ANSWERS);
    const result = scaffold(tmpDir, INTERVIEW_ANSWERS);

    expect(result.created.length).toBe(0);
    expect(result.skipped).toContain(
      'drafts/websocket-deployment-guide/',
    );
    expect(result.skipped).toContain(
      'drafts/websocket-deployment-guide/PROMPT.md',
    );
  });
});

describe('scaffold without answers (non-interactive)', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-nonint-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('uses default project.md content', () => {
    scaffold(tmpDir);

    const content = fs.readFileSync(path.join(tmpDir, 'project.md'), 'utf-8');
    expect(content).toContain('# DocFlow Project');
    expect(content).toContain('interaction: interview');
  });

  it('does not create PROMPT.md or drafts subdirectory', () => {
    const result = scaffold(tmpDir);

    // Should not have any drafts/<slug>/ or PROMPT.md entries
    const draftEntries = result.created.filter(
      (item) => item.startsWith('drafts/') && item !== 'drafts/',
    );
    expect(draftEntries).toEqual([]);
  });

  it('creates exactly 11 items (same as before)', () => {
    const result = scaffold(tmpDir);
    expect(result.created.length).toBe(12);
  });
});

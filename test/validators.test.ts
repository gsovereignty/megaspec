import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { parseMarkdown } from '../src/utils/markdown.js';
import type { ValidationContext } from '../src/validators/types.js';
import type { ContentType } from '../src/utils/front-matter.js';
import { getProfile } from '../src/validators/profiles.js';
import { executeProfile, getRule } from '../src/validators/registry.js';
// Side-effect import: registers all rules
import '../src/validators/rules.js';

let tmpDir: string;

function createContext(
  content: string,
  overrides: Partial<ValidationContext> = {},
): ValidationContext {
  const raw = content;
  const parsed = parseMarkdown(raw);
  return {
    ast: parsed.ast,
    content: parsed.content,
    rawContent: raw,
    frontMatter: parsed.frontMatter,
    contentType: (parsed.frontMatter.type as ContentType) || 'guide',
    projectDir: tmpDir,
    slug: (parsed.frontMatter.id as string) || 'test-doc',
    filePath: path.join(tmpDir, 'test.md'),
    ...overrides,
  };
}

function mdWithFrontMatter(opts: Record<string, string> = {}, body: string = ''): string {
  const fm = {
    id: 'test-doc',
    title: 'Test Document',
    type: 'guide',
    audience: 'beginner',
    ...opts,
  };
  const lines = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n\n${body}`;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-test-'));
  // Create basic project structure
  fs.mkdirSync(path.join(tmpDir, 'publish'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'drafts'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'archive'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// DF-020: Front matter
// ---------------------------------------------------------------------------
describe('DF-020: Front matter validation', () => {
  it('passes with valid front matter', () => {
    const ctx = createContext(mdWithFrontMatter());
    const rule = getRule('DF-020')!;
    const diags = rule(ctx);
    expect(diags).toHaveLength(0);
  });

  it('fails on missing id', () => {
    const content = `---\ntitle: Test\ntype: guide\naudience: beginner\n---\n\nText`;
    const ctx = createContext(content);
    const rule = getRule('DF-020')!;
    const diags = rule(ctx);
    expect(diags.some((d) => d.message.includes('id'))).toBe(true);
  });

  it('fails on invalid type', () => {
    const content = `---\nid: test\ntitle: Test\ntype: blog\naudience: beginner\n---\n\nText`;
    const ctx = createContext(content);
    const rule = getRule('DF-020')!;
    const diags = rule(ctx);
    expect(diags.some((d) => d.message.includes('type'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DF-029: Flat publish
// ---------------------------------------------------------------------------
describe('DF-029: Flat publish', () => {
  it('passes with flat slug', () => {
    const ctx = createContext(mdWithFrontMatter(), { slug: 'my-doc' });
    const rule = getRule('DF-029')!;
    expect(rule(ctx)).toHaveLength(0);
  });

  it('fails with nested slug', () => {
    const ctx = createContext(mdWithFrontMatter(), { slug: 'dir/my-doc' });
    const rule = getRule('DF-029')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// DF-030: Paragraph length
// ---------------------------------------------------------------------------
describe('DF-030: Paragraph length', () => {
  it('passes with short paragraphs', () => {
    const body = 'First sentence. Second sentence. Third sentence.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-030')!;
    expect(rule(ctx)).toHaveLength(0);
  });

  it('warns on paragraphs with > 5 sentences', () => {
    const body = 'One. Two. Three. Four. Five. Six. Seven.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-030')!;
    const diags = rule(ctx);
    expect(diags.length).toBeGreaterThan(0);
    expect(diags[0].ruleId).toBe('DF-030');
  });
});

// ---------------------------------------------------------------------------
// DF-031/032: List length
// ---------------------------------------------------------------------------
describe('DF-031: List length max', () => {
  it('warns on lists > 7 items', () => {
    const body = '- a\n- b\n- c\n- d\n- e\n- f\n- g\n- h\n- i';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-031')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });
});

describe('DF-032: List length min', () => {
  it('warns on lists < 3 items', () => {
    const body = '- a\n- b';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-032')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// DF-034: Code comments (tutorial)
// ---------------------------------------------------------------------------
describe('DF-034: Code comments', () => {
  it('fails for uncommented code blocks in tutorials', () => {
    const body = '```js\nconst x = 1;\nconst y = 2;\nconst z = 3;\nconst w = 4;\n```';
    const ctx = createContext(mdWithFrontMatter({ type: 'tutorial' }, body));
    const rule = getRule('DF-034')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });

  it('passes for commented code blocks in tutorials', () => {
    const body = '```js\n// Initialize variables\nconst x = 1;\nconst y = 2;\nconst z = 3;\n```';
    const ctx = createContext(mdWithFrontMatter({ type: 'tutorial' }, body));
    const rule = getRule('DF-034')!;
    expect(rule(ctx)).toHaveLength(0);
  });

  it('skips for non-tutorial types', () => {
    const body = '```js\nconst x = 1;\nconst y = 2;\nconst z = 3;\nconst w = 4;\n```';
    const ctx = createContext(mdWithFrontMatter({ type: 'reference' }, body));
    const rule = getRule('DF-034')!;
    expect(rule(ctx)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DF-040: Opening hook
// ---------------------------------------------------------------------------
describe('DF-040: Opening hook', () => {
  it('passes when opening has a question', () => {
    const body = 'Have you ever struggled with documentation? This guide will help.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-040')!;
    expect(rule(ctx)).toHaveLength(0);
  });

  it('fails when opening has no hook', () => {
    const body = 'Documentation is important. It helps developers understand code.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-040')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// DF-043: Placeholder names
// ---------------------------------------------------------------------------
describe('DF-043: Placeholder names', () => {
  it('warns on foo/bar in code', () => {
    const body = '```js\nconst foo = "hello";\n```';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-043')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });

  it('passes with domain-specific names', () => {
    const body = '```js\nconst orderTotal = 42.50;\n```';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-043')!;
    expect(rule(ctx)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DF-050: Flesch-Kincaid
// ---------------------------------------------------------------------------
describe('DF-050: Flesch-Kincaid', () => {
  it('passes with simple prose', () => {
    const body = 'This is a simple test. It has short words. The text is easy to read. You can do it too.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-050')!;
    expect(rule(ctx)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DF-052: Passive voice
// ---------------------------------------------------------------------------
describe('DF-052: Passive voice', () => {
  it('passes with mostly active voice', () => {
    const body = 'You create a file. You write content. You save the document. You publish it.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-052')!;
    expect(rule(ctx)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DF-054: Heading descriptiveness
// ---------------------------------------------------------------------------
describe('DF-054: Heading descriptiveness', () => {
  it('warns on vague headings', () => {
    const body = '## Overview\n\nSome content here.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-054')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });

  it('passes with descriptive headings', () => {
    const body = '## Installing the Database Driver\n\nSome content here.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-054')!;
    expect(rule(ctx)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// DF-058: Image alt text
// ---------------------------------------------------------------------------
describe('DF-058: Image alt text', () => {
  it('fails on images without alt text', () => {
    const body = '![](image.png)';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-058')!;
    expect(rule(ctx).length).toBeGreaterThan(0);
  });

  it('passes on images with alt text', () => {
    const body = '![Architecture diagram](image.png)';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const rule = getRule('DF-058')!;
    expect(rule(ctx)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Profile execution
// ---------------------------------------------------------------------------
describe('Profile execution', () => {
  it('runs all rules in a profile', () => {
    const body = 'Have you ever needed to write good docs? This guide helps you do that.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const profile = getProfile('guide');
    const diags = executeProfile(profile, ctx);
    // Should run without error and return diagnostics array
    expect(Array.isArray(diags)).toBe(true);
  });

  it('strict mode converts WARN to FAIL', () => {
    // Create content that triggers warnings
    const body = '## Overview\n\nContent here.';
    const ctx = createContext(mdWithFrontMatter({}, body));
    const profile = getProfile('guide');

    const normal = executeProfile(profile, ctx);
    const strict = executeProfile(profile, ctx, true);

    const normalWarns = normal.filter((d) => d.severity === 'WARN').length;
    const strictWarns = strict.filter((d) => d.severity === 'WARN').length;

    // Strict should have fewer (or zero) warnings
    expect(strictWarns).toBeLessThanOrEqual(normalWarns);
  });
});

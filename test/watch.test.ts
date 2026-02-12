import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { runValidation, computeEngagementDeltas, resolveValidationTarget } from '../src/commands/validate.js';
import type { EngagementScore } from '../src/scoring/engagement.js';
import { createOutputContext } from '../src/utils/output-context.js';

let tmpDir: string;

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

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-watch-'));
  fs.mkdirSync(path.join(tmpDir, 'publish'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'drafts'), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, 'archive'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('runValidation', () => {
  it('returns validation result without engagement', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const result = runValidation(filePath, tmpDir, {
      strict: false,
      engagementReport: false,
      stripLlm: false,
    });
    expect(result.result.slug).toBe('test-doc');
    expect(result.result.contentType).toBe('guide');
    expect(result.result.diagnostics).toBeDefined();
    expect(result.engagement).toBeUndefined();
  });

  it('returns engagement scores when requested', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const result = runValidation(filePath, tmpDir, {
      strict: false,
      engagementReport: true,
      stripLlm: false,
    });
    expect(result.engagement).toBeDefined();
    expect(result.engagement!.total).toBeGreaterThanOrEqual(0);
    expect(result.engagement!.dimensions.curiosity).toBeDefined();
    expect(result.engagement!.dimensions.clarity).toBeDefined();
  });

  it('filters by rule when specified', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const result = runValidation(filePath, tmpDir, {
      strict: false,
      rule: 'DF-020',
      engagementReport: false,
      stripLlm: false,
    });
    // Should only have diagnostics from DF-020
    result.result.diagnostics.forEach((d) => {
      expect(d.ruleId).toBe('DF-020');
    });
  });
});

describe('computeEngagementDeltas', () => {
  const makeDim = (score: number) => ({ score, label: 'Test', details: '' });

  it('computes positive deltas', () => {
    const previous: EngagementScore = {
      total: 50,
      dimensions: {
        curiosity: makeDim(40),
        clarity: makeDim(50),
        action: makeDim(60),
        flow: makeDim(50),
        voice: makeDim(50),
      },
    };
    const current: EngagementScore = {
      total: 70,
      dimensions: {
        curiosity: makeDim(60),
        clarity: makeDim(72),
        action: makeDim(80),
        flow: makeDim(65),
        voice: makeDim(73),
      },
    };

    const deltas = computeEngagementDeltas(current, previous);
    expect(deltas['curiosity']).toBe(20);
    expect(deltas['clarity']).toBe(22);
    expect(deltas['action']).toBe(20);
    expect(deltas['flow']).toBe(15);
    expect(deltas['voice']).toBe(23);
    expect(deltas['total']).toBe(20);
  });

  it('computes negative deltas', () => {
    const previous: EngagementScore = {
      total: 70,
      dimensions: {
        curiosity: makeDim(80),
        clarity: makeDim(70),
        action: makeDim(60),
        flow: makeDim(70),
        voice: makeDim(70),
      },
    };
    const current: EngagementScore = {
      total: 50,
      dimensions: {
        curiosity: makeDim(60),
        clarity: makeDim(50),
        action: makeDim(40),
        flow: makeDim(50),
        voice: makeDim(50),
      },
    };

    const deltas = computeEngagementDeltas(current, previous);
    expect(deltas['curiosity']).toBe(-20);
    expect(deltas['total']).toBe(-20);
  });

  it('computes zero deltas when scores are unchanged', () => {
    const score: EngagementScore = {
      total: 60,
      dimensions: {
        curiosity: makeDim(60),
        clarity: makeDim(60),
        action: makeDim(60),
        flow: makeDim(60),
        voice: makeDim(60),
      },
    };

    const deltas = computeEngagementDeltas(score, score);
    expect(deltas['curiosity']).toBe(0);
    expect(deltas['total']).toBe(0);
  });
});

describe('resolveValidationTarget', () => {
  it('resolves an explicit file path', () => {
    const filePath = path.join(tmpDir, 'test.md');
    fs.writeFileSync(filePath, validDoc, 'utf-8');
    const ctx = createOutputContext(false, true);
    const result = resolveValidationTarget(filePath, ctx);
    expect(result).toBe(filePath);
  });

  it('returns undefined for missing explicit file', () => {
    const ctx = createOutputContext(false, true);
    const result = resolveValidationTarget(path.join(tmpDir, 'nope.md'), ctx);
    expect(result).toBeUndefined();
  });
});

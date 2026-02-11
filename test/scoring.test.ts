import { describe, it, expect } from 'vitest';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import type { Root } from 'mdast';
import { computeEngagementScore, type ScoringContext } from '../src/scoring/engagement.js';

function createScoringCtx(content: string, contentType: string = 'guide'): ScoringContext {
  const ast = unified().use(remarkParse).parse(content) as Root;
  return { ast, content, contentType };
}

describe('Engagement scoring', () => {
  it('returns a total score between 0 and 100', () => {
    const ctx = createScoringCtx(
      'Have you ever struggled with documentation? This guide shows you 5 steps to great docs.',
    );
    const result = computeEngagementScore(ctx);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it('returns all five dimensions', () => {
    const ctx = createScoringCtx('Simple text.');
    const result = computeEngagementScore(ctx);
    expect(result.dimensions.curiosity).toBeDefined();
    expect(result.dimensions.clarity).toBeDefined();
    expect(result.dimensions.action).toBeDefined();
    expect(result.dimensions.flow).toBeDefined();
    expect(result.dimensions.voice).toBeDefined();
  });

  it('scores higher with engaging content', () => {
    const boring = createScoringCtx(
      'The system processes data. The API returns results. The framework handles requests.',
    );
    const engaging = createScoringCtx(
      'Have you ever wondered why your API calls are slow? You can fix this in 3 steps. ' +
      'First, you profile your endpoints. Next, you optimize your queries. ' +
      'Finally, you add caching. Congratulations — you now have a fast API!',
    );

    const boringScore = computeEngagementScore(boring);
    const engagingScore = computeEngagementScore(engaging);

    expect(engagingScore.total).toBeGreaterThan(boringScore.total);
  });

  it('dimension scores are between 0 and 100', () => {
    const ctx = createScoringCtx(
      '## Setup\n\nInstall the package.\n\n```js\nnpm install my-lib\n```\n\n## Next Steps\n\nKeep learning.',
    );
    const result = computeEngagementScore(ctx);
    for (const dim of Object.values(result.dimensions)) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(100);
    }
  });

  it('handles empty content', () => {
    const ctx = createScoringCtx('');
    const result = computeEngagementScore(ctx);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});

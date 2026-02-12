import { describe, it, expect } from 'vitest';
import { parseHumanReview } from '../src/utils/human-review.js';

describe('parseHumanReview', () => {
  const makeChecklist = (reviewSection: string) =>
    `# Checklist\n\n## Items\n- [x] Done\n\n${reviewSection}\n`;

  it('parses a valid approved review', () => {
    const content = makeChecklist(`## Human Review
- **Reviewer**: Jane Smith
- **Date**: 2026-02-10
- **Status**: approved
- **Notes**: Looks good`);
    const result = parseHumanReview(content);
    expect(result.ok).toBe(true);
    expect(result.data!.status).toBe('approved');
    expect(result.data!.reviewer).toBe('Jane Smith');
    expect(result.data!.date).toBe('2026-02-10');
    expect(result.data!.notes).toBe('Looks good');
    expect(result.data!.acknowledgedUnknowns).toBe(false);
  });

  it('parses rejected status', () => {
    const content = makeChecklist(`## Human Review
- **Reviewer**: Bob
- **Date**: 2026-02-11
- **Status**: rejected
- **Notes**: Needs work`);
    const result = parseHumanReview(content);
    expect(result.ok).toBe(true);
    expect(result.data!.status).toBe('rejected');
  });

  it('parses needs-revision status', () => {
    const content = makeChecklist(`## Human Review
- **Reviewer**: Alice
- **Date**: 2026-02-11
- **Status**: needs-revision`);
    const result = parseHumanReview(content);
    expect(result.ok).toBe(true);
    expect(result.data!.status).toBe('needs-revision');
  });

  it('extracts acknowledged_unknowns field', () => {
    const content = makeChecklist(`## Human Review
- **Reviewer**: Jane
- **Date**: 2026-02-10
- **Status**: approved
- **acknowledged_unknowns**: true`);
    const result = parseHumanReview(content);
    expect(result.ok).toBe(true);
    expect(result.data!.acknowledgedUnknowns).toBe(true);
  });

  it('returns error when section is missing', () => {
    const content = `# Checklist\n\n## Items\n- [x] Done\n`;
    const result = parseHumanReview(content);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Missing');
  });

  it('returns error when Status field is missing', () => {
    const content = makeChecklist(`## Human Review
- **Reviewer**: Jane
- **Date**: 2026-02-10`);
    const result = parseHumanReview(content);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Status');
  });

  it('returns error for invalid status value', () => {
    const content = makeChecklist(`## Human Review
- **Reviewer**: Jane
- **Date**: 2026-02-10
- **Status**: pending`);
    const result = parseHumanReview(content);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('pending');
  });

  it('handles missing optional fields gracefully', () => {
    const content = makeChecklist(`## Human Review
- **Status**: approved`);
    const result = parseHumanReview(content);
    expect(result.ok).toBe(true);
    expect(result.data!.reviewer).toBe('');
    expect(result.data!.date).toBe('');
    expect(result.data!.notes).toBe('');
  });

  it('stops at the next H2 heading', () => {
    const content = `## Human Review
- **Status**: approved
- **Reviewer**: Jane

## Another Section
- **Status**: rejected`;
    const result = parseHumanReview(content);
    expect(result.ok).toBe(true);
    expect(result.data!.status).toBe('approved');
  });
});

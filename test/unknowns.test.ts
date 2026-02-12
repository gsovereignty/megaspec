import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { scanUnknowns } from '../src/utils/human-review.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docflow-unknowns-'));
  fs.mkdirSync(path.join(tmpDir, 'drafts', 'my-doc'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeArtifact(file: string, content: string): void {
  fs.writeFileSync(path.join(tmpDir, 'drafts', 'my-doc', file), content, 'utf-8');
}

describe('scanUnknowns', () => {
  it('reports no unknowns when Agent Contributions section is absent', () => {
    writeArtifact('content.md', '# Hello\n\nSome content.\n');
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(false);
    expect(result.files).toEqual([]);
  });

  it('reports no unknowns when Unknowns subsection says "None"', () => {
    writeArtifact('content.md', `# Hello

## Agent Contributions

### Role
Writer

### Unknowns
None
`);
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(false);
  });

  it('reports no unknowns when Unknowns subsection says "N/A"', () => {
    writeArtifact('content.md', `# Hello

## Agent Contributions

### Unknowns
N/A
`);
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(false);
  });

  it('reports no unknowns when Unknowns subsection is empty', () => {
    writeArtifact('content.md', `# Hello

## Agent Contributions

### Unknowns

`);
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(false);
  });

  it('detects non-empty unknowns', () => {
    writeArtifact('content.md', `# Hello

## Agent Contributions

### Unknowns
- Is the API stable?
- What about edge cases?
`);
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(true);
    expect(result.files).toContain('content.md');
  });

  it('scans all four artifacts', () => {
    writeArtifact('content.md', '# Content\n');
    writeArtifact('outline.md', `# Outline

## Agent Contributions

### Unknowns
- Missing data
`);
    writeArtifact('research.md', `# Research

## Agent Contributions

### Unknowns
- Unverified claim
`);
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(true);
    expect(result.files).toContain('outline.md');
    expect(result.files).toContain('research.md');
    expect(result.files).not.toContain('content.md');
  });

  it('handles missing artifacts gracefully', () => {
    // No files written at all
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(false);
    expect(result.files).toEqual([]);
  });

  it('treats list items of "None" as empty', () => {
    writeArtifact('content.md', `# Hello

## Agent Contributions

### Unknowns
- None
- N/A
`);
    const result = scanUnknowns(tmpDir, 'my-doc');
    expect(result.hasUnknowns).toBe(false);
  });
});

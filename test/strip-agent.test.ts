import { describe, it, expect } from 'vitest';
import { stripAgentContributions } from '../src/utils/markdown.js';

describe('stripAgentContributions', () => {
  it('strips Agent Contributions section from end of file', () => {
    const input = `# Title

Some content.

## Agent Contributions

### Role
Writer

### Unknowns
None
`;
    const result = stripAgentContributions(input);
    expect(result).toContain('# Title');
    expect(result).toContain('Some content.');
    expect(result).not.toContain('Agent Contributions');
    expect(result).not.toContain('### Role');
    expect(result).not.toContain('### Unknowns');
  });

  it('strips Agent Contributions section between other H2 sections', () => {
    const input = `# Title

## Introduction

Hello world.

## Agent Contributions

### Role
Writer

## Conclusion

The end.
`;
    const result = stripAgentContributions(input);
    expect(result).toContain('## Introduction');
    expect(result).toContain('Hello world.');
    expect(result).toContain('## Conclusion');
    expect(result).toContain('The end.');
    expect(result).not.toContain('Agent Contributions');
    expect(result).not.toContain('### Role');
  });

  it('returns content unchanged when no Agent Contributions section exists', () => {
    const input = `# Title

## Introduction

Hello world.

## Conclusion

The end.
`;
    const result = stripAgentContributions(input);
    expect(result).toBe(input);
  });

  it('handles content with only Agent Contributions section', () => {
    const input = `---
title: Test
---

## Agent Contributions

### Role
Writer
`;
    const result = stripAgentContributions(input);
    expect(result).toContain('title: Test');
    expect(result).not.toContain('Agent Contributions');
  });
});

import { describe, it, expect } from 'vitest';
import {
  scanLlmArtifacts,
  stripLlmArtifacts,
  getDictionaryStats,
} from '../src/validators/llm-artifacts.js';

// ---------------------------------------------------------------------------
// DF-090: Dictionary completeness
// ---------------------------------------------------------------------------

describe('LLM Artifact Dictionary (DF-090)', () => {
  it('has ≥10 entries in each category', () => {
    const stats = getDictionaryStats();
    expect(stats.words).toBeGreaterThanOrEqual(10);
    expect(stats.phrases).toBeGreaterThanOrEqual(10);
    expect(stats.typographic).toBeGreaterThanOrEqual(3);
    expect(stats.structural).toBeGreaterThanOrEqual(6);
  });

  it('has ≥50 overused word roots', () => {
    const stats = getDictionaryStats();
    expect(stats.words).toBeGreaterThanOrEqual(50);
  });
});

// ---------------------------------------------------------------------------
// DF-091: Scanner — Category A (Words)
// ---------------------------------------------------------------------------

describe('LLM Artifact Scanner — Words', () => {
  it('detects overused style words', () => {
    const content = 'This guide delves into the intricacies of the topic.';
    const matches = scanLlmArtifacts(content);
    const words = matches.filter((m) => m.category === 'word');
    expect(words.length).toBeGreaterThanOrEqual(2);
    expect(words.some((m) => m.text === 'delves')).toBe(true);
    expect(words.some((m) => m.text === 'intricacies')).toBe(true);
  });

  it('detects word inflections', () => {
    const content = 'She is leveraging the robust framework.';
    const matches = scanLlmArtifacts(content);
    const words = matches.filter((m) => m.category === 'word');
    expect(words.some((m) => m.text === 'leveraging')).toBe(true);
    expect(words.some((m) => m.text === 'robust')).toBe(true);
  });

  it('provides replacement suggestions for every word match', () => {
    const content = 'A comprehensive and pivotal paradigm shift.';
    const matches = scanLlmArtifacts(content);
    for (const m of matches) {
      expect(m.replacement).toBeTruthy();
      expect(m.replacement.length).toBeGreaterThan(0);
    }
  });

  it('includes RF-19 citation in messages', () => {
    const content = 'This is a groundbreaking approach.';
    const matches = scanLlmArtifacts(content);
    expect(matches.length).toBeGreaterThan(0);
    for (const m of matches) {
      expect(m.message).toContain('[RF-19]');
    }
  });
});

// ---------------------------------------------------------------------------
// DF-091: Scanner — Category B (Typography)
// ---------------------------------------------------------------------------

describe('LLM Artifact Scanner — Typography', () => {
  it('detects em dashes', () => {
    const content = 'This is important — very important.';
    const matches = scanLlmArtifacts(content);
    const typo = matches.filter((m) => m.category === 'typography');
    expect(typo.some((m) => m.text === '—')).toBe(true);
  });

  it('detects smart quotes', () => {
    const content = 'She said \u201CHello\u201D and \u2018Goodbye\u2019.';
    const matches = scanLlmArtifacts(content);
    const typo = matches.filter((m) => m.category === 'typography');
    expect(typo.length).toBe(4);
  });

  it('detects decorative emoji', () => {
    const content = 'Great feature! 🚀 Amazing results! ✨';
    const matches = scanLlmArtifacts(content);
    const typo = matches.filter((m) => m.category === 'typography');
    expect(typo.length).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// DF-091: Scanner — Category C (Phrases)
// ---------------------------------------------------------------------------

describe('LLM Artifact Scanner — Phrases', () => {
  it('detects filler phrases', () => {
    const content = "It's worth noting that this is important.";
    const matches = scanLlmArtifacts(content);
    const phrases = matches.filter((m) => m.category === 'phrase');
    expect(phrases.length).toBeGreaterThanOrEqual(1);
    expect(phrases[0].replacement).toContain('[remove');
  });

  it('detects "in order to"', () => {
    const content = 'In order to improve performance, cache results.';
    const matches = scanLlmArtifacts(content);
    const phrases = matches.filter((m) => m.category === 'phrase');
    expect(phrases.some((m) => m.text.toLowerCase() === 'in order to')).toBe(true);
    expect(phrases.some((m) => m.replacement === 'To')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// DF-091: Scanner — Category D (Structural)
// ---------------------------------------------------------------------------

describe('LLM Artifact Scanner — Structural', () => {
  it('detects sentence-starting adverb openers', () => {
    const content = 'Additionally, this is good. Furthermore, it works.';
    const matches = scanLlmArtifacts(content);
    const structural = matches.filter((m) => m.category === 'structural');
    expect(structural.length).toBeGreaterThanOrEqual(1);
  });

  it('detects opener at line start', () => {
    const content = 'Moreover, we need to consider this.';
    const matches = scanLlmArtifacts(content);
    const structural = matches.filter((m) => m.category === 'structural');
    expect(structural.length).toBe(1);
    expect(structural[0].text).toContain('Moreover');
  });
});

// ---------------------------------------------------------------------------
// DF-091: Scanner — Skipping zones
// ---------------------------------------------------------------------------

describe('LLM Artifact Scanner — Zone Skipping', () => {
  it('skips front matter', () => {
    const content = `---
title: A comprehensive delve into the landscape
---

Clean content here.`;
    const matches = scanLlmArtifacts(content);
    expect(matches.length).toBe(0);
  });

  it('skips fenced code blocks', () => {
    const content = `Some text.

\`\`\`js
// This delves into the comprehensive landscape
const robust = true;
\`\`\`

Clean text.`;
    const matches = scanLlmArtifacts(content);
    expect(matches.length).toBe(0);
  });

  it('skips inline code', () => {
    const content = 'Use the `delve` function to explore data.';
    const matches = scanLlmArtifacts(content);
    // "delve" inside backticks is skipped, but "explore" is not an LLM word
    const wordMatches = matches.filter((m) => m.category === 'word' && m.text === 'delve');
    expect(wordMatches.length).toBe(0);
  });

  it('returns correct line numbers', () => {
    const content = `Line one.
Line two.
This is a comprehensive guide.
Line four.`;
    const matches = scanLlmArtifacts(content);
    const comp = matches.find((m) => m.text === 'comprehensive');
    expect(comp).toBeDefined();
    expect(comp!.line).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// DF-092: Strip LLM artifacts
// ---------------------------------------------------------------------------

describe('stripLlmArtifacts (DF-092)', () => {
  it('replaces overused words with first suggestion', () => {
    const content = 'This is a comprehensive guide.';
    const { cleaned, replacements } = stripLlmArtifacts(content);
    expect(cleaned).toContain('thorough');
    expect(cleaned).not.toContain('comprehensive');
    expect(replacements).toBeGreaterThan(0);
  });

  it('removes decorative emoji', () => {
    const content = 'Great feature! 🚀 Amazing!';
    const { cleaned, replacements } = stripLlmArtifacts(content);
    expect(cleaned).not.toContain('🚀');
    expect(replacements).toBeGreaterThan(0);
  });

  it('replaces em dashes', () => {
    const content = 'Important — very important.';
    const { cleaned, replacements } = stripLlmArtifacts(content);
    expect(cleaned).not.toContain('—');
    expect(cleaned).toContain(' - ');
    expect(replacements).toBeGreaterThan(0);
  });

  it('skips replacements that start with "["', () => {
    const content = "It's worth noting that this matters.";
    const { cleaned } = stripLlmArtifacts(content);
    // Phrases with [remove...] replacement are skipped
    expect(cleaned).toContain("It's worth noting that");
  });

  it('returns zero replacements for clean content', () => {
    const content = 'This is a simple guide about testing.';
    const { cleaned, replacements } = stripLlmArtifacts(content);
    expect(cleaned).toBe(content);
    expect(replacements).toBe(0);
  });
});

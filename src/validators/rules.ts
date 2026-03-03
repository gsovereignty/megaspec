import * as fs from 'node:fs';
import * as path from 'node:path';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import { syllable } from 'syllable';
import type { Heading, List, Paragraph, Code, Image, RootContent } from 'mdast';
import { validateFrontMatter } from '../utils/front-matter.js';
import { validateCrossReferences } from '../utils/cross-references.js';
import { scanLlmArtifacts } from './llm-artifacts.js';
import type { ValidationContext, Diagnostic } from './types.js';
import { registerRule } from './registry.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Remove fenced and inline code from text for prose analysis. */
function stripCodeBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
}

// ---------------------------------------------------------------------------
// Draft-structure rules (DF-020 – DF-029)
// ---------------------------------------------------------------------------

// DF-020: Front matter validation
registerRule('DF-020', (ctx: ValidationContext): Diagnostic[] => {
  return validateFrontMatter(ctx.frontMatter);
});

// DF-023: Cross-reference validation
registerRule('DF-023', (ctx: ValidationContext): Diagnostic[] => {
  return validateCrossReferences(ctx.content, ctx.projectDir);
});

// DF-024: Draft completeness
registerRule('DF-024', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const draftDir = path.join(ctx.projectDir, 'drafts', ctx.slug);
  if (!fs.existsSync(draftDir)) return diagnostics;

  const required = ['outline.md', 'content.md', 'checklist.md'];
  for (const file of required) {
    if (!fs.existsSync(path.join(draftDir, file))) {
      diagnostics.push({
        ruleId: 'DF-024',
        severity: 'FAIL',
        line: 0,
        message: `Missing required draft artifact: ${file}`,
        research: 'RF-09',
      });
    }
  }

  if (!fs.existsSync(path.join(draftDir, 'research.md'))) {
    diagnostics.push({
      ruleId: 'DF-024',
      severity: 'WARN',
      line: 0,
      message: 'Missing optional draft artifact: research.md',
      research: 'RF-14',
    });
  }

  return diagnostics;
});

// DF-025: Outline structure
registerRule('DF-025', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const outlinePath = path.join(ctx.projectDir, 'drafts', ctx.slug, 'outline.md');
  if (!fs.existsSync(outlinePath)) return diagnostics;

  const content = fs.readFileSync(outlinePath, 'utf-8');

  const requiredH2 = [
    'Reader Context',
    'Learning Outcomes',
    'Engagement Strategy',
    'Narrative Arc',
    'Visual Requirements',
    'Practice/Interaction',
  ];
  const requiredH3UnderEngagement = [
    'Opening Hook',
    'Ethos Signals',
    'Pathos Triggers',
    'Logos Structure',
    'Information Gaps',
    'Tension-Release Beats',
  ];

  for (const heading of requiredH2) {
    const pattern = new RegExp(`^## ${heading.replace('/', '\\/')}`, 'mi');
    if (!pattern.test(content)) {
      diagnostics.push({
        ruleId: 'DF-025',
        severity: 'FAIL',
        line: 0,
        message: `Outline missing required section: ## ${heading}`,
        research: 'RF-01, RF-04, RF-07, RF-10',
      });
    }
  }

  for (const heading of requiredH3UnderEngagement) {
    const pattern = new RegExp(`^### ${heading}`, 'mi');
    if (!pattern.test(content)) {
      diagnostics.push({
        ruleId: 'DF-025',
        severity: 'FAIL',
        line: 0,
        message: `Outline missing required subsection: ### ${heading}`,
        research: 'RF-01, RF-04, RF-07, RF-10',
      });
    }
  }

  return diagnostics;
});

// DF-026: Checklist Gagné events
registerRule('DF-026', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const checklistPath = path.join(ctx.projectDir, 'drafts', ctx.slug, 'checklist.md');
  if (!fs.existsSync(checklistPath)) return diagnostics;

  const content = fs.readFileSync(checklistPath, 'utf-8');

  const gagneEvents = [
    'Gain Attention',
    'State Objectives',
    'Recall Prior Knowledge',
    'Present Content',
    'Provide Guidance',
    'Elicit Performance',
    'Provide Feedback',
    'Assess Performance',
    'Enhance Retention',
  ];

  for (const event of gagneEvents) {
    if (!content.includes(event)) {
      diagnostics.push({
        ruleId: 'DF-026',
        severity: 'WARN',
        line: 0,
        message: `Checklist missing Gagné event: ${event}`,
        research: 'RF-09',
      });
    }
  }

  return diagnostics;
});

// DF-027: Research.md structure
registerRule('DF-027', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const researchPath = path.join(ctx.projectDir, 'drafts', ctx.slug, 'research.md');
  if (!fs.existsSync(researchPath)) return diagnostics;

  const content = fs.readFileSync(researchPath, 'utf-8');

  const requiredSections = ['Sources', 'Evidence', 'Assumptions/Unknowns'];
  for (const section of requiredSections) {
    const pattern = new RegExp(`^## ${section.replace('/', '\\/')}`, 'mi');
    if (!pattern.test(content)) {
      diagnostics.push({
        ruleId: 'DF-027',
        severity: 'WARN',
        line: 0,
        message: `research.md missing recommended section: ## ${section}`,
        research: 'RF-14',
      });
    }
  }

  return diagnostics;
});

// DF-028: Agent Contributions
registerRule('DF-028', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const draftDir = path.join(ctx.projectDir, 'drafts', ctx.slug);
  if (!fs.existsSync(draftDir)) return diagnostics;

  const artifacts = ['outline.md', 'content.md', 'checklist.md', 'research.md'];
  for (const artifact of artifacts) {
    const filePath = path.join(draftDir, artifact);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('## Agent Contributions')) {
      diagnostics.push({
        ruleId: 'DF-028',
        severity: 'FAIL',
        line: 0,
        message: `${artifact} missing required "## Agent Contributions" section`,
        research: '',
      });
    }
  }

  return diagnostics;
});

// DF-029: Flat publish
registerRule('DF-029', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.slug.includes('/') || ctx.slug.includes('\\')) {
    return [
      {
        ruleId: 'DF-029',
        severity: 'FAIL',
        line: 0,
        message: `Slug "${ctx.slug}" contains path separators. Published files must be flat in publish/`,
        research: '',
      },
    ];
  }
  return [];
});

// ---------------------------------------------------------------------------
// Cognitive-load rules (DF-030 – DF-036)
// ---------------------------------------------------------------------------

// DF-030: Paragraph length (max 5 sentences)
registerRule('DF-030', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  visit(ctx.ast, 'paragraph', (node: Paragraph) => {
    const text = toString(node);
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0);
    if (sentences.length > 5) {
      diagnostics.push({
        ruleId: 'DF-030',
        severity: 'WARN',
        line: node.position?.start?.line ?? 0,
        message: `Paragraph has ${sentences.length} sentences (max recommended: 5). Consider splitting for readability.`,
        research: 'RF-05, RF-11',
      });
    }
  });

  return diagnostics;
});

// DF-031: List length max (> 7 items)
registerRule('DF-031', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  visit(ctx.ast, 'list', (node: List) => {
    if (node.children.length > 7) {
      diagnostics.push({
        ruleId: 'DF-031',
        severity: 'WARN',
        line: node.position?.start?.line ?? 0,
        message: `List has ${node.children.length} items (recommended: 3-7). Cognitive load theory suggests grouping into sublists.`,
        research: 'RF-05',
      });
    }
  });

  return diagnostics;
});

// DF-032: List length min (< 3 items)
registerRule('DF-032', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  visit(ctx.ast, 'list', (node: List) => {
    if (node.children.length < 3) {
      diagnostics.push({
        ruleId: 'DF-032',
        severity: 'WARN',
        line: node.position?.start?.line ?? 0,
        message: `List has only ${node.children.length} items. Consider using prose instead, or combining with an adjacent list.`,
        research: 'RF-05',
      });
    }
  });

  return diagnostics;
});

// DF-033: Section density (> 500 words without subheading)
registerRule('DF-033', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const headings: { text: string; line: number; index: number }[] = [];

  ctx.ast.children.forEach((node: RootContent, index: number) => {
    if (node.type === 'heading') {
      headings.push({
        text: toString(node as Heading),
        line: node.position?.start?.line ?? 0,
        index,
      });
    }
  });

  for (let i = 0; i < headings.length; i++) {
    const startIdx = headings[i].index + 1;
    const endIdx = i + 1 < headings.length ? headings[i + 1].index : ctx.ast.children.length;

    let wordCount = 0;
    for (let j = startIdx; j < endIdx; j++) {
      const node = ctx.ast.children[j];
      if (node.type === 'heading') break;
      wordCount += toString(node).split(/\s+/).filter((w) => w.length > 0).length;
    }

    if (wordCount > 500) {
      diagnostics.push({
        ruleId: 'DF-033',
        severity: 'WARN',
        line: headings[i].line,
        message: `Section "${headings[i].text}" is ${wordCount} words without a subheading. Consider breaking into subsections.`,
        research: 'RF-05, RF-11',
      });
    }
  }

  return diagnostics;
});

// DF-034: Code comment validator (tutorial only)
registerRule('DF-034', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'tutorial') return [];
  const diagnostics: Diagnostic[] = [];

  visit(ctx.ast, 'code', (node: Code) => {
    const lines = node.value.split('\n');
    if (lines.length <= 3) return;

    const commentPatterns = ['//', '#', '/*', '*/', '--', '<!--', '%', ';'];
    const hasComment = lines.some((line: string) =>
      commentPatterns.some((p) => line.trim().startsWith(p)),
    );

    if (!hasComment) {
      diagnostics.push({
        ruleId: 'DF-034',
        severity: 'FAIL',
        line: node.position?.start?.line ?? 0,
        message: 'Code block has no explanatory comments. Tutorials require annotated examples.',
        research: 'RF-06',
      });
    }
  });

  return diagnostics;
});

// DF-035: Worked example ordering (tutorial only)
registerRule('DF-035', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'tutorial') return [];
  const diagnostics: Diagnostic[] = [];

  const exerciseKeywords = ['exercise', 'try it', 'practice', 'your turn', 'challenge'];
  let foundCodeExample = false;

  for (const node of ctx.ast.children) {
    if (node.type === 'code') foundCodeExample = true;
    if (node.type === 'heading') {
      const text = toString(node).toLowerCase();
      if (exerciseKeywords.some((kw) => text.includes(kw))) {
        if (!foundCodeExample) {
          diagnostics.push({
            ruleId: 'DF-035',
            severity: 'FAIL',
            line: node.position?.start?.line ?? 0,
            message: 'Exercise appears before any worked example. Tutorials must demonstrate before asking readers to practice.',
            research: 'RF-06',
          });
        }
      }
    }
  }

  return diagnostics;
});

// DF-036: Code-prose proximity
registerRule('DF-036', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const children = ctx.ast.children;

  for (let i = 0; i < children.length; i++) {
    if (children[i].type !== 'code') continue;
    const codeLine = children[i].position?.start?.line ?? 0;

    let nearestParagraphDist = Infinity;

    for (let j = i - 1; j >= 0 && j >= i - 4; j--) {
      if (children[j].type === 'paragraph') {
        const pLine = children[j].position?.end?.line ?? 0;
        nearestParagraphDist = Math.min(nearestParagraphDist, codeLine - pLine);
        break;
      }
    }

    for (let j = i + 1; j < children.length && j <= i + 4; j++) {
      if (children[j].type === 'paragraph') {
        const pLine = children[j].position?.start?.line ?? 0;
        const codeEnd = children[i].position?.end?.line ?? 0;
        nearestParagraphDist = Math.min(nearestParagraphDist, pLine - codeEnd);
        break;
      }
    }

    if (nearestParagraphDist > 3) {
      diagnostics.push({
        ruleId: 'DF-036',
        severity: 'WARN',
        line: codeLine,
        message: 'Code block may be too far from its explanation. Keep code and explanation adjacent.',
        research: 'RF-05, RF-08',
      });
    }
  }

  return diagnostics;
});

// ---------------------------------------------------------------------------
// Engagement rules (DF-040 – DF-047)
// ---------------------------------------------------------------------------

// DF-040: Opening hook
registerRule('DF-040', (ctx: ValidationContext): Diagnostic[] => {
  const words = ctx.content.split(/\s+/).filter((w) => w.length > 0);
  const first200 = words.slice(0, 200).join(' ');

  const hasQuestion = first200.includes('?');
  const hasProblem = /\byou\b.*?\b(struggle|need|want|wonder|frustrated|confused|stuck|wish|tired)\b/i.test(first200);
  const hasStat = /\d+\s*(percent|%|times|x|ways|steps|reasons|things|mistakes)/i.test(first200);
  const hasOutcome = /(you will learn|you'll be able to|by the end|after reading)/i.test(first200);

  if (!hasQuestion && !hasProblem && !hasStat && !hasOutcome) {
    return [
      {
        ruleId: 'DF-040',
        severity: 'FAIL',
        line: 1,
        message: 'Opening lacks an engagement hook in the first 200 words. Start with a question, relatable problem, surprising statistic, or clear outcome promise.',
        research: 'RF-04, RF-01',
      },
    ];
  }
  return [];
});

// DF-041: Question-before-answer
registerRule('DF-041', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const children = ctx.ast.children;
  const skipSections = ['prerequisites', 'introduction', 'next steps', 'summary', 'references'];

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type !== 'heading' || (node as Heading).depth !== 2) continue;

    const headingText = toString(node);
    if (skipSections.some((s) => headingText.toLowerCase().includes(s))) continue;

    for (let j = i + 1; j < children.length; j++) {
      if (children[j].type === 'heading') break;
      if (children[j].type === 'paragraph') {
        const text = toString(children[j]);
        const hasQuestionWords = /\b(problem|challenge|issue|difficult|struggle|why|how|what if|wonder|question)\b/i.test(text);
        const hasAnswerWords = /\b(solution|answer|here's how|simply|just)\b/i.test(text);

        if (hasAnswerWords && !hasQuestionWords && !text.includes('?')) {
          diagnostics.push({
            ruleId: 'DF-041',
            severity: 'WARN',
            line: node.position?.start?.line ?? 0,
            message: `Section "${headingText}" provides answers without first posing a question or problem.`,
            research: 'RF-04, RF-03',
          });
        }
        break;
      }
    }
  }

  return diagnostics;
});

// DF-042: Example presence (tutorials/guides)
registerRule('DF-042', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'tutorial' && ctx.contentType !== 'guide') return [];
  const diagnostics: Diagnostic[] = [];
  const children = ctx.ast.children;
  const exemptSections = ['prerequisites', 'introduction', 'next steps', 'summary'];

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.type !== 'heading' || (node as Heading).depth !== 2) continue;
    const headingText = toString(node).toLowerCase();
    if (exemptSections.some((s) => headingText.includes(s))) continue;

    let hasExample = false;
    for (let j = i + 1; j < children.length; j++) {
      if (children[j].type === 'heading' && (children[j] as Heading).depth <= 2) break;
      if (children[j].type === 'heading') {
        const subText = toString(children[j]).toLowerCase();
        if (subText.includes('example') || subText.includes('use case')) {
          hasExample = true;
          break;
        }
      }
      if (children[j].type === 'code') {
        hasExample = true;
        break;
      }
    }

    if (!hasExample) {
      diagnostics.push({
        ruleId: 'DF-042',
        severity: 'FAIL',
        line: node.position?.start?.line ?? 0,
        message: `Section "${toString(node)}" has no example or code. Every major concept needs at least one concrete illustration.`,
        research: 'RF-06, RF-16',
      });
    }
  }

  return diagnostics;
});

// DF-043: Placeholder names in code
registerRule('DF-043', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const blocklist = [
    'foo', 'bar', 'baz', 'qux', 'quux', 'myvar', 'myfunc',
    'myclass', 'dosomething', 'someclass', 'placeholder',
  ];

  visit(ctx.ast, 'code', (node: Code) => {
    const value = node.value.toLowerCase();
    for (const name of blocklist) {
      if (value.includes(name)) {
        diagnostics.push({
          ruleId: 'DF-043',
          severity: 'WARN',
          line: node.position?.start?.line ?? 0,
          message: `Generic placeholder "${name}" found in code. Use domain-specific names for concrete examples.`,
          research: 'RF-16',
        });
        break;
      }
    }
  });

  return diagnostics;
});

// DF-044: Step numbering (tutorial)
registerRule('DF-044', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'tutorial') return [];

  const hasSteps = /step\s+\d+/i.test(ctx.content);
  const hasProgress = /step\s+\d+\s+of\s+\d+|\(\d+\/\d+\)/i.test(ctx.content);

  if (hasSteps && !hasProgress) {
    return [
      {
        ruleId: 'DF-044',
        severity: 'WARN',
        line: 0,
        message: 'Steps found but no progress indicators (e.g., "Step 3 of 7"). Progress signals increase completion rates.',
        research: 'RF-15, RF-13',
      },
    ];
  }
  return [];
});

// DF-045: Next steps
registerRule('DF-045', (ctx: ValidationContext): Diagnostic[] => {
  const nextStepsPatterns = [
    'next steps', "what's next", 'where to go', 'further reading',
    'continue', 'keep learning', 'related',
  ];

  const lines = ctx.content.split('\n');
  const lastPortion = lines.slice(Math.floor(lines.length * 0.8)).join('\n').toLowerCase();

  if (!nextStepsPatterns.some((p) => lastPortion.includes(p))) {
    return [
      {
        ruleId: 'DF-045',
        severity: 'WARN',
        line: 0,
        message: 'Document lacks a forward-linking section at the end. Add "Next Steps" to maintain reader momentum.',
        research: 'RF-04, RF-13',
      },
    ];
  }
  return [];
});

// DF-046: Transitions between sections
registerRule('DF-046', (ctx: ValidationContext): Diagnostic[] => {
  const transitionPhrases = [
    'next', 'now that', "let's", 'with that', 'building on',
    'moving on', 'so far', 'having', 'before we',
  ];

  const children = ctx.ast.children;
  const h2Indices: number[] = [];

  children.forEach((node: RootContent, idx: number) => {
    if (node.type === 'heading' && (node as Heading).depth === 2) {
      h2Indices.push(idx);
    }
  });

  if (h2Indices.length <= 1) return [];

  let missing = 0;
  const total = h2Indices.length - 1;

  for (let i = 0; i < h2Indices.length - 1; i++) {
    let found = false;
    for (let j = h2Indices[i + 1] - 1; j > h2Indices[i]; j--) {
      if (children[j].type === 'paragraph') {
        const text = toString(children[j]).toLowerCase();
        if (transitionPhrases.some((p) => text.includes(p))) found = true;
        break;
      }
    }
    if (!found) missing++;
  }

  if (total > 0 && missing / total > 0.5) {
    return [
      {
        ruleId: 'DF-046',
        severity: 'WARN',
        line: 0,
        message: `${Math.round((missing / total) * 100)}% of section transitions lack momentum phrases. Use "Now that you've...", "Next, we'll..." to maintain flow.`,
        research: 'RF-04, RF-02',
      },
    ];
  }
  return [];
});

// DF-047: Narrative arc (tutorial)
registerRule('DF-047', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'tutorial') return [];
  const diagnostics: Diagnostic[] = [];

  const lines = ctx.content.split('\n');
  const first20pct = lines.slice(0, Math.ceil(lines.length * 0.2)).join('\n').toLowerCase();
  const last20pct = lines.slice(Math.floor(lines.length * 0.8)).join('\n').toLowerCase();

  const setupPatterns = ['prerequisite', 'goal', "what you'll build", 'what you will build', 'learning objective', 'by the end'];
  if (!setupPatterns.some((p) => first20pct.includes(p))) {
    diagnostics.push({
      ruleId: 'DF-047',
      severity: 'WARN',
      line: 0,
      message: 'Tutorial missing setup act (prerequisites, goals, or "what you\'ll build" in the opening).',
      research: 'RF-02, RF-18',
    });
  }

  const resolutionPatterns = ['congratulations', "you've built", 'you now have', 'you can now', 'you have successfully'];
  if (!resolutionPatterns.some((p) => last20pct.includes(p))) {
    diagnostics.push({
      ruleId: 'DF-047',
      severity: 'WARN',
      line: 0,
      message: 'Tutorial missing resolution act (success confirmation in the conclusion).',
      research: 'RF-02, RF-18',
    });
  }

  return diagnostics;
});

// ---------------------------------------------------------------------------
// Readability rules (DF-050 – DF-055)
// ---------------------------------------------------------------------------

// DF-050: Flesch-Kincaid Grade Level
registerRule('DF-050', (ctx: ValidationContext): Diagnostic[] => {
  const text = stripCodeBlocks(ctx.content);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (words.length === 0 || sentences.length === 0) return [];

  let totalSyllables = 0;
  for (const word of words) {
    const cleaned = word.replace(/[^a-zA-Z]/g, '');
    if (cleaned.length > 0) totalSyllables += syllable(cleaned);
  }

  const fk =
    0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) -
    15.59;

  const targets: Record<string, number> = {
    tutorial: 8,
    reference: 10,
    guide: 10,
    whitepaper: 12,
    'religious-text': 10,
  };
  const target = targets[ctx.contentType] ?? 10;

  if (fk > target) {
    return [
      {
        ruleId: 'DF-050',
        severity: 'WARN',
        line: 0,
        message: `Flesch-Kincaid Grade Level is ${fk.toFixed(1)} (target: ≤${target} for ${ctx.contentType}). Consider shorter sentences and simpler vocabulary.`,
        research: 'RF-11',
      },
    ];
  }
  return [];
});

// DF-051: Sentence length
registerRule('DF-051', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const text = stripCodeBlocks(ctx.content);
  const rawLines = ctx.content.split('\n');
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);

  for (const sentence of sentences) {
    const wordCount = sentence.split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount > 30) {
      const snippet = sentence.trim().slice(0, 30);
      let line = 0;
      for (let i = 0; i < rawLines.length; i++) {
        if (rawLines[i].includes(snippet)) {
          line = i + 1;
          break;
        }
      }
      diagnostics.push({
        ruleId: 'DF-051',
        severity: 'WARN',
        line,
        message: `Sentence has ${wordCount} words (max recommended: 30). "${sentence.split(/\s+/).slice(0, 8).join(' ')}..."`,
        research: 'RF-05, RF-11',
      });
    }
  }

  return diagnostics;
});

// DF-052: Passive voice
registerRule('DF-052', (ctx: ValidationContext): Diagnostic[] => {
  const text = stripCodeBlocks(ctx.content);
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return [];

  const passivePattern = /\b(is|are|was|were|been|being|be)\s+\w+ed\b/i;
  let passiveCount = 0;

  for (const sentence of sentences) {
    if (passivePattern.test(sentence)) passiveCount++;
  }

  const ratio = passiveCount / sentences.length;
  const threshold = ctx.contentType === 'whitepaper' ? 0.35 : 0.2;

  if (ratio > threshold) {
    return [
      {
        ruleId: 'DF-052',
        severity: 'WARN',
        line: 0,
        message: `Passive voice detected in ${Math.round(ratio * 100)}% of sentences (max: ${Math.round(threshold * 100)}%). Use active voice for clarity.`,
        research: 'RF-17',
      },
    ];
  }
  return [];
});

// DF-053: Reader-focus analyzer
registerRule('DF-053', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType === 'whitepaper') return [];

  const text = stripCodeBlocks(ctx.content).toLowerCase();
  const readerPronouns = (text.match(/\b(you|your|you'll|you've)\b/gi) || []).length;
  const systemPhrases = (
    text.match(/\b(the api|the system|the tool|the library|the framework|the module|the service|the platform)\b/gi) || []
  ).length;

  if (systemPhrases > 0 && readerPronouns < systemPhrases / 2) {
    return [
      {
        ruleId: 'DF-053',
        severity: 'WARN',
        line: 0,
        message: `Reader focus ratio is ${readerPronouns}:${systemPhrases} (you:system). Rewrite system-centric sentences to center the reader.`,
        research: 'RF-17',
      },
    ];
  }
  return [];
});

// DF-054: Heading descriptiveness
registerRule('DF-054', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const vagueHeadings = [
    'overview', 'details', 'miscellaneous', 'notes', 'general',
    'background', 'other', 'more', 'info', 'additional',
  ];

  visit(ctx.ast, 'heading', (node: Heading) => {
    const text = toString(node).trim().toLowerCase();
    if (vagueHeadings.includes(text)) {
      diagnostics.push({
        ruleId: 'DF-054',
        severity: 'WARN',
        line: node.position?.start?.line ?? 0,
        message: `Heading "${toString(node)}" is non-descriptive. Use keyword-rich headings that readers can scan.`,
        research: 'RF-11',
      });
    }
  });

  return diagnostics;
});

// DF-055: Topic sentence frontloading
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'also', 'am', 'an',
  'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does',
  'doing', 'down', 'during', 'each', 'even', 'few', 'for', 'from', 'further',
  'get', 'gets', 'got', 'had', 'has', 'have', 'having', 'he', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'just', 'like', 'may', 'me', 'might', 'more',
  'most', 'must', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 'same', 'shall', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'us',
  'use', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves',
]);

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z]{2,}/g)?.filter((w) => !STOPWORDS.has(w)) ?? [];
}

registerRule('DF-055', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  visit(ctx.ast, 'paragraph', (node: Paragraph) => {
    const text = toString(node);
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0);
    if (sentences.length <= 1) return;

    // Tokenize all sentences, count word frequency
    const allTokens = tokenize(text);
    if (allTokens.length === 0) return;

    const freq = new Map<string, number>();
    const firstOccurrence = new Map<string, number>();
    for (let i = 0; i < allTokens.length; i++) {
      const w = allTokens[i];
      freq.set(w, (freq.get(w) ?? 0) + 1);
      if (!firstOccurrence.has(w)) firstOccurrence.set(w, i);
    }

    // Find dominant keyword (highest freq, ties broken by first occurrence)
    let dominant = '';
    let maxFreq = 0;
    let earliestPos = Infinity;
    for (const [word, count] of freq) {
      if (count > maxFreq || (count === maxFreq && (firstOccurrence.get(word) ?? 0) < earliestPos)) {
        dominant = word;
        maxFreq = count;
        earliestPos = firstOccurrence.get(word) ?? 0;
      }
    }

    if (!dominant || maxFreq < 2) return; // Need at least 2 occurrences to be "dominant"

    // Check which sentence the dominant keyword first appears in
    for (let s = 0; s < sentences.length; s++) {
      const sentenceTokens = tokenize(sentences[s]);
      if (sentenceTokens.includes(dominant)) {
        if (s > 0) {
          diagnostics.push({
            ruleId: 'DF-055',
            severity: 'WARN',
            line: node.position?.start?.line ?? 0,
            message: `Paragraph may not frontload its main point. The key topic "${dominant}" first appears in sentence ${s + 1}. Move it to the opening sentence for scanability.`,
            research: 'RF-11',
          });
        }
        break;
      }
    }
  });

  return diagnostics;
});

// ---------------------------------------------------------------------------
// Visual-support rules (DF-056 – DF-059)
// ---------------------------------------------------------------------------

// DF-056: Visual density
registerRule('DF-056', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const conceptualKeywords = [
    'explain', 'understand', 'concept', 'theory', 'approach',
    'how it works', 'architecture',
  ];

  const children = ctx.ast.children;
  const headings: { text: string; line: number; index: number }[] = [];

  children.forEach((node: RootContent, index: number) => {
    if (node.type === 'heading') {
      headings.push({
        text: toString(node as Heading),
        line: node.position?.start?.line ?? 0,
        index,
      });
    }
  });

  for (let i = 0; i < headings.length; i++) {
    const startIdx = headings[i].index + 1;
    const endIdx = i + 1 < headings.length ? headings[i + 1].index : children.length;

    let wordCount = 0;
    let hasVisual = false;

    for (let j = startIdx; j < endIdx; j++) {
      const node = children[j];
      if (node.type === 'code') { hasVisual = true; break; }
      if (node.type === 'paragraph') {
        const text = toString(node);
        if (text.includes('![')) { hasVisual = true; break; }
        wordCount += text.split(/\s+/).filter((w) => w.length > 0).length;
      }
    }

    if (wordCount > 300 && !hasVisual) {
      const sectionContent = (headings[i].text + ' ' +
        children.slice(startIdx, endIdx).map((n: RootContent) => toString(n)).join(' ')).toLowerCase();
      if (conceptualKeywords.some((kw) => sectionContent.includes(kw))) {
        diagnostics.push({
          ruleId: 'DF-056',
          severity: 'WARN',
          line: headings[i].line,
          message: `Section "${headings[i].text}" is ${wordCount} words with no visual aids. Add a diagram, image, or code example.`,
          research: 'RF-08',
        });
      }
    }
  }

  return diagnostics;
});

// DF-057: Diagram suggestion
registerRule('DF-057', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const diagramKeywords = [
    'architecture', 'flow', 'pipeline', 'hierarchy', 'tree',
    'state machine', 'lifecycle', 'sequence', 'relationship',
    'structure', 'topology',
  ];

  const children = ctx.ast.children;
  const headings: { text: string; line: number; index: number }[] = [];

  children.forEach((node: RootContent, index: number) => {
    if (node.type === 'heading') {
      headings.push({
        text: toString(node as Heading),
        line: node.position?.start?.line ?? 0,
        index,
      });
    }
  });

  for (let i = 0; i < headings.length; i++) {
    const startIdx = headings[i].index + 1;
    const endIdx = i + 1 < headings.length ? headings[i + 1].index : children.length;

    const sectionContent = (headings[i].text + ' ' +
      children.slice(startIdx, endIdx).map((n: RootContent) => toString(n)).join(' ')).toLowerCase();

    const matchedKeyword = diagramKeywords.find((kw) => sectionContent.includes(kw));
    if (!matchedKeyword) continue;

    let hasDiagram = false;
    for (let j = startIdx; j < endIdx; j++) {
      const node = children[j];
      if (node.type === 'code' && (node as Code).lang === 'mermaid') { hasDiagram = true; break; }
      if (node.type === 'paragraph' && toString(node).includes('![')) { hasDiagram = true; break; }
    }

    if (!hasDiagram) {
      diagnostics.push({
        ruleId: 'DF-057',
        severity: 'WARN',
        line: headings[i].line,
        message: `Section discusses "${matchedKeyword}" but contains no diagram. Consider adding a visual representation.`,
        research: 'RF-08',
      });
    }
  }

  return diagnostics;
});

// DF-058: Image alt text
registerRule('DF-058', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  visit(ctx.ast, 'image', (node: Image) => {
    if (!node.alt || node.alt.trim() === '') {
      diagnostics.push({
        ruleId: 'DF-058',
        severity: 'FAIL',
        line: node.position?.start?.line ?? 0,
        message: 'Image has no alt text. Alt text is required for accessibility and SEO.',
        research: 'RF-08',
      });
    }
  });

  return diagnostics;
});

// DF-059: Image path
registerRule('DF-059', (ctx: ValidationContext): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  visit(ctx.ast, 'image', (node: Image) => {
    const imgPath = node.url;
    if (!imgPath || imgPath.startsWith('http://') || imgPath.startsWith('https://')) return;

    const resolvedPath = path.resolve(path.dirname(ctx.filePath), imgPath);
    if (!fs.existsSync(resolvedPath)) {
      diagnostics.push({
        ruleId: 'DF-059',
        severity: 'FAIL',
        line: node.position?.start?.line ?? 0,
        message: `Image path "${imgPath}" does not exist.`,
        research: '',
      });
    }
  });

  return diagnostics;
});

// ---------------------------------------------------------------------------
// Mind Virus / Replicative Fitness rules (DF-070 – DF-076)
// Religious-text / mind-virus specific structural validation
// ---------------------------------------------------------------------------

// DF-070: Memetic lifecycle coverage
// Every mind virus must survive four stages: Assimilation, Retention, Expression, Transmission
registerRule('DF-070', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'religious-text') return [];
  const diagnostics: Diagnostic[] = [];
  const text = stripCodeBlocks(ctx.content).toLowerCase();

  // Assimilation — attention capture in opening
  const words = ctx.content.split(/\s+/).filter((w) => w.length > 0);
  const first200 = words.slice(0, 200).join(' ').toLowerCase();
  const hasAssimilation =
    first200.includes('?') ||
    /\b(behold|hear|listen|woe|arise|lo|verily|truly)\b/.test(first200) ||
    /\b(fear|threat|danger|death|life|eternal)\b/.test(first200);

  if (!hasAssimilation) {
    diagnostics.push({
      ruleId: 'DF-070',
      severity: 'WARN',
      line: 1,
      message: 'Memetic lifecycle: Assimilation stage weak. Opening lacks an attention-capturing hook (question, invocation, or emotional trigger).',
      research: 'RF-04',
    });
  }

  // Retention — memorable structures (repetition, parallelism, vocabulary)
  const hasRepetition = /(\b\w{4,}\b).*\1.*\1/s.test(text);
  const hasVocabulary = /\b(?:means|refers to|is defined as|signifies|called|known as)\b/.test(text);
  if (!hasRepetition && !hasVocabulary) {
    diagnostics.push({
      ruleId: 'DF-070',
      severity: 'WARN',
      line: 0,
      message: 'Memetic lifecycle: Retention stage weak. Text lacks memorable devices (repetition, introduced vocabulary, or mnemonic structures).',
      research: 'RF-05',
    });
  }

  // Expression — the text must give readers language to use
  const expressionMarkers = [
    'remember', 'tell', 'share', 'say', 'proclaim', 'declare',
    'let your', 'speak', 'teach', 'pass on', 'hand down',
  ];
  if (!expressionMarkers.some((m) => text.includes(m))) {
    diagnostics.push({
      ruleId: 'DF-070',
      severity: 'WARN',
      line: 0,
      message: 'Memetic lifecycle: Expression stage weak. Text provides no activation language for readers to retrieve and communicate the idea.',
      research: 'RF-04',
    });
  }

  // Transmission — explicit or implicit propagation imperative
  const transmissionMarkers = [
    'go and', 'spread', 'tell others', 'make disciples',
    'bear witness', 'testify', 'evangelize', 'preach',
    'teach all nations', 'every creature', 'the word must',
  ];
  if (!transmissionMarkers.some((m) => text.includes(m))) {
    diagnostics.push({
      ruleId: 'DF-070',
      severity: 'WARN',
      line: 0,
      message: 'Memetic lifecycle: Transmission stage weak. Text lacks a propagation imperative (native sharing impulse or commission).',
      research: 'RF-04',
    });
  }

  return diagnostics;
});

// DF-071: Transmission compulsion — native sharing imperative
registerRule('DF-071', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'religious-text') return [];
  const text = stripCodeBlocks(ctx.content).toLowerCase();

  const nativeImperatives = [
    'must', 'shall', 'command', 'compel', 'duty', 'obligation',
    'cannot be silent', "can't stay silent", 'woe to me if',
    'the word burns', 'fire in my bones', 'constrained',
  ];
  const externalImperatives = [
    'share this', 'repost', 'forward this', 'send to',
    'click here', 'subscribe',
  ];

  const nativeHits = nativeImperatives.filter((p) => text.includes(p)).length;
  const externalHits = externalImperatives.filter((p) => text.includes(p)).length;

  const diagnostics: Diagnostic[] = [];

  if (nativeHits === 0) {
    diagnostics.push({
      ruleId: 'DF-071',
      severity: 'WARN',
      line: 0,
      message: 'Text lacks a native transmission imperative. The sharing compulsion should emerge from the content itself, not from external instructions.',
      research: 'RF-04',
    });
  }

  if (externalHits > 0) {
    diagnostics.push({
      ruleId: 'DF-071',
      severity: 'WARN',
      line: 0,
      message: `Text uses ${externalHits} external sharing instruction(s) (e.g., "share this"). Native imperatives (moral obligation, warning frames) are more potent than bolted-on calls to action.`,
      research: 'RF-04',
    });
  }

  return diagnostics;
});

// DF-072: Hook-payload alignment
// The emotional tone of the hook must match the payload
registerRule('DF-072', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'religious-text') return [];
  const text = stripCodeBlocks(ctx.content);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 400) return []; // Too short to measure mismatch

  const first200 = words.slice(0, 200).join(' ').toLowerCase();
  const rest = words.slice(200).join(' ').toLowerCase();

  // Measure emotional intensity in hook vs payload
  const emotionalWords = [
    'fear', 'death', 'love', 'hope', 'wrath', 'joy', 'terror',
    'glory', 'blessing', 'curse', 'salvation', 'destruction',
    'mercy', 'judgement', 'peace', 'war', 'eternal', 'hell', 'heaven',
  ];

  const hookIntensity = emotionalWords.filter((w) => first200.includes(w)).length;
  const payloadIntensity = emotionalWords.filter((w) => rest.includes(w)).length;

  // If hook is highly emotional but payload is flat, or vice versa
  if (hookIntensity >= 4 && payloadIntensity <= 1) {
    return [{
      ruleId: 'DF-072',
      severity: 'WARN',
      line: 1,
      message: 'Hook-payload mismatch. The opening is highly emotional but the payload is flat. Readers will feel bait-and-switched.',
      research: 'RF-04',
    }];
  }
  if (hookIntensity <= 1 && payloadIntensity >= 5) {
    return [{
      ruleId: 'DF-072',
      severity: 'WARN',
      line: 1,
      message: 'Hook-payload mismatch. The opening is flat but the payload is emotionally intense. The hook may fail to capture attention before the payload can land.',
      research: 'RF-04',
    }];
  }

  return [];
});

// DF-073: Epistemic armor visibility
// Defense mechanisms must feel explanatory, not defensive
registerRule('DF-073', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'religious-text') return [];
  const text = stripCodeBlocks(ctx.content).toLowerCase();

  const obviousDefense = [
    "don't listen to", "don't believe", 'ignore anyone who',
    'they are lying', 'all critics are', 'never question',
    'do not question', 'questioning is forbidden',
  ];

  const diagnostics: Diagnostic[] = [];
  const rawLines = ctx.content.split('\n');

  for (const phrase of obviousDefense) {
    if (text.includes(phrase)) {
      let line = 0;
      for (let i = 0; i < rawLines.length; i++) {
        if (rawLines[i].toLowerCase().includes(phrase)) {
          line = i + 1;
          break;
        }
      }
      diagnostics.push({
        ruleId: 'DF-073',
        severity: 'WARN',
        line,
        message: `Visible epistemic armor detected ("${phrase}"). Defense mechanisms should feel like accurate descriptions of reality, not pre-programmed defensive instructions.`,
        research: 'RF-04',
      });
    }
  }

  return diagnostics;
});

// DF-074: Identity architecture — in-group/out-group structure
registerRule('DF-074', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'religious-text') return [];
  const text = stripCodeBlocks(ctx.content).toLowerCase();

  const diagnostics: Diagnostic[] = [];

  // Must have in-group language
  const inGroupMarkers = ['we', 'us', 'our', 'brethren', 'brothers', 'sisters', 'the faithful', 'the elect', 'children of'];
  const hasInGroup = inGroupMarkers.some((m) => text.includes(m));

  // Must have transformation narrative
  const transformMarkers = [
    'born again', 'new creation', 'transformed', 'renewed', 'converted',
    'awakened', 'once was', 'now', 'before', 'after', 'no longer', 'made new',
  ];
  const hasTransform = transformMarkers.filter((m) => text.includes(m)).length >= 2;

  if (!hasInGroup) {
    diagnostics.push({
      ruleId: 'DF-074',
      severity: 'WARN',
      line: 0,
      message: 'Text lacks in-group identity markers. Religious texts need shared vocabulary, community language ("we", "us", "brethren") to build identity binding.',
      research: 'RF-04',
    });
  }

  if (!hasTransform) {
    diagnostics.push({
      ruleId: 'DF-074',
      severity: 'WARN',
      line: 0,
      message: 'Text lacks a transformation narrative (before/after discontinuity). Identity binding requires the reader to experience a change that creates an identity stake.',
      research: 'RF-04',
    });
  }

  return diagnostics;
});

// DF-075: Deep structure / surface content separation
registerRule('DF-075', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'religious-text') return [];
  const text = stripCodeBlocks(ctx.content).toLowerCase();

  const universalPatterns = [
    ['danger', 'threat', 'protect', 'survive'],
    ['betray', 'trust', 'deceive', 'loyalty'],
    ['purpose', 'meaning', 'destiny', 'plan'],
    ['truth', 'wisdom', 'knowledge', 'understanding'],
    ['lose', 'lost', 'forfeit', 'regret'],
    ['community', 'family', 'tribe', 'people'],
    ['unclean', 'impure', 'corrupt', 'defile'],
    ['honor', 'glory', 'worthy', 'chosen'],
  ];

  let patternsHit = 0;
  for (const group of universalPatterns) {
    if (group.some((kw) => text.includes(kw))) patternsHit++;
  }

  if (patternsHit < 3) {
    return [{
      ruleId: 'DF-075',
      severity: 'WARN',
      line: 0,
      message: `Text maps to only ${patternsHit}/8 universal psychological patterns (threat, betrayal, meaning, truth, loss, loyalty, purity, status). Aim for ≥3 to improve cross-cultural adaptability.`,
      research: 'RF-04',
    }];
  }
  return [];
});

// DF-076: Environmental feedback loop
registerRule('DF-076', (ctx: ValidationContext): Diagnostic[] => {
  if (ctx.contentType !== 'religious-text') return [];
  const text = stripCodeBlocks(ctx.content).toLowerCase();

  const urgencyMarkers = [
    'now is the time', 'the hour has come', 'today is the day',
    'time is short', 'the day is near', 'do not delay',
  ];
  const hasUrgency = urgencyMarkers.some((m) => text.includes(m));

  const selfSustainMarkers = [
    'every day', 'daily', 'continual', 'eternal', 'generation to generation',
    'forevermore', 'until the end', 'without ceasing',
  ];
  const hasSelfSustain = selfSustainMarkers.some((m) => text.includes(m));

  if (!hasUrgency && !hasSelfSustain) {
    return [{
      ruleId: 'DF-076',
      severity: 'WARN',
      line: 0,
      message: 'Text lacks an internal urgency mechanism or self-sustaining temporal frame. Without either, the text depends entirely on external crisis conditions to remain relevant.',
      research: 'RF-04',
    }];
  }
  return [];
});

// ---------------------------------------------------------------------------
// LLM Artifact Detection (DF-091)
// ---------------------------------------------------------------------------

registerRule('DF-091', (ctx: ValidationContext): Diagnostic[] => {
  const matches = scanLlmArtifacts(ctx.rawContent);
  return matches.map((m) => ({
    ruleId: 'DF-091',
    severity: 'WARN' as const,
    line: m.line,
    message: m.message,
    research: 'RF-19',
  }));
});

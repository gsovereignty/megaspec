import { syllable } from 'syllable';
import type { Root, Heading, Code, RootContent } from 'mdast';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DimensionScore {
  score: number; // 0-100
  label: string;
  details: string;
}

export interface EngagementScore {
  total: number; // 0-100, weighted average
  dimensions: {
    curiosity: DimensionScore;
    clarity: DimensionScore;
    action: DimensionScore;
    flow: DimensionScore;
    voice: DimensionScore;
  };
}

export interface ScoringContext {
  ast: Root;
  content: string; // prose (no front matter)
  contentType: string;
}

// Default weights per PRD
const WEIGHTS = {
  curiosity: 0.25,
  clarity: 0.25,
  action: 0.20,
  flow: 0.15,
  voice: 0.15,
};

// ---------------------------------------------------------------------------
// Helper: strip code blocks from text
// ---------------------------------------------------------------------------

function stripCode(text: string): string {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
}

// ---------------------------------------------------------------------------
// Dimension scorers
// ---------------------------------------------------------------------------

/** Curiosity: questions, information gaps, hooks */
function scoreCuriosity(ctx: ScoringContext): DimensionScore {
  const text = stripCode(ctx.content);
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return { score: 0, label: 'Curiosity', details: 'No sentences found' };

  let points = 0;

  // Questions (up to 30)
  const questionCount = (text.match(/\?/g) || []).length;
  points += Math.min(30, questionCount * 10);

  // Opening hook (20)
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const first200 = words.slice(0, 200).join(' ');
  const hasHook =
    first200.includes('?') ||
    /(you will learn|you'll be able to|by the end|after reading)/i.test(first200) ||
    /\d+\s*(percent|%|times|x|ways|steps)/i.test(first200);
  if (hasHook) points += 20;

  // Information gap phrases (up to 25)
  const gapPhrases = [
    'why', 'how', 'what if', 'imagine', 'consider', 'suppose',
    'surprisingly', 'counterintuitive', 'unexpected', 'common mistake',
  ];
  const gapHits = gapPhrases.filter((p) => text.toLowerCase().includes(p)).length;
  points += Math.min(25, gapHits * 5);

  // Concrete numbers/stats (up to 25)
  const stats = (text.match(/\d+(\.\d+)?%|\d+ (times|percent|ms|seconds|minutes)/gi) || []).length;
  points += Math.min(25, stats * 5);

  return {
    score: Math.min(100, points),
    label: 'Curiosity',
    details: `questions: ${questionCount}, hook: ${hasHook ? 'yes' : 'no'}, gap phrases: ${gapHits}, stats: ${stats}`,
  };
}

/** Clarity: readability grade, sentence length, heading quality */
function scoreClarity(ctx: ScoringContext): DimensionScore {
  const text = stripCode(ctx.content);
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (words.length === 0 || sentences.length === 0) {
    return { score: 0, label: 'Clarity', details: 'No prose content' };
  }

  let totalSyllables = 0;
  for (const word of words) {
    const cleaned = word.replace(/[^a-zA-Z]/g, '');
    if (cleaned.length > 0) totalSyllables += syllable(cleaned);
  }

  const fk =
    0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) -
    15.59;

  let points = 0;

  // FK score (up to 40)
  const targets: Record<string, number> = { tutorial: 8, reference: 10, guide: 10, whitepaper: 12, 'religious-text': 10 };
  const target = targets[ctx.contentType] ?? 10;
  if (fk <= target) {
    points += 40;
  } else if (fk <= target + 3) {
    points += 25;
  } else {
    points += 10;
  }

  // Sentence length (up to 30)
  const longSentences = sentences.filter(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length > 30,
  ).length;
  const longRatio = longSentences / sentences.length;
  if (longRatio <= 0.05) points += 30;
  else if (longRatio <= 0.15) points += 20;
  else points += 5;

  // Heading descriptiveness (up to 30)
  let vague = 0;
  let total = 0;
  const vagueWords = ['overview', 'details', 'miscellaneous', 'notes', 'general', 'other', 'more', 'info'];
  visit(ctx.ast, 'heading', (node: Heading) => {
    total++;
    if (vagueWords.includes(toString(node).trim().toLowerCase())) vague++;
  });
  if (total === 0 || vague === 0) points += 30;
  else if (vague / total < 0.2) points += 20;
  else points += 5;

  return {
    score: Math.min(100, points),
    label: 'Clarity',
    details: `FK: ${fk.toFixed(1)}, long sentences: ${longSentences}/${sentences.length}, vague headings: ${vague}/${total}`,
  };
}

/** Action: examples, code blocks, exercises, step indicators */
function scoreAction(ctx: ScoringContext): DimensionScore {
  let points = 0;

  // Code blocks (up to 30)
  let codeBlocks = 0;
  visit(ctx.ast, 'code', () => { codeBlocks++; });
  points += Math.min(30, codeBlocks * 10);

  // Examples (up to 25)
  let exampleHeadings = 0;
  visit(ctx.ast, 'heading', (node: Heading) => {
    const text = toString(node).toLowerCase();
    if (text.includes('example') || text.includes('use case')) exampleHeadings++;
  });
  points += Math.min(25, exampleHeadings * 10);

  // Exercises/practice (up to 25)
  const exercisePatterns = ['exercise', 'try it', 'practice', 'your turn', 'challenge'];
  const hasExercise = exercisePatterns.some((p) => ctx.content.toLowerCase().includes(p));
  if (hasExercise) points += 25;

  // Step indicators (up to 20)
  const hasSteps = /step\s+\d+/i.test(ctx.content);
  const hasProgress = /step\s+\d+\s+of\s+\d+|\(\d+\/\d+\)/i.test(ctx.content);
  if (hasProgress) points += 20;
  else if (hasSteps) points += 10;

  return {
    score: Math.min(100, points),
    label: 'Action',
    details: `code blocks: ${codeBlocks}, examples: ${exampleHeadings}, exercises: ${hasExercise ? 'yes' : 'no'}, steps: ${hasSteps ? (hasProgress ? 'with progress' : 'basic') : 'none'}`,
  };
}

/** Flow: transitions, next steps, narrative arc */
function scoreFlow(ctx: ScoringContext): DimensionScore {
  let points = 0;
  const children = ctx.ast.children;

  // Transitions between H2s (up to 40)
  const transitionPhrases = [
    'next', 'now that', "let's", 'with that', 'building on',
    'moving on', 'so far', 'having', 'before we',
  ];
  const h2Indices: number[] = [];
  children.forEach((node: RootContent, idx: number) => {
    if (node.type === 'heading' && (node as Heading).depth === 2) h2Indices.push(idx);
  });

  if (h2Indices.length > 1) {
    let withTransition = 0;
    for (let i = 0; i < h2Indices.length - 1; i++) {
      for (let j = h2Indices[i + 1] - 1; j > h2Indices[i]; j--) {
        if (children[j].type === 'paragraph') {
          if (transitionPhrases.some((p) => toString(children[j]).toLowerCase().includes(p))) {
            withTransition++;
          }
          break;
        }
      }
    }
    const ratio = withTransition / (h2Indices.length - 1);
    points += Math.round(ratio * 40);
  } else {
    points += 20; // Can't measure transitions with ≤1 section
  }

  // Next steps (30)
  const nextStepsPatterns = ['next steps', "what's next", 'further reading', 'where to go'];
  const lastLines = ctx.content.split('\n').slice(-20).join('\n').toLowerCase();
  if (nextStepsPatterns.some((p) => lastLines.includes(p))) points += 30;

  // Narrative arc — opening setup + closing resolution (30)
  const lines = ctx.content.split('\n');
  const first20 = lines.slice(0, Math.ceil(lines.length * 0.2)).join('\n').toLowerCase();
  const last20 = lines.slice(Math.floor(lines.length * 0.8)).join('\n').toLowerCase();

  const hasSetup = ['prerequisite', 'goal', "what you'll build", 'learning objective', 'by the end']
    .some((p) => first20.includes(p));
  const hasResolution = ['congratulations', "you've built", 'you now have', 'you can now']
    .some((p) => last20.includes(p));

  if (hasSetup && hasResolution) points += 30;
  else if (hasSetup || hasResolution) points += 15;

  return {
    score: Math.min(100, points),
    label: 'Flow',
    details: `transitions: measured, next steps: ${nextStepsPatterns.some((p) => lastLines.includes(p)) ? 'yes' : 'no'}, setup: ${hasSetup ? 'yes' : 'no'}, resolution: ${hasResolution ? 'yes' : 'no'}`,
  };
}

/** Voice: reader focus, active voice, engaging tone */
function scoreVoice(ctx: ScoringContext): DimensionScore {
  const text = stripCode(ctx.content);
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return { score: 0, label: 'Voice', details: 'No sentences' };

  let points = 0;

  // Reader pronouns vs system phrases (up to 40)
  const readerPronouns = (text.match(/\b(you|your|you'll|you've)\b/gi) || []).length;
  const systemPhrases = (
    text.match(/\b(the api|the system|the tool|the library|the framework|the module|the service|the platform)\b/gi) || []
  ).length;

  if (systemPhrases === 0 || readerPronouns >= systemPhrases) {
    points += 40;
  } else if (readerPronouns >= systemPhrases / 2) {
    points += 25;
  } else {
    points += 10;
  }

  // Active voice (up to 35)
  const passivePattern = /\b(is|are|was|were|been|being|be)\s+\w+ed\b/i;
  let passiveCount = 0;
  for (const s of sentences) {
    if (passivePattern.test(s)) passiveCount++;
  }
  const passiveRatio = passiveCount / sentences.length;
  const threshold = ctx.contentType === 'whitepaper' ? 0.35 : 0.2;
  if (passiveRatio <= threshold) points += 35;
  else if (passiveRatio <= threshold + 0.1) points += 20;
  else points += 5;

  // Engaging tone words (up to 25)
  const toneWords = ['imagine', 'powerful', 'elegant', 'beautiful', 'exciting', 'crucial', 'essential', 'brilliant'];
  const toneHits = toneWords.filter((w) => text.toLowerCase().includes(w)).length;
  points += Math.min(25, toneHits * 5);

  return {
    score: Math.min(100, points),
    label: 'Voice',
    details: `reader: ${readerPronouns}, system: ${systemPhrases}, passive: ${Math.round(passiveRatio * 100)}%, tone words: ${toneHits}`,
  };
}

// ---------------------------------------------------------------------------
// Main scorer
// ---------------------------------------------------------------------------

export function computeEngagementScore(ctx: ScoringContext): EngagementScore {
  const curiosity = scoreCuriosity(ctx);
  const clarity = scoreClarity(ctx);
  const action = scoreAction(ctx);
  const flow = scoreFlow(ctx);
  const voice = scoreVoice(ctx);

  const total = Math.round(
    curiosity.score * WEIGHTS.curiosity +
    clarity.score * WEIGHTS.clarity +
    action.score * WEIGHTS.action +
    flow.score * WEIGHTS.flow +
    voice.score * WEIGHTS.voice,
  );

  return {
    total,
    dimensions: { curiosity, clarity, action, flow, voice },
  };
}

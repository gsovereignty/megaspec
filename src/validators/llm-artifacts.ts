// ---------------------------------------------------------------------------
// LLM Artifact Detection (DF-090 – DF-093)
// Research basis: Kobak et al. (2024), Science Advances Vol. 11 No. 27 [RF-19]
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LlmArtifactPattern {
  pattern: string | RegExp;
  category: 'word' | 'typography' | 'phrase' | 'structural' | 'contraction';
  replacement: string;
  message: string;
}

export interface LlmArtifactMatch {
  line: number;
  column: number;
  length: number;
  text: string;
  category: 'word' | 'typography' | 'phrase' | 'structural' | 'contraction';
  replacement: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Category A: Overused Style Words (DF-090)
// Matched as whole words with \b, case-insensitive.
// ---------------------------------------------------------------------------

interface WordEntry {
  root: string;
  regex: RegExp;
  replacement: string;
}

const OVERUSED_WORDS: WordEntry[] = [
  { root: 'delve', regex: /\bdelves?\b|\bdelving\b|\bdelved\b/gi, replacement: 'explore, examine' },
  { root: 'tapestry', regex: /\btapestr(?:y|ies)\b/gi, replacement: 'mix, combination' },
  { root: 'landscape', regex: /\blandscapes?\b/gi, replacement: 'field, area, space' },
  { root: 'comprehensive', regex: /\bcomprehensive(?:ly)?\b/gi, replacement: 'thorough, complete' },
  { root: 'intricate', regex: /\bintricate(?:s|ly)?\b/gi, replacement: 'complex, detailed' },
  { root: 'nuanced', regex: /\bnuanced?\b/gi, replacement: 'subtle, detailed' },
  { root: 'multifaceted', regex: /\bmultifaceted\b/gi, replacement: 'complex, varied' },
  { root: 'pivotal', regex: /\bpivotal(?:ly)?\b/gi, replacement: 'key, important' },
  { root: 'crucial', regex: /\bcrucial(?:ly)?\b/gi, replacement: 'important, key' },
  { root: 'furthermore', regex: /\bfurthermore\b/gi, replacement: 'also, and' },
  { root: 'moreover', regex: /\bmoreover\b/gi, replacement: 'also, and' },
  { root: 'notably', regex: /\bnotably\b/gi, replacement: 'especially' },
  { root: 'underscore', regex: /\bunderscor(?:es?|ing)\b/gi, replacement: 'highlights, shows' },
  { root: 'showcasing', regex: /\bshowcasing\b/gi, replacement: 'showing, demonstrating' },
  { root: 'leveraging', regex: /\bleverag(?:e[ds]?|ing)\b/gi, replacement: 'using' },
  { root: 'harnessing', regex: /\bharnessing\b|\bharness(?:es|ed)?\b/gi, replacement: 'using' },
  { root: 'fostering', regex: /\bfoster(?:s|ed|ing)?\b/gi, replacement: 'encouraging, supporting' },
  { root: 'streamlining', regex: /\bstreamlining\b|\bstreamline[ds]?\b/gi, replacement: 'simplifying' },
  { root: 'facilitating', regex: /\bfacilitat(?:e[ds]?|ing)\b/gi, replacement: 'enabling, helping' },
  { root: 'illuminating', regex: /\billuminat(?:e[ds]?|ing)\b/gi, replacement: 'revealing, clarifying' },
  { root: 'elucidating', regex: /\belucidat(?:e[ds]?|ing)\b/gi, replacement: 'explaining, clarifying' },
  { root: 'groundbreaking', regex: /\bgroundbreaking\b/gi, replacement: 'new, innovative' },
  { root: 'commendable', regex: /\bcommendabl[ey]\b/gi, replacement: 'good, praiseworthy' },
  { root: 'meticulous', regex: /\bmeticulous(?:ly)?\b/gi, replacement: 'careful, thorough' },
  { root: 'encompassing', regex: /\bencompass(?:es|ed|ing)?\b/gi, replacement: 'covering, including' },
  { root: 'realm', regex: /\brealms?\b/gi, replacement: 'area, field, domain' },
  { root: 'paradigm', regex: /\bparadigms?\b/gi, replacement: 'model, approach' },
  { root: 'holistic', regex: /\bholistic(?:ally)?\b/gi, replacement: 'complete, overall' },
  { root: 'robust', regex: /\brobust(?:ly|ness)?\b/gi, replacement: 'strong, solid' },
  { root: 'seamless', regex: /\bseamless(?:ly)?\b/gi, replacement: 'smooth' },
  { root: 'transformative', regex: /\btransformative\b/gi, replacement: 'significant, major' },
  { root: 'unparalleled', regex: /\bunparalleled\b/gi, replacement: 'exceptional, unique' },
  { root: 'invaluable', regex: /\binvaluable\b/gi, replacement: 'very useful, essential' },
  { root: 'indispensable', regex: /\bindispensable\b/gi, replacement: 'essential, necessary' },
  { root: 'imperative', regex: /\bimperative\b/gi, replacement: 'essential, important' },
  { root: 'formidable', regex: /\bformidabl[ey]\b/gi, replacement: 'significant, challenging' },
  { root: 'burgeoning', regex: /\bburgeoning\b/gi, replacement: 'growing, expanding' },
  { root: 'cutting-edge', regex: /\bcutting-edge\b/gi, replacement: 'modern, latest' },
  { root: 'spearheading', regex: /\bspearhead(?:s|ed|ing)?\b/gi, replacement: 'leading' },
  { root: 'revolutionize', regex: /\brevolutionis?z(?:e[ds]?|ing)\b/gi, replacement: 'transform, change' },
  { root: 'accentuating', regex: /\baccentuat(?:e[ds]?|ing)\b/gi, replacement: 'highlighting, emphasizing' },
  { root: 'intricacies', regex: /\bintricac(?:y|ies)\b/gi, replacement: 'details, complexities' },
  { root: 'adept', regex: /\badept(?:ly)?\b/gi, replacement: 'skilled, capable' },
  { root: 'poised', regex: /\bpoised\b/gi, replacement: 'ready, positioned' },
  { root: 'endeavor', regex: /\bendeavou?rs?\b/gi, replacement: 'efforts, work' },
  { root: 'interplay', regex: /\binterplay\b/gi, replacement: 'interaction, relationship' },
  { root: 'synergy', regex: /\bsynerg(?:y|ies)\b/gi, replacement: 'collaboration, combined effect' },
  { root: 'pinnacle', regex: /\bpinnacles?\b/gi, replacement: 'peak, top' },
  { root: 'bedrock', regex: /\bbedrock\b/gi, replacement: 'foundation, basis' },
  { root: 'cornerstone', regex: /\bcornerstones?\b/gi, replacement: 'foundation, key part' },
  { root: 'underpinning', regex: /\bunderpinning[s]?\b|\bunderpin(?:s|ned)?\b/gi, replacement: 'supporting, underlying' },
  { root: 'orchestrating', regex: /\borchestrat(?:e[ds]?|ing)\b/gi, replacement: 'coordinating, organizing' },
  { root: 'navigating', regex: /\bnavigate[ds]?\b|\bnavigating\b/gi, replacement: 'working through, handling' },
];

// ---------------------------------------------------------------------------
// Category B: Typographic Artifacts (DF-090)
// ---------------------------------------------------------------------------

const EM_DASH_REGEX = /\u2014/g; // — (em dash)
const DOUBLE_HYPHEN_REGEX = /(?<!-)--(?!-)/g; // -- (double hyphen, LLM stand-in for em dash)
const SMART_QUOTE_REGEX = /[\u201C\u201D\u2018\u2019]/g; // "" ''
const DECORATIVE_EMOJI_REGEX =
  /[\u{1F680}\u{1F4A1}\u2728\u{1F3AF}\u{1F511}\u{1F31F}\u2B50\u{1F3C6}\u{1F4CC}\u{1F525}\u{1F4AA}\u{1F389}\u{1F449}\u26A1\u{1F914}\u{1F9E0}\u{1F4DD}\u{1F6E0}\u{1F50D}\u{1F4CA}]\u{FE0F}?/gu;

// ---------------------------------------------------------------------------
// Category C: Filler/Hedge Phrases (DF-090)
// Matched as literal case-insensitive substrings.
// ---------------------------------------------------------------------------

interface PhraseEntry {
  phrase: string;
  replacement: string;
}

const FILLER_PHRASES: PhraseEntry[] = [
  { phrase: "it's worth noting that", replacement: '[remove — start with the actual point]' },
  { phrase: 'it is important to note that', replacement: '[remove — start with the actual point]' },
  { phrase: 'it should be noted that', replacement: '[remove — start with the actual point]' },
  { phrase: "in today's rapidly evolving", replacement: '[remove or be specific]' },
  { phrase: 'in the ever-evolving landscape of', replacement: '[remove or be specific]' },
  { phrase: 'in this comprehensive guide', replacement: '[remove]' },
  { phrase: "let's dive in", replacement: '[remove]' },
  { phrase: "let's delve into", replacement: '[remove]' },
  { phrase: 'without further ado', replacement: '[remove]' },
  { phrase: 'at the end of the day', replacement: '[remove]' },
  { phrase: 'in order to', replacement: 'To' },
  { phrase: 'due to the fact that', replacement: 'Because' },
  { phrase: 'in the realm of', replacement: 'In' },
  { phrase: 'a myriad of', replacement: 'Many' },
  { phrase: 'serves as a testament to', replacement: 'shows, demonstrates' },
  { phrase: 'is a testament to', replacement: 'shows, demonstrates' },
  { phrase: 'game-changing', replacement: 'significant improvement' },
  { phrase: 'game-changer', replacement: 'significant improvement' },
  { phrase: 'take it to the next level', replacement: 'improve' },
  { phrase: 'best practices', replacement: 'recommendations, guidelines' },
];

// ---------------------------------------------------------------------------
// Category D: Structural Patterns (DF-090)
// Conjunctive adverb openers at sentence start.
// ---------------------------------------------------------------------------

const STRUCTURAL_OPENERS = [
  'Additionally',
  'Furthermore',
  'Moreover',
  'Consequently',
  'Notably',
  'Importantly',
];

// Build a regex that matches these at line start or after ". "
const STRUCTURAL_REGEX = new RegExp(
  `(?:^|(?<=\\.\\s))(${STRUCTURAL_OPENERS.join('|')}),\\s`,
  'gm',
);

// ---------------------------------------------------------------------------
// Category E: Non-Contracted Forms (DF-091)
// LLMs avoid contractions; natural writing uses them.
// ---------------------------------------------------------------------------

interface ContractionEntry {
  regex: RegExp;
  contraction: string;
}

const CONTRACTION_ENTRIES: ContractionEntry[] = [
  // --- Verb + not ---
  { regex: /\bis not\b/gi, contraction: "isn't" },
  { regex: /\bare not\b/gi, contraction: "aren't" },
  { regex: /\bwas not\b/gi, contraction: "wasn't" },
  { regex: /\bwere not\b/gi, contraction: "weren't" },
  { regex: /\bhas not\b/gi, contraction: "hasn't" },
  { regex: /\bhave not\b/gi, contraction: "haven't" },
  { regex: /\bhad not\b/gi, contraction: "hadn't" },
  { regex: /\bwill not\b/gi, contraction: "won't" },
  { regex: /\bwould not\b/gi, contraction: "wouldn't" },
  { regex: /\bdo not\b/gi, contraction: "don't" },
  { regex: /\bdoes not\b/gi, contraction: "doesn't" },
  { regex: /\bdid not\b/gi, contraction: "didn't" },
  { regex: /\bcannot\b/gi, contraction: "can't" },
  { regex: /\bcan not\b/gi, contraction: "can't" },
  { regex: /\bcould not\b/gi, contraction: "couldn't" },
  { regex: /\bshould not\b/gi, contraction: "shouldn't" },
  { regex: /\bmust not\b/gi, contraction: "mustn't" },
  { regex: /\bneed not\b/gi, contraction: "needn't" },
  // --- Pronoun/word + is ---
  { regex: /\bit is\b/gi, contraction: "it's" },
  { regex: /\bhe is\b/gi, contraction: "he's" },
  { regex: /\bshe is\b/gi, contraction: "she's" },
  { regex: /\bthat is\b/gi, contraction: "that's" },
  { regex: /\bthere is\b/gi, contraction: "there's" },
  { regex: /\bhere is\b/gi, contraction: "here's" },
  { regex: /\bwhat is\b/gi, contraction: "what's" },
  { regex: /\bwho is\b/gi, contraction: "who's" },
  { regex: /\bwhere is\b/gi, contraction: "where's" },
  { regex: /\bhow is\b/gi, contraction: "how's" },
  // --- Pronoun + are ---
  { regex: /\byou are\b/gi, contraction: "you're" },
  { regex: /\bwe are\b/gi, contraction: "we're" },
  { regex: /\bthey are\b/gi, contraction: "they're" },
  // --- Pronoun + am ---
  { regex: /\bI am\b/g, contraction: "I'm" },
  // --- Pronoun/word + has ---
  { regex: /\bit has\b/gi, contraction: "it's" },
  { regex: /\bhe has\b/gi, contraction: "he's" },
  { regex: /\bshe has\b/gi, contraction: "she's" },
  { regex: /\bthat has\b/gi, contraction: "that's" },
  { regex: /\bthere has\b/gi, contraction: "there's" },
  { regex: /\bwhat has\b/gi, contraction: "what's" },
  { regex: /\bwho has\b/gi, contraction: "who's" },
  // --- Pronoun + have ---
  { regex: /\bI have\b/g, contraction: "I've" },
  { regex: /\byou have\b/gi, contraction: "you've" },
  { regex: /\bwe have\b/gi, contraction: "we've" },
  { regex: /\bthey have\b/gi, contraction: "they've" },
  // --- Pronoun/word + will ---
  { regex: /\bI will\b/g, contraction: "I'll" },
  { regex: /\byou will\b/gi, contraction: "you'll" },
  { regex: /\bhe will\b/gi, contraction: "he'll" },
  { regex: /\bshe will\b/gi, contraction: "she'll" },
  { regex: /\bit will\b/gi, contraction: "it'll" },
  { regex: /\bwe will\b/gi, contraction: "we'll" },
  { regex: /\bthey will\b/gi, contraction: "they'll" },
  { regex: /\bthat will\b/gi, contraction: "that'll" },
  // --- Pronoun + would ---
  { regex: /\bI would\b/g, contraction: "I'd" },
  { regex: /\byou would\b/gi, contraction: "you'd" },
  { regex: /\bhe would\b/gi, contraction: "he'd" },
  { regex: /\bshe would\b/gi, contraction: "she'd" },
  { regex: /\bit would\b/gi, contraction: "it'd" },
  { regex: /\bwe would\b/gi, contraction: "we'd" },
  { regex: /\bthey would\b/gi, contraction: "they'd" },
  // --- Pronoun + had ---
  { regex: /\bI had\b/g, contraction: "I'd" },
  { regex: /\byou had\b/gi, contraction: "you'd" },
  { regex: /\bhe had\b/gi, contraction: "he'd" },
  { regex: /\bshe had\b/gi, contraction: "she'd" },
  { regex: /\bwe had\b/gi, contraction: "we'd" },
  { regex: /\bthey had\b/gi, contraction: "they'd" },
  // --- Other ---
  { regex: /\blet us\b/gi, contraction: "let's" },
];

// ---------------------------------------------------------------------------
// Content-zone detection helpers
// ---------------------------------------------------------------------------

/** Check if a line is inside a fenced code block or front matter. */
function buildSkipMap(lines: string[]): boolean[] {
  const skip = new Array<boolean>(lines.length).fill(false);
  let inFence = false;
  let inFrontMatter = false;
  let frontMatterDone = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimEnd();

    // Front matter detection (only valid at start of file)
    if (i === 0 && trimmed === '---') {
      inFrontMatter = true;
      skip[i] = true;
      continue;
    }
    if (inFrontMatter) {
      skip[i] = true;
      if (trimmed === '---') {
        inFrontMatter = false;
        frontMatterDone = true;
      }
      continue;
    }

    // Fenced code block detection
    if (trimmed.startsWith('```')) {
      inFence = !inFence;
      skip[i] = true;
      continue;
    }
    if (inFence) {
      skip[i] = true;
      continue;
    }

    // Inline code – we strip it later when scanning
  }
  return skip;
}

/** Strip inline code from a line for prose scanning. */
function stripInlineCode(line: string): string {
  return line.replace(/`[^`]+`/g, (m) => ' '.repeat(m.length));
}

// ---------------------------------------------------------------------------
// Scanner (DF-091)
// ---------------------------------------------------------------------------

export function scanLlmArtifacts(content: string): LlmArtifactMatch[] {
  const matches: LlmArtifactMatch[] = [];
  const lines = content.split('\n');
  const skipMap = buildSkipMap(lines);

  for (let i = 0; i < lines.length; i++) {
    if (skipMap[i]) continue;

    const cleaned = stripInlineCode(lines[i]);

    // Category A: Overused words
    for (const entry of OVERUSED_WORDS) {
      // Reset regex state
      entry.regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = entry.regex.exec(cleaned)) !== null) {
        matches.push({
          line: i + 1,
          column: m.index + 1,
          length: m[0].length,
          text: m[0],
          category: 'word',
          replacement: entry.replacement,
          message: `LLM artifact: "${m[0]}" — consider: ${entry.replacement} [RF-19]`,
        });
      }
    }

    // Category B: Typographic artifacts
    // Em dashes
    EM_DASH_REGEX.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = EM_DASH_REGEX.exec(lines[i])) !== null) {
      matches.push({
        line: i + 1,
        column: m.index + 1,
        length: 1,
        text: '—',
        category: 'typography',
        replacement: ' - ',
        message: 'LLM artifact: em dash "—" — consider: " - " or en dash [RF-19]',
      });
    }

    // Double hyphens (LLM em-dash substitute)
    DOUBLE_HYPHEN_REGEX.lastIndex = 0;
    while ((m = DOUBLE_HYPHEN_REGEX.exec(lines[i])) !== null) {
      matches.push({
        line: i + 1,
        column: m.index + 1,
        length: 2,
        text: '--',
        category: 'typography',
        replacement: ' - ',
        message: 'LLM artifact: double hyphen "--" — use " - " or rewrite the sentence [RF-19]',
      });
    }

    // Smart quotes
    SMART_QUOTE_REGEX.lastIndex = 0;
    while ((m = SMART_QUOTE_REGEX.exec(lines[i])) !== null) {
      const straight = m[0] === '\u201C' || m[0] === '\u201D' ? '"' : "'";
      matches.push({
        line: i + 1,
        column: m.index + 1,
        length: 1,
        text: m[0],
        category: 'typography',
        replacement: straight,
        message: `LLM artifact: smart quote "${m[0]}" — use straight quote [RF-19]`,
      });
    }

    // Decorative emoji
    DECORATIVE_EMOJI_REGEX.lastIndex = 0;
    while ((m = DECORATIVE_EMOJI_REGEX.exec(lines[i])) !== null) {
      matches.push({
        line: i + 1,
        column: m.index + 1,
        length: m[0].length,
        text: m[0],
        category: 'typography',
        replacement: '',
        message: `LLM artifact: decorative emoji "${m[0]}" — remove from technical docs [RF-19]`,
      });
    }

    // Category C: Filler phrases
    const lowerCleaned = cleaned.toLowerCase();
    for (const entry of FILLER_PHRASES) {
      let searchStart = 0;
      const lowerPhrase = entry.phrase.toLowerCase();
      while (true) {
        const idx = lowerCleaned.indexOf(lowerPhrase, searchStart);
        if (idx === -1) break;
        matches.push({
          line: i + 1,
          column: idx + 1,
          length: entry.phrase.length,
          text: cleaned.substring(idx, idx + entry.phrase.length),
          category: 'phrase',
          replacement: entry.replacement,
          message: `LLM artifact: "${cleaned.substring(idx, idx + entry.phrase.length)}" — consider: ${entry.replacement} [RF-19]`,
        });
        searchStart = idx + entry.phrase.length;
      }
    }

    // Category D: Structural patterns (sentence-starting adverb openers)
    STRUCTURAL_REGEX.lastIndex = 0;
    while ((m = STRUCTURAL_REGEX.exec(cleaned)) !== null) {
      // The captured group is the opener word
      const opener = m[1];
      matches.push({
        line: i + 1,
        column: m.index + 1,
        length: opener.length + 2, // opener + ", "
        text: `${opener}, `,
        category: 'structural',
        replacement: 'Consider removing or varying the transition',
        message: `LLM artifact: sentence starts with "${opener}," — vary transitions [RF-19]`,
      });
    }

    // Category E: Non-contracted forms
    for (const entry of CONTRACTION_ENTRIES) {
      entry.regex.lastIndex = 0;
      let cm: RegExpExecArray | null;
      while ((cm = entry.regex.exec(cleaned)) !== null) {
        matches.push({
          line: i + 1,
          column: cm.index + 1,
          length: cm[0].length,
          text: cm[0],
          category: 'contraction',
          replacement: entry.contraction,
          message: `Use contraction: "${entry.contraction}" instead of "${cm[0]}" [RF-19]`,
        });
      }
    }
  }

  // Sort by line then column for stable output
  matches.sort((a, b) => a.line - b.line || a.column - b.column);
  return matches;
}

// ---------------------------------------------------------------------------
// Strip helper (DF-092)
// ---------------------------------------------------------------------------

export function stripLlmArtifacts(content: string): { cleaned: string; replacements: number } {
  const matches = scanLlmArtifacts(content);
  if (matches.length === 0) return { cleaned: content, replacements: 0 };

  const lines = content.split('\n');
  let replacements = 0;

  // Group matches by line (process in reverse column order to preserve offsets)
  const byLine = new Map<number, LlmArtifactMatch[]>();
  for (const match of matches) {
    const arr = byLine.get(match.line) ?? [];
    arr.push(match);
    byLine.set(match.line, arr);
  }

  for (const [lineNum, lineMatches] of byLine) {
    // Sort by column descending for safe in-place replacement
    lineMatches.sort((a, b) => b.column - a.column);
    let line = lines[lineNum - 1];

    for (const match of lineMatches) {
      const start = match.column - 1;
      const end = start + match.length;
      let rep = match.replacement;

      // For suggestions that start with '[', skip — these need manual review
      if (rep.startsWith('[')) {
        // Mark for manual review instead of replacing
        continue;
      }

      // For word replacements, pick just the first suggestion
      if (rep.includes(', ')) {
        rep = rep.split(', ')[0];
      }

      // For empty replacement (emoji, etc.), remove
      // For word/phrase replacement, substitute
      const before = line.substring(0, start);
      const after = line.substring(end);
      line = before + rep + after;
      replacements++;
    }

    lines[lineNum - 1] = line;
  }

  return { cleaned: lines.join('\n'), replacements };
}

// ---------------------------------------------------------------------------
// Dictionary inspection (for testing DF-090)
// ---------------------------------------------------------------------------

export function getDictionaryStats(): {
  words: number;
  phrases: number;
  typographic: number;
  structural: number;
  contractions: number;
} {
  return {
    words: OVERUSED_WORDS.length,
    phrases: FILLER_PHRASES.length,
    typographic: 4, // em dash, double hyphen, smart quotes, decorative emoji
    structural: STRUCTURAL_OPENERS.length,
    contractions: CONTRACTION_ENTRIES.length,
  };
}

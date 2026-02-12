# Design: add-llm-detection

## Overview

Four requirements implemented across one new module and modifications to existing commands. The core is a pattern-matching scanner with a curated dictionary, wired into the existing validation framework.

## Research Basis

**Primary source**: Kobak, González-Márquez, Horvát & Lause (2024). "Delving into LLM-assisted writing in biomedical publications through excess vocabulary." *Science Advances*, Vol. 11, No. 27.

Key findings:
- 379 style words showed statistically elevated frequency in post-ChatGPT (2024) scientific writing
- The excess vocabulary is predominantly **verbs** (66%) and **adjectives** (14%), not content nouns
- Top words by excess ratio: `delves` (28x), `underscores` (13.8x), `showcasing` (10.7x)
- Top words by frequency gap: `potential` (+5.2%), `findings` (+4.1%), `crucial` (+3.7%)
- Common excess word set (10 words covering 13.4% of affected abstracts): `across`, `additionally`, `comprehensive`, `crucial`, `enhancing`, `exhibited`, `insights`, `notably`, `particularly`, `within`

**Additional sources** (community-documented, not peer-reviewed):
- Decorative emoji overuse (🚀💡✨🎯 etc.) — widely documented on writing forums
- Em dash overuse — LLMs use `—` far more frequently than human writers
- Filler phrases ("It's worth noting", "In today's rapidly evolving") — documented across multiple LLM output studies
- Formulaic transitions ("Furthermore,", "Moreover,", "Additionally,") — consistent across all major LLMs

## 1. LLM Artifact Dictionary (DF-090)

### Architecture

```typescript
// src/validators/llm-artifacts.ts

interface LlmArtifactPattern {
  pattern: string | RegExp;
  category: 'word' | 'typography' | 'phrase' | 'structural';
  replacement: string;
  message: string;
}

interface LlmArtifactMatch {
  line: number;
  column: number;
  pattern: string;
  category: string;
  replacement: string;
  message: string;
}
```

### Category A: Overused Style Words

Match as whole words (word boundary `\b`), case-insensitive. Each has a suggested replacement:

| Word | Suggested Replacement |
|---|---|
| delve(s/d/ing) | explore, examine, investigate |
| tapestry | mix, combination, collection |
| landscape | field, area, space |
| comprehensive | thorough, complete, full |
| intricate(s/ly) | complex, detailed |
| nuanced | subtle, detailed |
| multifaceted | complex, varied |
| pivotal | key, important, critical |
| crucial | important, key, essential |
| furthermore | also, and |
| moreover | also, and |
| notably | especially |
| underscores/underscoring | highlights, shows |
| showcasing | showing, demonstrating |
| leveraging | using |
| harnessing | using |
| fostering | encouraging, supporting |
| streamlining | simplifying |
| facilitating | enabling, helping |
| illuminating | revealing, clarifying |
| elucidating | explaining, clarifying |
| groundbreaking | new, innovative |
| commendable | good, praiseworthy |
| meticulous(ly) | careful(ly), thorough(ly) |
| encompassing | covering, including |
| realm | area, field, domain |
| paradigm | model, approach, pattern |
| holistic | complete, overall, whole |
| robust | strong, solid, reliable |
| seamless(ly) | smooth(ly) |
| transformative | significant, major |
| unparalleled | exceptional, unique |
| invaluable | very useful, essential |
| indispensable | essential, necessary |
| imperative | essential, important, necessary |
| formidable | significant, challenging |
| burgeoning | growing, expanding |
| cutting-edge | modern, latest, advanced |
| spearheading | leading |
| revolutionize/ing | transform, change |
| accentuating | highlighting, emphasizing |
| intricacies | details, complexities |
| adept | skilled, capable |
| poised | ready, positioned |
| endeavors/endeavours | efforts, projects, work |
| interplay | interaction, relationship |
| synergy/synergies | collaboration, combined effect |
| pinnacle | peak, top, height |
| bedrock | foundation, basis |
| cornerstone | foundation, key part |
| underpinning | supporting, underlying |
| orchestrating | coordinating, organizing |
| navigating | working through, handling |

### Category B: Typographic Artifacts

| Pattern | Replacement | Note |
|---|---|---|
| `—` (em dash) | `–` or ` - ` | LLMs overuse em dashes; en dash or spaced hyphen preferred in technical writing |
| Decorative emoji (🚀💡✨🎯🔑🌟⭐🏆📌🔥💪🎉👉⚡🤔🧠📝🛠️🔍📊) | [remove] | Decorative emoji have no place in technical documentation |
| `""''` (smart/curly quotes) | `""''` (straight quotes) | Markdown uses straight quotes; curly quotes indicate copy-paste from LLM UI |

### Category C: Filler/Hedge Phrases

These are matched as literal substrings (case-insensitive):

| Phrase | Replacement |
|---|---|
| It's worth noting that | [remove — start with the actual point] |
| It is important to note that | [remove — start with the actual point] |
| It should be noted that | [remove — start with the actual point] |
| In today's rapidly evolving | [remove or be specific about what's changing] |
| In the ever-evolving landscape of | [remove or be specific] |
| In this comprehensive guide | [remove] |
| Let's dive in | [remove] |
| Let's delve into | [remove] |
| Without further ado | [remove] |
| At the end of the day | [remove] |
| In order to | To |
| Due to the fact that | Because |
| In the realm of | In |
| A myriad of | Many |
| Serves as a testament to | shows, demonstrates |
| Is a testament to | shows, demonstrates |
| game-changer / game-changing | significant improvement, major change |
| Take it to the next level | improve |
| best practices | recommendations, guidelines |

### Category D: Structural Patterns

Regex patterns for sentences starting with overused conjunctive adverb openers:

- `^Additionally, ` → Consider removing or varying the transition
- `^Furthermore, ` → Consider removing or varying the transition
- `^Moreover, ` → Consider removing or varying the transition
- `^Consequently, ` → Consider removing or varying the transition
- `^Notably, ` → Consider removing or varying the transition
- `^Importantly, ` → Consider removing or varying the transition

These are only flagged at sentence start (after a period or at line start) to avoid false positives.

## 2. Validation Rule (DF-091)

Register `llm-artifacts` in the rule registry. The rule:
1. Calls `scanLlmArtifacts(ctx.rawContent)`
2. For each match, emits WARN: `LLM artifact detected: "${pattern}" — ${replacement} [RF-19]`
3. Always WARN, never FAIL — authors may intentionally use some flagged words

The scanner processes content line-by-line, skipping:
- Code blocks (between ``` fences)
- Front matter (between `---` fences)
- Inline code (between backticks)

## 3. `--strip-llm` Flag (DF-092)

Added to `registerValidateCommand`. When set:
1. Read file content
2. Run `scanLlmArtifacts()` to get all matches
3. Apply replacements in reverse order (to preserve offsets):
   - If replacement is a concrete word/phrase → substitute directly
   - If replacement starts with `[` → wrap original in `<!-- LLM: original -->` for manual review
4. Output cleaned content to stdout
5. In `--json` mode, include `{ cleaned: string, replacements: number }`
6. Works independently of `--strict` and `--engagement-report`

## 4. Profile & Publish Integration (DF-093)

- Add `llm-artifacts` to every profile (guide, tutorial, reference, whitepaper) at WARN
- In `docflow publish`, after existing gates pass, run scanner and report:
  ```
  Advisory: 12 LLM artifact(s) detected. Consider running 'docflow validate --strip-llm' to review.
  ```
  This is informational only and does NOT block publishing.

## Test Strategy

- **Unit tests** (`test/llm-artifacts.test.ts`):
  - Dictionary has all 4 categories with ≥10 entries each
  - Scanner detects words, typography, phrases, structural patterns
  - Scanner skips code blocks and front matter
  - Scanner returns correct line numbers and columns
  - Replacement suggestions are present for all patterns

- **Fixture tests** (in `test/validators.test.ts`):
  - Validation rule produces WARN diagnostics with RF-19 citation
  - Rule produces no diagnostics for clean content

- **Integration tests** (in `test/commands.test.ts`):
  - `--strip-llm` replaces artifacts and outputs cleaned content
  - `--strip-llm --json` includes cleaned and replacements count
  - Publish with artifacts shows advisory but succeeds

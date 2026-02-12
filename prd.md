# DocFlow — Product Requirements Document

**Version**: 1.0
**Date**: 2026-02-10
**Status**: Draft
**Author**: Gareth + AI Agents

---

## 1. Executive Summary

DocFlow is a CLI-first tool that enables subject matter experts (SMEs) — who are not professional writers — to produce engaging, addictive documentation, whitepapers, tutorials, and technical articles. It combines LLM agent workflows with automated validation rules derived from classical rhetoric, cognitive science, and modern UX research. The final output is a set of audience-ready master Markdown files in a flat `publish/` folder.

DocFlow is independent from OpenSpec but lives alongside it in the megaspec repository and follows similar structural patterns (three-stage workflow, delta-based changes, structured validation).

## 2. Problem Statement

Subject matter experts hold the knowledge that documentation needs, but they typically lack the writing skills to present that knowledge in a way that engages readers. The result is documentation that is accurate but dull, poorly structured, hard to scan, and quickly abandoned by readers.

Current approaches fail because:
- **Style guides** tell writers *what* to do but don't enforce it
- **Professional writers** create a bottleneck and may lack domain depth
- **AI writing tools** produce generic output without systematic engagement validation
- **No tool** combines research-backed engagement mechanics with structured authoring workflow

## 3. Target User

**Primary**: Subject matter experts who are not professional writers — engineers, researchers, domain specialists, founders — who need to produce documentation that people actually read.

**Secondary**: Technical writers who want systematic engagement validation for their output.

## 4. Research Foundations

The validation rules and content structure are grounded in peer-reviewed research and established frameworks:

| ID | Domain | Source | Principle | Application in DocFlow |
|---|---|---|---|---|
| RF-01 | Classical rhetoric | Aristotle, *Rhetoric* | Ethos (credibility), Pathos (emotion), Logos (logic) | `outline.md` requires explicit persuasion mode signals |
| RF-02 | Dramatic structure | Aristotle, *Poetics* | Peripeteia (reversal), Anagnorisis (recognition), Catharsis | Tension-release pattern validation in content sections |
| RF-03 | Dialectic method | Plato, Socratic dialogues | Question-driven discovery | Question-based heading validation, FAQ patterns |
| RF-04 | Curiosity | Loewenstein (1994), Information Gap Theory | Curiosity arises from gap between known and unknown | Opening hook validation, question-before-answer checks |
| RF-05 | Cognitive load | Sweller, Cognitive Load Theory | Working memory limits (5±2 items) | Paragraph length, list size, chunking validation |
| RF-06 | Worked examples | Sweller, Renkl | Studied examples > problem-solving for novices | Annotated example requirement for tutorials |
| RF-07 | Flow state | Csikszentmihalyi | Challenge must match skill; clear goals + feedback | Progressive disclosure validation, goal statements |
| RF-08 | Dual coding | Paivio; Mayer, Multimedia Learning | Verbal + visual = better retention | Visual support validation for conceptual content |
| RF-09 | Instructional design | Gagné, Nine Events of Instruction | Structured learning sequence | Tutorial compliance checklist |
| RF-10 | Instructional design | Merrill, First Principles | Task-centered, activation, demonstration, application | Outline structure requirements |
| RF-11 | Web reading | Nielsen (1997–2020) | F-pattern scanning, inverted pyramid | Frontloading, heading descriptiveness, paragraph limits |
| RF-12 | Minimalism | Carroll (1990) | Action-oriented, task-based, error recovery | Verb-based headings, immediate code examples |
| RF-13 | Addictive design | Nir Eyal, *Hooked* | Variable rewards, triggers, investment | Progress signals, pro tips, achievement markers |
| RF-14 | Influence | Cialdini, *Influence* | Authority, social proof, reciprocity, commitment | Ethos signals, usage stats, incremental commitment |
| RF-15 | Completion | Zeigarnik Effect | Incomplete tasks create mental tension | Numbered steps, progress indicators |
| RF-16 | Narrative nonfiction | Talese, Wolfe, McPhee | Concrete detail, scene-setting, specificity | Generic placeholder detection (foo/bar flagging) |
| RF-17 | Voice | Strunk & White; Zinsser | Active voice, conversational tone, "you" focus | Active voice ratio, pronoun analysis |
| RF-18 | Story structure | Campbell, *Hero with a Thousand Faces* | Hero's journey: ordinary → call → threshold → return | Tutorial narrative arc validation |
| RF-19 | LLM excess vocabulary | Kobak et al. (2024), "Delving into LLM-assisted writing", *Science Advances* | LLMs produce statistically detectable excess usage of certain style words (379 words with elevated frequency post-ChatGPT); these are predominantly verbs and adjectives unrelated to content | LLM artifact detection, vocabulary cleansing |

---

## 5. Traceable Requirements Matrix

### Legend

- **ID**: Unique requirement identifier (`DF-XXX`)
- **Category**: Functional area
- **Priority**: P0 (must have v1), P1 (should have v1), P2 (future)
- **Research**: Which research foundation(s) back this requirement
- **OpenSpec Prompt**: The exact prompt/instruction an AI agent should follow to implement or validate this requirement

---

### 5.1 CLI & Project Initialization

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-001 | The system SHALL provide a `docflow init [path]` command that scaffolds a new DocFlow project with `project.md`, `publish/`, `drafts/`, `archive/`, and content-type templates. | P0 | — | Run `docflow init test-project`; verify all directories and template files exist. |
| DF-002 | The system SHALL scaffold content-type templates (tutorial, reference, guide, whitepaper) into the project directory on init. | P0 | RF-09, RF-10 | Run `docflow init`; verify template files for all 4 types exist and contain required section scaffolding. |
| DF-003 | The system SHALL provide a `docflow list` command that displays all active drafts with their slug, content type, and status. | P0 | — | Create 3 drafts; run `docflow list`; verify all 3 appear with correct metadata. |
| DF-004 | The system SHALL provide a `docflow list --publish` command that displays all master files in `publish/` with document ID, title, audience, and estimated reading time. | P0 | — | Publish 2 documents; run `docflow list --publish`; verify both appear with metadata. |
| DF-005 | The system SHALL provide a `docflow show [item]` command that displays a draft or published document with its engagement score summary. | P0 | — | Create and validate a draft; run `docflow show [slug]`; verify content and scores are displayed. |
| DF-006 | The system SHALL provide a `docflow validate [draft] --profile [type]` command that runs the validation rule set for the specified content type. | P0 | All RF | Create a tutorial draft with missing examples; run `docflow validate [slug] --profile tutorial`; verify failure with specific diagnostics. |
| DF-007 | The system SHALL provide a `docflow validate [draft] --engagement-report` flag that outputs a detailed engagement metrics report. | P1 | All RF | Run with flag; verify report includes curiosity, clarity, action, flow, voice scores. |
| DF-008 | The system SHALL provide a `docflow publish [slug]` command that promotes a validated draft's master file to `publish/[slug].md`. | P0 | — | Validate a draft; run `docflow publish [slug]`; verify file exists in `publish/`. |
| DF-009 | The system SHALL provide a `docflow archive [slug]` command that moves a published file from `publish/` to `archive/YYYY-MM-DD-[slug].md`. | P0 | — | Publish then archive; verify file moved to `archive/` with correct timestamp prefix. |
| DF-010 | The system SHALL provide a `docflow metrics [item]` command that displays readability scores, engagement indicators, and validation summary. | P1 | RF-05, RF-11 | Run against a published doc; verify Flesch-Kincaid, engagement score, and profile compliance shown. |
| DF-011 | All CLI commands SHALL support `--json` and `--no-interactive` flags. | P0 | — | Run each command with `--json`; verify valid JSON output. Run with `--no-interactive`; verify no prompts. |

#### OpenSpec Prompts — CLI & Project Initialization

**DF-001**:
> Implement the `docflow init` command. It MUST create the following directory structure at the given path (or current directory if none given): `project.md` (from bundled template), `publish/` (empty), `drafts/` (empty), `archive/` (empty), and a `templates/` directory containing scaffold files for tutorial, reference, guide, and whitepaper content types. Use the commander or oclif framework. The command must be idempotent — running it again on an existing project must not overwrite existing files.

**DF-002**:
> Create four template scaffold files: `templates/tutorial.md`, `templates/reference.md`, `templates/guide.md`, `templates/whitepaper.md`. Each template MUST include all required sections for its content type as defined in the validation profiles (see DF-040 through DF-043). Templates are copied into the project directory by `docflow init`. Include YAML front matter with `type`, `audience`, `id`, and `title` placeholder fields.

**DF-003**:
> Implement `docflow list` to scan the `drafts/` directory. For each subdirectory, read `outline.md` or `content.md` front matter to extract slug, content type, and status (draft/in-review/validated). Display as a formatted table. Support `--json` flag for machine-readable output.

**DF-004**:
> Implement `docflow list --publish` to scan `publish/*.md`. For each file, parse YAML front matter to extract `id`, `title`, `audience`, and compute reading time from word count (assume 200 wpm). Display as formatted table with `--json` support.

**DF-005**:
> Implement `docflow show [item]` to display the contents of a draft (from `drafts/[slug]/content.md`) or published doc (from `publish/[slug].md`). When showing a draft, also run the scoring engine and append an engagement score summary block at the end. Support `--json` for structured output.

**DF-006**:
> Implement `docflow validate [draft]` command. Load the validation profile specified by `--profile` flag (or auto-detect from content front matter `type` field). Run all rules in the profile's rule set. Output diagnostics as: `[PASS]`, `[WARN]`, or `[FAIL]` per rule with file location and explanation. Exit code 0 if no FAIL results, exit code 1 otherwise. Support `--strict` (treat WARN as FAIL) and `--no-interactive` flags.

**DF-007**:
> Add `--engagement-report` flag to `docflow validate`. When set, compute and output: curiosity score, clarity score, action score, flow score, voice score (see DF-060 through DF-064). Display as a summary table with numeric scores and descriptive labels (e.g., "Curiosity: 7/10 — Strong opening hook, 2 information gaps detected").

**DF-008**:
> Implement `docflow publish [slug]`. Steps: (1) Verify `drafts/[slug]/` exists. (2) Run `docflow validate [slug] --strict`; abort if failures. (3) Check that human review gate is satisfied (see DF-080). (4) Copy `drafts/[slug]/content.md` to `publish/[slug].md`. (5) Resolve all `{{doc:*}}` cross-references (see DF-070). (6) Output confirmation with published file path.

**DF-009**:
> Implement `docflow archive [slug]`. Steps: (1) Verify `publish/[slug].md` exists. (2) Move file to `archive/YYYY-MM-DD-[slug].md` using current date. (3) If `drafts/[slug]/` still exists, move to `archive/YYYY-MM-DD-[slug]/` as well. (4) Output confirmation. Support `--yes` flag to skip confirmation prompt.

**DF-010**:
> Implement `docflow metrics [item]` to display: Flesch-Kincaid grade level, average sentence length, passive voice percentage, paragraph count and average length, list compliance (items within 3-7 range), engagement score breakdown (5 dimensions), and validation profile compliance summary.

**DF-011**:
> All commands must accept `--json` (output structured JSON instead of formatted text) and `--no-interactive` (never prompt for user input, fail if input required). Implement these as global CLI flags applied before command parsing.

---

### 5.2 Document Structure & Content Format

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-020 | Every content file SHALL include YAML front matter with required fields: `id` (kebab-case slug), `title`, `type` (tutorial\|reference\|guide\|whitepaper), `audience` (beginner\|intermediate\|advanced), and `prerequisites` (list of doc IDs or empty). | P0 | RF-09 | Validate file with missing front matter field; confirm validation fails. |
| DF-021 | The system SHALL compute `reading_time` from word count (200 wpm) and include it in metadata output. | P0 | RF-15 | Validate a 1000-word doc; confirm reading time = 5 min. |
| DF-022 | Content files SHALL support `{{doc:slug}}` cross-reference syntax that resolves to the target file path during publish. | P0 | — | Include `{{doc:auth-guide}}` in a draft; publish; verify it resolves to `auth-guide.md` in output. |
| DF-023 | The system SHALL validate that all `{{doc:slug}}` references resolve to existing files in `publish/` or active drafts. Unresolvable references SHALL produce a FAIL diagnostic. | P0 | — | Add `{{doc:nonexistent}}`; run validate; confirm FAIL. |
| DF-024 | Each draft SHALL consist of four artifacts in `drafts/[slug]/`: `outline.md`, `research.md`, `content.md`, `checklist.md`. | P0 | RF-09, RF-10 | Scaffold a draft missing `outline.md`; run validate; confirm FAIL. |
| DF-025 | The `outline.md` artifact SHALL require sections: Reader Context, Learning Outcomes, Engagement Strategy (with subsections: Opening Hook, Ethos Signals, Pathos Triggers, Logos Structure, Information Gaps, Tension-Release Beats), Narrative Arc, Visual Requirements, and Practice/Interaction plan. | P0 | RF-01, RF-04, RF-07, RF-10 | Validate outline missing Engagement Strategy; confirm FAIL. |
| DF-026 | The `checklist.md` artifact SHALL track writing tasks mapped to Gagné's Nine Events of Instruction: Gain Attention, State Objectives, Recall Prior Knowledge, Present Content, Provide Guidance, Elicit Performance, Provide Feedback, Assess Performance, Enhance Retention. | P0 | RF-09 | Generate checklist from outline; verify all 9 events present as task items. |
| DF-027 | The `research.md` artifact SHALL include sections for Sources, Evidence, and Assumptions/Unknowns. It is optional but validated if present. | P1 | RF-14 | Create research.md without Assumptions section; validate; confirm WARN. |
| DF-028 | All four artifacts SHALL include an "Agent Contributions" section documenting which agent role produced the content, key assumptions made, and unresolved unknowns. | P0 | — | Validate artifact missing Agent Contributions; confirm FAIL. |
| DF-029 | Published master files in `publish/` SHALL be flat — one `.md` file per document, no subdirectories within `publish/`. | P0 | — | Attempt to publish to `publish/subdir/file.md`; confirm rejection. |

#### OpenSpec Prompts — Document Structure

**DF-020**:
> Implement YAML front matter validation for `content.md` files. Required fields: `id` (must be kebab-case, match directory slug), `title` (non-empty string), `type` (enum: tutorial, reference, guide, whitepaper), `audience` (enum: beginner, intermediate, advanced), `prerequisites` (array of strings, may be empty). Use `gray-matter` or `remark-frontmatter` to parse. Produce FAIL diagnostic with field name and expected format for any missing or invalid field.

**DF-021**:
> Compute reading time as `Math.ceil(wordCount / 200)` minutes. Word count excludes YAML front matter, code blocks, and HTML tags. Include in `docflow show` output and `docflow list --publish` table. Do not store in front matter — always compute dynamically.

**DF-022**:
> Implement cross-reference resolver. Scan content for `{{doc:<slug>}}` patterns using regex `/\{\{doc:([a-z0-9-]+)\}\}/g`. During `docflow publish`, replace each match with a relative Markdown link: `[<title>](<slug>.md)` where `<title>` is read from the target file's front matter. During `docflow validate`, check resolution without replacement.

**DF-023**:
> During validation, for each `{{doc:slug}}` reference, check: (1) Does `publish/[slug].md` exist? (2) If not, does `drafts/[slug]/content.md` exist? (3) If neither, emit FAIL: `Unresolved cross-reference: {{doc:[slug]}} — no matching document found in publish/ or drafts/`. This is always a FAIL, never a WARN.

**DF-024**:
> Validate draft completeness by checking `drafts/[slug]/` for all four required files: `outline.md`, `research.md`, `content.md`, `checklist.md`. If `research.md` is missing, emit WARN (it's optional). If any other file is missing, emit FAIL with the missing filename. Check is run as part of `docflow validate [slug]`.

**DF-025**:
> Validate `outline.md` structure by checking for required H2 headings: `## Reader Context`, `## Learning Outcomes`, `## Engagement Strategy`, `## Narrative Arc`, `## Visual Requirements`, `## Practice/Interaction`. Under `## Engagement Strategy`, require H3 subheadings: `### Opening Hook`, `### Ethos Signals`, `### Pathos Triggers`, `### Logos Structure`, `### Information Gaps`, `### Tension-Release Beats`. Emit FAIL per missing section.

**DF-026**:
> Generate `checklist.md` scaffold from `outline.md`. Map each Gagné event to a checkbox task: `- [ ] Gain Attention: [derived from Opening Hook section]`, `- [ ] State Objectives: [derived from Learning Outcomes]`, etc. If `checklist.md` already exists, validate it contains all 9 events as task headings. Emit FAIL for missing events.

**DF-027**:
> Validate `research.md` (when present) for H2 headings: `## Sources`, `## Evidence`, `## Assumptions/Unknowns`. Emit WARN (not FAIL) for missing sections since the file is optional. Sources section should contain at least one item if present.

**DF-028**:
> Validate that all four draft artifacts contain an `## Agent Contributions` section with at minimum: `### Role` (which agent produced this), `### Assumptions` (list), `### Unknowns` (list). Emit FAIL if the section is missing from any artifact. This ensures agent outputs are traceable and auditable.

**DF-029**:
> In `docflow publish`, validate that the target path is exactly `publish/[slug].md` — no path separators in slug, no nested directories. Reject slugs containing `/` or `\`. Validate on both `docflow publish` and `docflow validate`.

---

### 5.3 Cognitive Load Validation

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-030 | The system SHALL WARN when any paragraph exceeds 5 sentences. | P0 | RF-05, RF-11 | Write 7-sentence paragraph; validate; confirm WARN. |
| DF-031 | The system SHALL WARN when any bulleted or numbered list exceeds 7 items. | P0 | RF-05 | Write 9-item list; validate; confirm WARN. |
| DF-032 | The system SHALL WARN when any bulleted or numbered list has fewer than 3 items. | P1 | RF-05 | Write 2-item list; validate; confirm WARN. Rewrite with 3; passes. |
| DF-033 | The system SHALL WARN when any content section (between headings) exceeds 500 words without a subheading. | P0 | RF-05, RF-11 | Write 600-word section under one heading; validate; confirm WARN. |
| DF-034 | The system SHALL FAIL for tutorial content type when code examples lack inline comments explaining *why*, not just *what*. | P1 | RF-06 | Write uncommented code block in tutorial; validate with tutorial profile; confirm FAIL. |
| DF-035 | The system SHALL validate that every tutorial has at least one annotated worked example before any exercise/practice section. | P0 | RF-06 | Tutorial with exercise but no worked example; validate; confirm FAIL. |
| DF-036 | The system SHALL WARN when code blocks are more than 3 lines of prose away from their explaining text. | P1 | RF-05, RF-08 | Place code block 6 lines after its reference; validate; confirm WARN. |

#### OpenSpec Prompts — Cognitive Load Validation

**DF-030**:
> Implement paragraph length validator. Parse content Markdown into AST. For each paragraph node, count sentences (split on `. `, `! `, `? ` after trimming). If count > 5, emit WARN: `Paragraph at line [N] has [X] sentences (max recommended: 5). Consider splitting for readability. [RF-05, RF-11]`. Use retext-sentence for accurate sentence boundary detection.

**DF-031**:
> Implement list length validator. Parse Markdown AST for ordered and unordered list nodes. Count direct children (list items). If count > 7, emit WARN: `List at line [N] has [X] items (recommended: 3-7). Cognitive load theory suggests grouping into sublists. [RF-05]`.

**DF-032**:
> Extend list length validator. If list item count < 3, emit WARN: `List at line [N] has only [X] items. Consider using prose instead of a list, or combining with an adjacent list. [RF-05]`.

**DF-033**:
> Implement section density validator. Walk the heading tree in the Markdown AST. For each section (content between two headings of the same or higher level), count words. If > 500, emit WARN: `Section "[heading text]" at line [N] is [X] words without a subheading. Consider breaking into subsections. [RF-05, RF-11]`.

**DF-034**:
> Implement code comment validator (tutorial profile only). For each fenced code block in a tutorial, check if it contains at least one comment line (language-appropriate: `//`, `#`, `/* */`, `--`, etc.). If no comments found and block is > 3 lines, emit FAIL: `Code block at line [N] has no explanatory comments. Tutorials require annotated examples. [RF-06]`. Only active when validation profile is "tutorial".

**DF-035**:
> Implement worked example ordering validator (tutorial profile only). Find all sections containing exercise/practice keywords (`exercise`, `try it`, `practice`, `your turn`, `challenge`). For each, check that at least one code block with comments appears *before* it in the document. If not, emit FAIL: `Exercise at line [N] appears before any worked example. Tutorials must demonstrate before asking readers to practice. [RF-06]`.

**DF-036**:
> Implement code-prose proximity validator. For each fenced code block, search backward and forward for the nearest paragraph referencing it (contains language/variable names that appear in the code). If gap > 3 non-empty lines, emit WARN: `Code block at line [N] may be too far from its explanation. Keep code and explanation adjacent to avoid split-attention effect. [RF-05, RF-08]`.

---

### 5.4 Engagement Mechanics Validation

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-040 | The system SHALL FAIL when the first 200 words of a document (excluding front matter) do not contain an opening hook: a question, a "you" + problem-verb pattern, a surprising statistic, or an explicit outcome promise. | P0 | RF-04, RF-01 | Write document starting with dry definition; validate; confirm FAIL. Rewrite with question; passes. |
| DF-041 | The system SHALL WARN when a conceptual section provides an answer without first posing a question or problem statement. | P0 | RF-04, RF-03 | Write section with direct explanation, no problem framing; validate; confirm WARN. |
| DF-042 | The system SHALL validate that each major content section (H2-level) in tutorials and guides contains at least one `#### Example:` or `#### Use Case:` subsection. | P0 | RF-06, RF-16 | Write H2 section without example; validate tutorial profile; confirm FAIL. |
| DF-043 | The system SHALL WARN when examples use generic placeholder names (foo, bar, baz, example, test, sample, myVar, myFunc, MyClass). | P0 | RF-16 | Use `const foo = bar()` in example; validate; confirm WARN suggesting domain-specific names. |
| DF-044 | The system SHALL validate that tutorials contain numbered steps with explicit progress indicators (e.g., "Step 1 of 5"). | P1 | RF-15, RF-13 | Tutorial without numbered steps; validate; confirm WARN. |
| DF-045 | The system SHALL WARN when any document lacks a "Next Steps" or equivalent forward-linking section at the end. | P0 | RF-04, RF-13 | Document without next steps; validate; confirm WARN. Add section; passes. |
| DF-046 | The system SHALL validate that section transitions include forward-momentum phrases (e.g., "Next, we'll...", "Now that you've...", "Let's see how..."). | P1 | RF-04, RF-02 | Check transitions between H2 sections; validate; WARN if >50% of transitions lack momentum phrases. |
| DF-047 | The system SHALL validate that tutorials follow a three-act narrative arc: setup (prerequisites + goal), confrontation (steps + complications), resolution (working result + mastery confirmation). | P1 | RF-02, RF-18 | Tutorial missing resolution section; validate; confirm WARN. |

#### OpenSpec Prompts — Engagement Mechanics

**DF-040**:
> Implement opening hook validator. Extract the first 200 words of content (after YAML front matter). Check for at least one of: (1) A question mark `?` in a sentence, (2) The word "you" within 3 words of a problem verb (struggle, need, want, wonder, frustrated, confused, stuck, hate, wish, tired), (3) A number followed by a claim pattern (`\d+\s*(percent|%|times|x|ways|steps|reasons|things|mistakes)`), (4) An outcome promise ("you will learn", "you'll be able to", "by the end", "after reading"). If none found, emit FAIL: `Opening lacks an engagement hook in the first 200 words. Start with a question, relatable problem, surprising statistic, or clear outcome promise. [RF-04, RF-01]`.

**DF-041**:
> Implement question-before-answer validator. For each H2 section in guide/conceptual content, check if the section begins with a question, problem statement (keywords: problem, challenge, issue, difficult, struggle, why, how, what if), or "you"-focused tension. If the section jumps directly to an explanation or solution (keywords: solution, answer, here's how, simply, just) without framing, emit WARN: `Section "[heading]" at line [N] provides answers without first posing a question or problem. Engage curiosity before explaining. [RF-04, RF-03]`.

**DF-042**:
> Implement example presence validator. For tutorials and guides, find all H2-level sections. For each, search for an `#### Example:` or `#### Use Case:` heading within the section. If missing, emit FAIL: `Section "[heading]" at line [N] has no example or use case. Every major concept needs at least one concrete illustration. [RF-06, RF-16]`. Exemptions: sections titled "Prerequisites", "Introduction", "Next Steps", "Summary".

**DF-043**:
> Implement placeholder name detector. Scan all code blocks and inline code for a blocklist: `foo`, `bar`, `baz`, `qux`, `quux`, `example`, `test`, `sample`, `myVar`, `myFunc`, `MyClass`, `doSomething`, `SomeClass`, `placeholder`. Case-insensitive matching. If found, emit WARN: `Generic placeholder "[name]" at line [N]. Use domain-specific names (e.g., "user", "order", "payment") for concrete, engaging examples. [RF-16]`.

**DF-044**:
> Implement step numbering validator (tutorial profile). Check for ordered list items or headings matching `Step \d+`. If steps exist, check for progress indicators matching pattern `Step \d+ of \d+` or `(\d+/\d+)`. If steps exist but lack progress indicators, emit WARN: `Steps found but no progress indicators (e.g., "Step 3 of 7"). Progress signals increase completion rates. [RF-15, RF-13]`.

**DF-045**:
> Implement next-steps validator. Search the final 20% of the document for headings matching: `next steps`, `what's next`, `where to go`, `further reading`, `continue`, `keep learning`, `related`. Case-insensitive. If not found, emit WARN: `Document lacks a forward-linking section at the end. Add "Next Steps" to maintain reader momentum. [RF-04, RF-13]`.

**DF-046**:
> Implement transition validator. Extract the last paragraph of each H2 section and the first paragraph of the next H2 section. Check for transition phrases: "next", "now that", "let's", "with that", "building on", "moving on", "so far", "having", "before we". If more than 50% of H2 transitions lack any such phrase, emit WARN: `[X]% of section transitions lack momentum phrases. Use "Now that you've...", "Next, we'll..." to maintain flow. [RF-04, RF-02]`.

**DF-047**:
> Implement narrative arc validator (tutorial profile). Check for three structural elements: (1) **Setup**: A section in the first 20% containing prerequisites, goals, or "what you'll build" language. (2) **Confrontation**: Middle sections containing step-by-step instructions, code, or procedural content. (3) **Resolution**: A section in the final 20% containing success confirmation ("congratulations", "you've built", "you now have", "working") or a demo/output block. Emit WARN per missing element: `Tutorial missing [setup|confrontation|resolution] act. [RF-02, RF-18]`.

---

### 5.5 Readability Validation

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-050 | The system SHALL compute Flesch-Kincaid Grade Level for content and WARN when it exceeds the profile's target (default: grade 10 for general docs, grade 12 for whitepapers). | P0 | RF-11 | Write content at grade 14; validate; confirm WARN. Simplify to grade 9; passes. |
| DF-051 | The system SHALL WARN when any single sentence exceeds 30 words. | P0 | RF-05, RF-11 | Write 35-word sentence; validate; confirm WARN. |
| DF-052 | The system SHALL WARN when passive voice exceeds 20% of total sentences. | P0 | RF-17 | Write 10 sentences, 4 passive; validate; confirm WARN. |
| DF-053 | The system SHALL WARN when the ratio of "you" pronouns to system-focused subjects ("the API", "the system", "the tool", "the library") is below 1:2. | P1 | RF-17 | Write content with 2 "you" and 10 "the system"; validate; confirm WARN. |
| DF-054 | The system SHALL WARN when headings are non-descriptive (matching a blocklist: "Overview", "Details", "Miscellaneous", "Notes", "General", "Introduction" without qualifier). | P1 | RF-11 | Use heading "## Overview"; validate; confirm WARN. Use "## Authentication Overview"; passes. |
| DF-055 | The system SHALL validate that the first sentence of each paragraph contains the main point (topic sentence test) by checking it introduces the paragraph's dominant keyword/concept. | P2 | RF-11 | Paragraph whose key term appears only in sentence 3; validate; confirm WARN. |

#### OpenSpec Prompts — Readability

**DF-050**:
> Implement Flesch-Kincaid Grade Level calculator. Formula: `0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59`. Strip code blocks and front matter before computing. Compare result against profile threshold: tutorial=8, guide=10, reference=10, whitepaper=12. Emit WARN if exceeded: `Flesch-Kincaid Grade Level is [X] (target: [Y] for [profile]). Consider shorter sentences and simpler vocabulary. [RF-11]`. Use `syllable` npm package for syllable counting.

**DF-051**:
> Implement sentence length validator. Split prose (excluding code blocks) into sentences using retext. For each sentence with word count > 30, emit WARN: `Sentence at line [N] has [X] words (max recommended: 30). Break into shorter sentences for clarity. [RF-05, RF-11]`. Include the first 10 words of the sentence in the diagnostic for context.

**DF-052**:
> Implement passive voice detector. Use retext-passive or pattern matching for `is/are/was/were/been/being` + past participle patterns. Count passive sentences against total sentences. If ratio > 0.20, emit WARN: `Passive voice detected in [X]% of sentences (max recommended: 20%). Use active voice: "The function returns X" instead of "X is returned by the function". [RF-17]`.

**DF-053**:
> Implement reader-focus analyzer. Count occurrences of "you", "your", "you'll", "you've" (reader pronouns) and occurrences of system-focused phrases: "the API", "the system", "the tool", "the library", "the framework", "the module", "the service", "the platform". Compute ratio. If reader-pronouns < system-subjects / 2, emit WARN: `Reader focus ratio is [X]:[Y] (you:system). Rewrite system-centric sentences to center the reader: "You can query data" instead of "The API provides a query endpoint". [RF-17]`.

**DF-054**:
> Implement heading descriptiveness validator. Check all headings against blocklist of vague standalone headings: `Overview`, `Details`, `Miscellaneous`, `Notes`, `General`, `Introduction`, `Background`, `Summary`, `Other`, `More`, `Info`, `Additional`. Match is only when the heading is exactly one of these words (case-insensitive). Qualified versions (e.g., "Authentication Overview") are allowed. Emit WARN: `Heading "[text]" at line [N] is non-descriptive. Use keyword-rich headings that readers can scan. [RF-11]`.

**DF-055**:
> Implement topic sentence validator (P2). For each paragraph, extract the most frequent non-stopword noun or noun-phrase. Check if it appears in the first sentence. If the dominant topic word first appears in sentence 2 or later, emit WARN: `Paragraph at line [N] may not frontload its main point. The key topic "[word]" first appears in sentence [X]. Move it to the opening sentence for scanability. [RF-11]`. This is a heuristic and may generate false positives — use WARN severity.

---

### 5.6 Visual Support Validation

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-056 | The system SHALL WARN when any conceptual section exceeds 300 words without an image, diagram reference, or code block. | P0 | RF-08 | Write 400-word conceptual section with no visuals; validate; confirm WARN. |
| DF-057 | The system SHALL WARN when content contains architecture/flow/hierarchy keywords without a corresponding diagram reference. | P1 | RF-08 | Write about "system architecture" without diagram; validate; confirm WARN. |
| DF-058 | The system SHALL FAIL when images lack alt text. | P0 | RF-08 | Include `![](image.png)`; validate; confirm FAIL. Add alt text; passes. |
| DF-059 | The system SHALL validate that all image paths referenced in content resolve to existing files. | P0 | — | Reference nonexistent image; validate; confirm FAIL. |

#### OpenSpec Prompts — Visual Support

**DF-056**:
> Implement visual density validator. For each section between headings, count words and check for presence of: image syntax `![`, fenced code blocks, or Mermaid/diagram blocks. If word count > 300 and none found, and section heading or content contains conceptual keywords (explain, understand, concept, theory, approach, how it works, architecture), emit WARN: `Section "[heading]" at line [N] is [X] words with no visual aids. Add a diagram, image, or code example to support understanding. [RF-08]`.

**DF-057**:
> Implement diagram suggestion validator. Scan section headings and content for keywords: `architecture`, `flow`, `pipeline`, `hierarchy`, `tree`, `state machine`, `lifecycle`, `sequence`, `relationship`, `structure`, `topology`. If found and section contains no image reference or Mermaid code block, emit WARN: `Section discusses [keyword] but contains no diagram. Consider adding a visual representation for dual-coding benefit. [RF-08]`.

**DF-058**:
> Implement image alt text validator. Find all image references matching `!\[([^\]]*)\]\(([^)]+)\)`. If the alt text (capture group 1) is empty, emit FAIL: `Image at line [N] has no alt text. Alt text is required for accessibility and SEO. Describe what the image shows. [RF-08]`.

**DF-059**:
> Implement image path validator. For each image reference, extract the path (capture group 2). Resolve relative to the content file's directory. Check if the file exists on disk. If not, emit FAIL: `Image path "[path]" at line [N] does not exist. Fix the path or add the missing image file.`.

---

### 5.7 Engagement Scoring

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-060 | The system SHALL compute a **Curiosity Score** (0-10) based on: count of information gaps, opening hooks, cliffhanger transitions, and question-based headings. | P0 | RF-04, RF-03 | Validate document with 0 hooks → score 0; add 3 hooks + 2 questions → score increases proportionally. |
| DF-061 | The system SHALL compute a **Clarity Score** (0-10) based on: Flesch-Kincaid grade level, paragraph length compliance, list compliance, and heading descriptiveness. | P0 | RF-05, RF-11 | Validate dense document → low score; simplify → score increases. |
| DF-062 | The system SHALL compute an **Action Score** (0-10) based on: count of runnable code examples, exercises, next-steps sections, and concrete outcomes. | P0 | RF-06, RF-10 | Validate document with 0 examples → score 0; add 3 annotated examples → score increases. |
| DF-063 | The system SHALL compute a **Flow Score** (0-10) based on: presence of section transitions, tension-release patterns, progressive disclosure compliance, and narrative arc. | P1 | RF-02, RF-07 | Validate document with abrupt section changes → low score; add transitions → score increases. |
| DF-064 | The system SHALL compute a **Voice Score** (0-10) based on: active voice ratio, "you"-to-system ratio, conversational markers (contractions, questions), and personal pronoun usage. | P1 | RF-17, RF-01 | Validate formal passive document → low score; rewrite conversationally → score increases. |
| DF-065 | The system SHALL compute a **Total Engagement Score** as a weighted average of the five dimension scores, with weights configurable in `project.md`. | P1 | All RF | Verify total score changes when weights are adjusted in config. |

#### OpenSpec Prompts — Engagement Scoring

**DF-060**:
> Implement curiosity scoring engine. Components and weights: (1) Opening hook present: +3 points. (2) Information gaps (question posed before answer): +1 per gap, max +3. (3) Cliffhanger transitions between sections: +0.5 per, max +2. (4) Question-based headings: +0.5 per, max +2. Normalize to 0-10 scale. Return `{ score: number, breakdown: { hooks: number, gaps: number, cliffhangers: number, questionHeadings: number } }`.

**DF-061**:
> Implement clarity scoring engine. Components: (1) Flesch-Kincaid within target: +3 points (scale from 0 at +4 over target, to 3 at target or below). (2) Paragraph compliance (% of paragraphs ≤ 5 sentences): scale 0-3. (3) List compliance (% of lists with 3-7 items): scale 0-2. (4) Heading descriptiveness (% of headings passing blocklist check): scale 0-2. Return breakdown object.

**DF-062**:
> Implement action scoring engine. Components: (1) Code examples present: +1 per annotated example, max +4. (2) Exercises/practice sections: +2 per, max +4. (3) Next-steps section present: +1. (4) Concrete outcome statements ("you now have", "you can now"): +0.5 per, max +1. Return breakdown object.

**DF-063**:
> Implement flow scoring engine. Components: (1) Section transition phrases (% of H2 transitions with momentum phrases): scale 0-3. (2) Tension-release patterns (% of sections with problem-before-solution): scale 0-3. (3) Progressive disclosure (jargon/complexity increases through document, not clustered early): scale 0-2. (4) Narrative arc completeness (setup/confrontation/resolution): scale 0-2. Return breakdown object.

**DF-064**:
> Implement voice scoring engine. Components: (1) Active voice ratio (scale: 0 at ≤60%, 3 at ≥80%): max +3. (2) Reader pronoun ratio (you:system, scale: 0 at ≤1:4, 3 at ≥1:1): max +3. (3) Contractions present (natural tone): +1 if any contractions used. (4) Questions in prose (direct engagement): +0.5 per question, max +2. (5) Informal markers ("let's", "we'll", "here's"): +0.5 per unique, max +1. Return breakdown object.

**DF-065**:
> Implement total engagement score calculator. Default weights: Curiosity=0.25, Clarity=0.25, Action=0.20, Flow=0.15, Voice=0.15. Read custom weights from `project.md` YAML block or `docflow.yaml` under key `scoring.weights`. Compute `totalScore = sum(score[i] * weight[i])`. Display in `docflow show` and `docflow metrics` output. Return `{ total: number, dimensions: { curiosity: number, clarity: number, action: number, flow: number, voice: number }, weights: object }`.

---

### 5.8 Validation Profiles

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-040P | **Tutorial profile** SHALL enforce: opening hook (FAIL), learning objectives (FAIL), prerequisites (FAIL), worked examples before exercises (FAIL), numbered steps (WARN), practice exercises (FAIL), narrative arc (WARN), Gagné compliance (WARN). FK target: grade 8. | P0 | RF-06, RF-09, RF-18 | Validate tutorial missing exercises; confirm FAIL. |
| DF-041P | **Reference profile** SHALL enforce: front matter completeness (FAIL), heading hierarchy (FAIL), code examples (WARN), image alt text (FAIL). Opening hooks, narrative arc, and exercises are NOT checked. FK target: grade 10. | P0 | RF-11, RF-12 | Validate reference doc without hook; confirm no diagnostic. |
| DF-042P | **Guide profile** SHALL enforce: opening hook (FAIL), examples per section (FAIL), question-before-answer (WARN), visual support (WARN), next steps (WARN), tension-release (WARN). FK target: grade 10. | P0 | RF-04, RF-06, RF-08 | Validate guide without next steps; confirm WARN. |
| DF-043P | **Whitepaper profile** SHALL enforce: opening hook (FAIL), ethos signals in first 500 words (WARN), evidence/citations (WARN), logical argument structure (WARN), visual support (WARN). FK target: grade 12. Formal tone acceptable — relaxed voice scoring. | P0 | RF-01, RF-14 | Validate whitepaper without citations; confirm WARN. |

#### OpenSpec Prompts — Validation Profiles

**DF-040P**:
> Define tutorial validation profile as a configuration object listing each rule ID and its severity: `{ 'DF-040': 'FAIL', 'DF-042': 'FAIL', 'DF-035': 'FAIL', 'DF-044': 'WARN', 'DF-047': 'WARN', 'DF-026': 'WARN', fleschKincaidTarget: 8 }`. When `docflow validate [slug] --profile tutorial` is run (or content type is "tutorial"), load this profile and apply only the listed rules at their specified severities. Rules not listed are skipped.

**DF-041P**:
> Define reference validation profile: `{ 'DF-020': 'FAIL', headingHierarchy: 'FAIL', 'DF-042': 'SKIP', 'DF-040': 'SKIP', 'DF-047': 'SKIP', codeExamples: 'WARN', 'DF-058': 'FAIL', fleschKincaidTarget: 10 }`. Reference docs skip opening hooks, narrative arc, and exercise validation. Focus on structure, completeness, and accessibility.

**DF-042P**:
> Define guide validation profile: `{ 'DF-040': 'FAIL', 'DF-042': 'FAIL', 'DF-041': 'WARN', 'DF-056': 'WARN', 'DF-045': 'WARN', tensionRelease: 'WARN', fleschKincaidTarget: 10 }`. Guides are the balanced middle ground — hooks and examples required, narrative elements encouraged.

**DF-043P**:
> Define whitepaper validation profile: `{ 'DF-040': 'FAIL', ethosSignals: 'WARN', citations: 'WARN', logicalStructure: 'WARN', 'DF-056': 'WARN', fleschKincaidTarget: 12, voiceScoring: 'relaxed' }`. Whitepapers allow formal tone (relaxed voice scoring means passive voice threshold increases to 35% and reader pronoun ratio is not checked). Add ethos signal check: in the first 500 words, look for authority markers (credentials, company names, statistics, "research shows", "study", "data", "evidence").

---

### 5.9 Agent Workflow

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-070 | The system SHALL support an **interview mode** where the agent asks the SME structured questions derived from the `outline.md` template and generates draft content from the answers. | P0 | RF-10 | Start interview for a tutorial; verify agent asks about learning outcomes, examples, audience knowledge. |
| DF-071 | The system SHALL support a **transform mode** where the SME provides raw notes, bullet points, or rough text, and the agent transforms it into engagement-validated content. | P0 | — | Provide raw bullets; verify agent produces structured content with hooks, examples, and transitions. |
| DF-072 | The system SHALL support configurable agent modes per project: single, role-based (researcher/writer/reviewer), and consensus. | P0 | — | Set mode to "role-based" in project config; verify agents hand off correctly. |
| DF-073 | Agent outputs SHALL populate all four draft artifacts (`outline.md`, `research.md`, `content.md`, `checklist.md`) with proper `## Agent Contributions` sections. | P0 | — | Run agent workflow; verify all 4 files created with Agent Contributions sections. |
| DF-074 | The system SHALL define agent instructions in `docflow/AGENTS.md` that encode the engagement research (Aristotle, Loewenstein, Sweller, Gagné, Nielsen, etc.) as actionable writing guidance. | P0 | All RF | Review AGENTS.md; verify it contains operational instructions for each research principle, not just citations. |
| DF-075 | The system SHALL provide agent role definitions with explicit handoff format: what each role receives as input, what it produces as output, and what metadata it must include. | P1 | — | Review role definitions; verify input/output contracts are explicit for researcher, writer, reviewer. |

#### OpenSpec Prompts — Agent Workflow

**DF-070**:
> Implement interview mode AGENTS.md instructions. The agent MUST: (1) Read the content type template to determine required sections. (2) Ask the SME questions in this order: "Who is the target reader?", "What should they be able to do after reading?", "What do they already know?", "What's the core problem this solves?", "Walk me through the main steps/concepts", "What mistakes do people commonly make?", "What's the surprising insight or key takeaway?". (3) Generate `outline.md` from answers. (4) Draft `content.md` following the outline, applying engagement rules from this AGENTS.md. (5) Generate `checklist.md` mapped to Gagné's 9 events. (6) Document all assumptions in Agent Contributions sections.

**DF-071**:
> Implement transform mode AGENTS.md instructions. The agent MUST: (1) Receive raw input from SME (notes, bullets, rough draft). (2) Analyze for: missing hooks, absent examples, passive voice, cognitive load violations, missing structure. (3) Generate `outline.md` that structures the raw input into proper engagement-validated format. (4) Transform raw content into `content.md` applying: opening hook, tension-release per section, concrete examples, reader-centric voice, progressive disclosure. (5) Preserve all of the SME's factual content — never hallucinate domain claims. (6) Flag uncertain transformations in Agent Contributions.

**DF-072**:
> Implement agent mode configuration in `project.md` or `docflow.yaml`. Schema: `agents: { mode: 'single' | 'role-based' | 'consensus', interaction: 'interview' | 'transform', roles: { researcher: boolean, writer: boolean, reviewer: boolean }, human_review: 'required' | 'optional' }`. In AGENTS.md, document when each mode is appropriate: single (simple docs), role-based (complex whitepapers), consensus (high-stakes content). Default: `{ mode: 'single', interaction: 'interview', human_review: 'required' }`.

**DF-073**:
> All agent-produced artifacts MUST include `## Agent Contributions` at the end with: `### Role` (which agent/mode produced this), `### Model` (LLM model used, if known), `### Assumptions` (bulleted list of assumptions made during generation), `### Unknowns` (bulleted list of items that need SME verification), `### Confidence` (self-assessed confidence: high/medium/low with explanation). Validation (DF-028) enforces presence of this section.

**DF-074**:
> Write `docflow/AGENTS.md` encoding research as operational instructions. Structure: (1) Quick reference checklist of engagement rules. (2) Per content type: which rules apply, with examples of good/bad output. (3) Writing guidance derived from each research source — not "use information gaps" but "pose a specific question in the opening paragraph before explaining the concept." (4) Common mistakes to avoid (generic examples, passive voice, answer-before-question). (5) Self-validation: before completing, the agent MUST run through each applicable rule mentally and verify compliance.

**DF-075**:
> Define role contracts in AGENTS.md. **Researcher**: receives outline.md, produces research.md (sources, evidence, competitive analysis). Input: outline + SME topic. Output: research.md with Sources, Evidence, Assumptions sections. **Writer**: receives outline.md + research.md, produces content.md. Input: outline + research. Output: engagement-validated content.md. **Reviewer**: receives all artifacts, produces review comments. Input: all 4 artifacts. Output: inline comments, engagement score assessment, list of violations. Each role MUST document handoff in Agent Contributions: "Received [files] from [role], produced [file]."

---

### 5.10 Human Review & Publishing

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-080 | The system SHALL require explicit human signoff before any draft can be promoted to `publish/`. | P0 | — | Attempt `docflow publish` without signoff; confirm rejection. |
| DF-081 | Human signoff SHALL be recorded as a `## Human Review` section in `checklist.md` with reviewer name, date, and approval status. | P0 | — | Add Human Review section with `approved: true`; publish succeeds. |
| DF-082 | The `docflow publish` command SHALL refuse to execute if `docflow validate --strict` returns any FAIL results. | P0 | — | Introduce validation failure; attempt publish; confirm refusal. |
| DF-083 | The `docflow publish` command SHALL resolve all `{{doc:slug}}` references and produce a self-contained master Markdown file. | P0 | — | Publish doc with cross-refs; verify output contains resolved links. |
| DF-084 | Archived files SHALL be named `archive/YYYY-MM-DD-[slug].md` using the archive date. | P0 | — | Archive; verify filename format. |
| DF-085 | The system SHALL prevent publishing if any `## Agent Contributions` → `### Unknowns` section is non-empty, unless the human review explicitly acknowledges remaining unknowns. | P1 | — | Publish with unresolved unknowns and no acknowledgment; confirm rejection. |

#### OpenSpec Prompts — Human Review & Publishing

**DF-080**:
> In `docflow publish [slug]`, before copying to `publish/`, check `drafts/[slug]/checklist.md` for a `## Human Review` section containing `approved: true` (or `status: approved`). If not found, emit FAIL and abort: `Human review required before publishing. Add a "## Human Review" section to checklist.md with "approved: true" after reviewing all content.`. This gate cannot be bypassed even with `--yes` flag.

**DF-081**:
> Define the Human Review section format in checklist.md: ```\n## Human Review\n- **Reviewer**: [name]\n- **Date**: [YYYY-MM-DD]\n- **Status**: approved | rejected | needs-revision\n- **Notes**: [optional comments]\n```. Validate that `Status` is one of the allowed values. Only `approved` allows publish to proceed.

**DF-082**:
> In `docflow publish`, run the full validation suite equivalent to `docflow validate [slug] --strict` before proceeding. If any rule emits FAIL (or WARN in strict mode), abort publish with the diagnostic output and message: `Cannot publish: validation failed. Fix the above issues and try again.`. Do not partially publish.

**DF-083**:
> During `docflow publish`, after validation passes, process the `content.md` file: (1) Resolve all `{{doc:slug}}` patterns to `[title](slug.md)` links. (2) Strip the `## Agent Contributions` section (internal metadata, not for readers). (3) Ensure front matter is clean (remove internal-only fields if any). (4) Write result to `publish/[slug].md`. The published file must be self-contained — no references to draft artifacts.

**DF-084**:
> In `docflow archive [slug]`, compute filename as `archive/${new Date().toISOString().slice(0, 10)}-${slug}.md`. Move `publish/[slug].md` to the archive path. If `drafts/[slug]/` exists, move the entire directory to `archive/${date}-${slug}/`. Log the archive action.

**DF-085**:
> In `docflow publish`, after checking human review, inspect all `## Agent Contributions` → `### Unknowns` sections across all 4 artifacts. If any `### Unknowns` section contains non-empty content (not just "None" or empty list), check the Human Review section for an `acknowledged_unknowns: true` field. If unknowns exist and are not acknowledged, abort: `Agent-flagged unknowns remain unresolved. Either resolve them or add "acknowledged_unknowns: true" to the Human Review section after reviewing.`.

---

### 5.11 LLM Artifact Detection

| ID | Requirement | Priority | Research | Verification |
|---|---|---|---|---|
| DF-090 | The system SHALL maintain a curated dictionary of LLM-telltale patterns organized into categories: (a) overused style words derived from peer-reviewed excess vocabulary research, (b) typographic artifacts (em dashes, smart quotes, decorative emoji, bullet-style emoji), (c) filler phrases and hedge phrases characteristic of LLM output, and (d) structural patterns (excessive adverb-verb pairs, formulaic transitions). | P0 | RF-19 | Verify dictionary contains all categories with ≥10 entries each. |
| DF-091 | The system SHALL provide a `scan-llm-artifacts` validation rule that detects LLM-telltale patterns in document content and emits WARN diagnostics with the matched pattern, line number, and a suggested human-written replacement. | P0 | RF-19 | Write content containing "delve", "tapestry", "landscape", em dashes, and "It's worth noting that"; validate; confirm WARN per match with replacements. |
| DF-092 | The `docflow validate` command SHALL include a `--strip-llm` flag that, when set, outputs a cleaned version of the document with all detected LLM artifacts replaced by their suggested alternatives (or removed where no replacement exists), writing the result to stdout or a specified output file. | P1 | RF-19 | Run `docflow validate --strip-llm` on content with 5+ artifacts; verify output contains replacements and no remaining artifacts. |
| DF-093 | The `scan-llm-artifacts` rule SHALL be included in all validation profiles at WARN severity, and the publish gate SHALL emit an advisory count of remaining LLM artifacts (not blocking). | P0 | RF-19 | Publish a document with LLM artifacts present; confirm advisory message with count but successful publish. |

#### OpenSpec Prompts — LLM Artifact Detection

**DF-090**:
> Create `src/validators/llm-artifacts.ts` containing a curated dictionary `LLM_ARTIFACT_PATTERNS` organized into four categories. **(a) Overused style words** (from Kobak et al. 2024 excess vocabulary research): single words that LLMs use at statistically elevated rates. Include at minimum: `delve`, `delves`, `delving`, `tapestry`, `landscape`, `comprehensive`, `intricate`, `nuanced`, `multifaceted`, `pivotal`, `crucial`, `furthermore`, `moreover`, `notably`, `underscores`, `showcasing`, `leveraging`, `harnessing`, `fostering`, `streamlining`, `facilitating`, `illuminating`, `elucidating`, `groundbreaking`, `commendable`, `meticulous`, `meticulously`, `encompassing`, `realm`, `paradigm`, `holistic`, `robust`, `seamless`, `seamlessly`, `transformative`, `unparalleled`, `invaluable`, `indispensable`, `imperative`, `formidable`, `burgeoning`, `cutting-edge`, `spearheading`, `revolutionize`, `revolutionizing`, `underscored`, `underscoring`, `accentuating`, `intricacies`, `adept`, `poised`, `endeavors`, `endeavours`, `interplay`, `synergy`, `synergies`, `pinnacle`, `bedrock`, `cornerstone`, `underpinning`, `orchestrating`, `navigating`. Each word should have a suggested replacement or "[remove or rephrase]" instruction. **(b) Typographic artifacts**: em dash `—` (suggest: `–` or ` - `), decorative/filler emoji (🚀, 💡, ✨, 🎯, 🔑, 🌟, ⭐, 🏆, 📌, 🔥, 💪, 🎉, 👉, ⚡, 🤔, 🧠, 📝, 🛠️, 🔍, 📊), smart/curly quotes `""''` (suggest: straight quotes). **(c) Filler/hedge phrases**: `It's worth noting that`, `It is important to note that`, `It should be noted that`, `In today's rapidly evolving`, `In the ever-evolving landscape of`, `In this comprehensive guide`, `Let's dive in`, `Let's delve into`, `Without further ado`, `At the end of the day`, `In conclusion,` (at paragraph start), `To summarize,`, `As we navigate`, `As we delve`, `This is a game-changer`, `game-changing`, `Take it to the next level`, `best practices`, `In order to` (suggest: `To`), `Due to the fact that` (suggest: `Because`), `In the realm of` (suggest: `In`), `A myriad of` (suggest: `Many`), `Serves as a testament to`, `Is a testament to`. **(d) Structural patterns**: regex for sentences starting with `Additionally, `, `Furthermore, `, `Moreover, `, `Consequently, `, `Notably, `, `Importantly, ` (overused conjunctive adverb openers). Export the dictionary and a `scanLlmArtifacts(content: string): LlmArtifactMatch[]` function returning `{ line: number, column: number, pattern: string, category: string, replacement: string, message: string }` per match.

**DF-091**:
> Register a validation rule `scan-llm-artifacts` in the rule registry. This rule takes a `ValidationContext` and calls `scanLlmArtifacts(ctx.rawContent)`. For each match, emit a WARN diagnostic: `LLM artifact detected: "${pattern}" — ${replacement} [RF-19]`. Include the line number. The rule ID is `llm-artifacts`. Use severity WARN (never FAIL) because some flagged words may be intentionally used by the author.

**DF-092**:
> Add `--strip-llm` flag to `registerValidateCommand`. When set, after running validation, apply all LLM artifact replacements to produce a cleaned document. For each `LlmArtifactMatch`, replace the matched text with its `replacement` value. If replacement is `[remove or rephrase]` or empty, comment the match for manual review (wrap in `<!-- LLM: original text -->` markers). Output the cleaned content to stdout. If `--json` is set, include `{ cleaned: string, replacements: number }` in the output. This flag is independent of `--strict` and `--engagement-report`.

**DF-093**:
> In `src/validators/profiles.ts`, add `llm-artifacts` to every profile's rule list at WARN severity. In `docflow publish`, after the existing gates (human review, unknowns, validation), run `scanLlmArtifacts` on the content and report an advisory: `Advisory: ${count} LLM artifact(s) detected. Consider running 'docflow validate --strip-llm' to review.`. This advisory does NOT block publishing — it is informational only.

---

## 6. Requirements Traceability Matrix

| Req ID | Category | Research | Validates Via | Depends On |
|---|---|---|---|---|
| DF-001 | CLI | — | Integration test | — |
| DF-002 | CLI | RF-09, RF-10 | Template file check | DF-001 |
| DF-003 | CLI | — | Integration test | DF-024 |
| DF-004 | CLI | — | Integration test | DF-008 |
| DF-005 | CLI | — | Integration test | DF-060–065 |
| DF-006 | CLI | All RF | Integration test | DF-030–059, DF-040P–043P |
| DF-007 | CLI | All RF | Integration test | DF-060–065 |
| DF-008 | CLI | — | Integration test | DF-006, DF-080 |
| DF-009 | CLI | — | Integration test | DF-008 |
| DF-010 | CLI | RF-05, RF-11 | Integration test | DF-050, DF-060–065 |
| DF-011 | CLI | — | Integration test | DF-001–010 |
| DF-020 | Structure | RF-09 | Unit test (parser) | — |
| DF-021 | Structure | RF-15 | Unit test | DF-020 |
| DF-022 | Structure | — | Unit test (resolver) | DF-020 |
| DF-023 | Structure | — | Unit test | DF-022 |
| DF-024 | Structure | RF-09, RF-10 | Unit test | — |
| DF-025 | Structure | RF-01, RF-04, RF-07, RF-10 | Unit test | DF-024 |
| DF-026 | Structure | RF-09 | Unit test | DF-025 |
| DF-027 | Structure | RF-14 | Unit test | DF-024 |
| DF-028 | Structure | — | Unit test | DF-024 |
| DF-029 | Structure | — | Unit test | DF-008 |
| DF-030 | Cognitive Load | RF-05, RF-11 | Fixture test | — |
| DF-031 | Cognitive Load | RF-05 | Fixture test | — |
| DF-032 | Cognitive Load | RF-05 | Fixture test | — |
| DF-033 | Cognitive Load | RF-05, RF-11 | Fixture test | — |
| DF-034 | Cognitive Load | RF-06 | Fixture test | DF-040P |
| DF-035 | Cognitive Load | RF-06 | Fixture test | DF-040P |
| DF-036 | Cognitive Load | RF-05, RF-08 | Fixture test | — |
| DF-040 | Engagement | RF-04, RF-01 | Fixture test | — |
| DF-041 | Engagement | RF-04, RF-03 | Fixture test | — |
| DF-042 | Engagement | RF-06, RF-16 | Fixture test | — |
| DF-043 | Engagement | RF-16 | Fixture test | — |
| DF-044 | Engagement | RF-15, RF-13 | Fixture test | DF-040P |
| DF-045 | Engagement | RF-04, RF-13 | Fixture test | — |
| DF-046 | Engagement | RF-04, RF-02 | Fixture test | — |
| DF-047 | Engagement | RF-02, RF-18 | Fixture test | DF-040P |
| DF-050 | Readability | RF-11 | Unit test | — |
| DF-051 | Readability | RF-05, RF-11 | Fixture test | — |
| DF-052 | Readability | RF-17 | Fixture test | — |
| DF-053 | Readability | RF-17 | Fixture test | — |
| DF-054 | Readability | RF-11 | Fixture test | — |
| DF-055 | Readability | RF-11 | Fixture test | — |
| DF-056 | Visual | RF-08 | Fixture test | — |
| DF-057 | Visual | RF-08 | Fixture test | — |
| DF-058 | Visual | RF-08 | Fixture test | — |
| DF-059 | Visual | — | Fixture test | — |
| DF-060 | Scoring | RF-04, RF-03 | Golden test | DF-040, DF-041, DF-046 |
| DF-061 | Scoring | RF-05, RF-11 | Golden test | DF-050, DF-030, DF-031, DF-054 |
| DF-062 | Scoring | RF-06, RF-10 | Golden test | DF-042, DF-035, DF-045 |
| DF-063 | Scoring | RF-02, RF-07 | Golden test | DF-046, DF-041, DF-047 |
| DF-064 | Scoring | RF-17, RF-01 | Golden test | DF-052, DF-053 |
| DF-065 | Scoring | All RF | Golden test | DF-060–064 |
| DF-040P | Profile | RF-06, RF-09, RF-18 | Config test | DF-006 |
| DF-041P | Profile | RF-11, RF-12 | Config test | DF-006 |
| DF-042P | Profile | RF-04, RF-06, RF-08 | Config test | DF-006 |
| DF-043P | Profile | RF-01, RF-14 | Config test | DF-006 |
| DF-070 | Agent | RF-10 | Agent test | DF-024, DF-074 |
| DF-071 | Agent | — | Agent test | DF-024, DF-074 |
| DF-072 | Agent | — | Config test | DF-074 |
| DF-073 | Agent | — | Unit test | DF-028 |
| DF-074 | Agent | All RF | Review | — |
| DF-075 | Agent | — | Review | DF-074 |
| DF-080 | Publishing | — | Integration test | DF-081 |
| DF-081 | Publishing | — | Unit test | — |
| DF-082 | Publishing | — | Integration test | DF-006 |
| DF-083 | Publishing | — | Integration test | DF-022 |
| DF-084 | Publishing | — | Integration test | — |
| DF-085 | Publishing | — | Integration test | DF-028, DF-081 |
| DF-090 | LLM Detection | RF-19 | Unit test | — |
| DF-091 | LLM Detection | RF-19 | Fixture test | DF-090 |
| DF-092 | LLM Detection | RF-19 | Integration test | DF-091 |
| DF-093 | LLM Detection | RF-19 | Config test, Integration test | DF-091, DF-040P–043P |

---

## 7. Priority Summary

| Priority | Count | Categories |
|---|---|---|
| **P0 — Must have v1** | 55 | Core CLI, structure validation, cognitive load checks, engagement mechanics, readability, visual support, scoring, profiles, agent workflow, publishing, LLM artifact detection |
| **P1 — Should have v1** | 16 | Engagement report, transition validation, narrative arc, voice scoring, flow scoring, total score, agent role definitions, unknown acknowledgment, LLM artifact stripping |
| **P2 — Future** | 1 | Topic sentence validation (NLP-heavy) |

---

## 8. Out of Scope (v1)

- HTML/PDF rendering from Markdown
- Web-based GUI or editor
- Real-time collaborative editing
- Analytics integration (page views, reader behavior)
- Custom validation rule API (user-defined rules)
- i18n / multi-language support
- AI-powered content generation without SME input
- Integration with external CMS platforms

---

## 9. Success Criteria

1. An SME with no writing training can produce a document scoring ≥7/10 engagement using DocFlow's agent workflow
2. All 52 P0 requirements pass automated validation
3. `docflow validate --strict` catches ≥90% of cognitive load, engagement, and readability issues in test fixtures
4. Full draft → publish workflow completes in under 30 minutes for a standard tutorial (excluding SME interview time)
5. Agent-produced content is indistinguishable from professional technical writing in blind review

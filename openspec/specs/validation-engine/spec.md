# validation-engine Specification

## Purpose
TBD - created by archiving change add-core-commands. Update Purpose after archive.
## Requirements
### Requirement: Validation Rule Engine

The system SHALL provide a rule-based validation engine where each rule is a function that takes a Markdown AST and context, and returns an array of diagnostics. Each diagnostic SHALL include: rule ID, severity (PASS/WARN/FAIL), line number, human-readable message, and research foundation citation. Rules SHALL be stateless and composable.

Traces to: DF-006

#### Scenario: Rule produces diagnostics

- **WHEN** a validation rule detects a violation
- **THEN** it returns a diagnostic with severity, line number, message, and research citation (e.g., `[RF-05]`)

#### Scenario: Rule produces no diagnostics

- **WHEN** content satisfies a validation rule
- **THEN** the rule returns an empty diagnostic array

---

### Requirement: Validation Profiles

The system SHALL define validation profiles for tutorial (DF-040P), reference (DF-041P), guide (DF-042P), and whitepaper (DF-043P). Each profile SHALL specify which rules apply and at what severity. Rules not listed in a profile SHALL be skipped. The profile SHALL be auto-detected from content front matter `type` field or specified via `--profile` flag.

Traces to: DF-040P, DF-041P, DF-042P, DF-043P

#### Scenario: Tutorial profile loads correct rules

- **WHEN** content type is "tutorial"
- **THEN** opening hook (FAIL), learning objectives (FAIL), prerequisites (FAIL), worked examples (FAIL), numbered steps (WARN), practice exercises (FAIL), narrative arc (WARN), Gagné compliance (WARN) rules are active
- **AND** Flesch-Kincaid target is grade 8

#### Scenario: Reference profile skips engagement rules

- **WHEN** content type is "reference"
- **THEN** opening hook, narrative arc, and exercise validation rules are skipped
- **AND** front matter completeness (FAIL), heading hierarchy (FAIL), code examples (WARN), image alt text (FAIL) rules are active

#### Scenario: Guide profile balanced rules

- **WHEN** content type is "guide"
- **THEN** opening hook (FAIL), examples per section (FAIL), question-before-answer (WARN), visual support (WARN), next steps (WARN), tension-release (WARN) rules are active
- **AND** Flesch-Kincaid target is grade 10

#### Scenario: Whitepaper profile with relaxed voice

- **WHEN** content type is "whitepaper"
- **THEN** opening hook (FAIL), ethos signals (WARN), evidence/citations (WARN), logical argument structure (WARN), visual support (WARN) rules are active
- **AND** Flesch-Kincaid target is grade 12
- **AND** passive voice threshold increases to 35%

---

### Requirement: Front Matter Validation

Every content file SHALL include YAML front matter with required fields: `id` (kebab-case slug matching directory name), `title` (non-empty string), `type` (tutorial|reference|guide|whitepaper), `audience` (beginner|intermediate|advanced), and `prerequisites` (array of strings, may be empty). Missing or invalid fields SHALL produce a FAIL diagnostic.

Traces to: DF-020

#### Scenario: Valid front matter

- **WHEN** front matter contains all required fields with valid values
- **THEN** validation passes with no diagnostics

#### Scenario: Missing required field

- **WHEN** front matter is missing the `audience` field
- **THEN** a FAIL diagnostic is emitted: "Missing required front matter field: audience"

#### Scenario: Invalid type value

- **WHEN** front matter contains `type: blog`
- **THEN** a FAIL diagnostic is emitted: "Invalid content type: blog. Must be one of: tutorial, reference, guide, whitepaper"

---

### Requirement: Cross-Reference Validation

The system SHALL scan content for `{{doc:slug}}` cross-reference patterns. During validation, the system SHALL check that each reference resolves to either `publish/[slug].md` or `drafts/[slug]/content.md`. Unresolvable references SHALL produce a FAIL diagnostic.

Traces to: DF-022, DF-023

#### Scenario: Valid cross-reference

- **WHEN** content contains `{{doc:auth-guide}}` and `publish/auth-guide.md` exists
- **THEN** no diagnostic is emitted

#### Scenario: Unresolvable cross-reference

- **WHEN** content contains `{{doc:nonexistent}}`
- **THEN** a FAIL diagnostic is emitted: "Unresolved cross-reference: {{doc:nonexistent}}"

---

### Requirement: Draft Completeness Validation

Each draft SHALL consist of four artifacts in `drafts/[slug]/`: `outline.md`, `research.md`, `content.md`, `checklist.md`. Missing `research.md` SHALL emit WARN. Missing any other file SHALL emit FAIL.

Traces to: DF-024

#### Scenario: Complete draft

- **WHEN** all four files exist in `drafts/[slug]/`
- **THEN** no diagnostics are emitted

#### Scenario: Missing content.md

- **WHEN** `drafts/[slug]/content.md` is missing
- **THEN** a FAIL diagnostic is emitted

#### Scenario: Missing research.md

- **WHEN** `drafts/[slug]/research.md` is missing
- **THEN** a WARN diagnostic is emitted (research is optional)

---

### Requirement: Outline Structure Validation

The `outline.md` artifact SHALL require H2 headings: Reader Context, Learning Outcomes, Engagement Strategy, Narrative Arc, Visual Requirements, Practice/Interaction. Under Engagement Strategy, H3 subheadings SHALL be required: Opening Hook, Ethos Signals, Pathos Triggers, Logos Structure, Information Gaps, Tension-Release Beats.

Traces to: DF-025

#### Scenario: Valid outline with all sections

- **WHEN** outline.md contains all required H2 and H3 headings
- **THEN** no diagnostics are emitted

#### Scenario: Missing Engagement Strategy subheading

- **WHEN** outline.md is missing `### Information Gaps` under `## Engagement Strategy`
- **THEN** a FAIL diagnostic is emitted

---

### Requirement: Agent Contributions Validation

All four draft artifacts SHALL include an `## Agent Contributions` section with subsections: `### Role`, `### Assumptions`, `### Unknowns`. Missing section SHALL produce a FAIL diagnostic.

Traces to: DF-028

#### Scenario: Missing Agent Contributions

- **WHEN** `content.md` lacks `## Agent Contributions`
- **THEN** a FAIL diagnostic is emitted

---

### Requirement: Cognitive Load Validation

The system SHALL validate cognitive load: paragraphs > 5 sentences (WARN, DF-030), lists > 7 items (WARN, DF-031), lists < 3 items (WARN, DF-032), sections > 500 words without subheading (WARN, DF-033), uncommented code in tutorials (FAIL, DF-034), exercise before worked example in tutorials (FAIL, DF-035), code > 3 lines from explanation (WARN, DF-036). All diagnostics SHALL cite research foundation RF-05, RF-06, RF-08, or RF-11.

Traces to: DF-030, DF-031, DF-032, DF-033, DF-034, DF-035, DF-036

#### Scenario: Long paragraph

- **WHEN** a paragraph has 7 sentences
- **THEN** WARN: "Paragraph at line N has 7 sentences (max recommended: 5). [RF-05, RF-11]"

#### Scenario: Long list

- **WHEN** a list has 9 items
- **THEN** WARN: "List at line N has 9 items (recommended: 3-7). [RF-05]"

#### Scenario: Short list

- **WHEN** a list has 2 items
- **THEN** WARN: "List at line N has only 2 items. [RF-05]"

#### Scenario: Uncommented tutorial code

- **WHEN** a tutorial code block > 3 lines has no comments
- **THEN** FAIL: "Code block at line N has no explanatory comments. [RF-06]"

---

### Requirement: Engagement Mechanics Validation

The system SHALL validate engagement: opening hook in first 200 words (FAIL, DF-040), question-before-answer (WARN, DF-041), example per H2 section in tutorials/guides (FAIL, DF-042), generic placeholder names in code (WARN, DF-043), step progress indicators (WARN, DF-044), next-steps section (WARN, DF-045), section transitions (WARN, DF-046), tutorial narrative arc (WARN, DF-047).

Traces to: DF-040, DF-041, DF-042, DF-043, DF-044, DF-045, DF-046, DF-047

#### Scenario: Missing opening hook

- **WHEN** the first 200 words contain no question, problem pattern, statistic, or outcome promise
- **THEN** FAIL: "Opening lacks an engagement hook in the first 200 words. [RF-04, RF-01]"

#### Scenario: Placeholder name detected

- **WHEN** code contains `const foo = bar()`
- **THEN** WARN: "Generic placeholder 'foo' at line N. Use domain-specific names. [RF-16]"

#### Scenario: Missing next steps

- **WHEN** the final 20% of the document has no next-steps heading
- **THEN** WARN: "Document lacks a forward-linking section at the end. [RF-04, RF-13]"

---

### Requirement: Readability Validation

The system SHALL validate readability: Flesch-Kincaid grade level against profile target (WARN, DF-050), sentences > 30 words (WARN, DF-051), passive voice > 20% (WARN, DF-052), low reader-focus ratio (WARN, DF-053), vague standalone headings (WARN, DF-054), topic sentence frontloading (WARN, DF-055).

Traces to: DF-050, DF-051, DF-052, DF-053, DF-054, DF-055

#### Scenario: High Flesch-Kincaid grade

- **WHEN** FK grade level is 14 and profile target is 10
- **THEN** WARN: "Flesch-Kincaid Grade Level is 14 (target: 10). [RF-11]"

#### Scenario: Excessive passive voice

- **WHEN** 30% of sentences are passive voice
- **THEN** WARN: "Passive voice detected in 30% of sentences (max: 20%). [RF-17]"

#### Scenario: Vague heading

- **WHEN** a heading is exactly "Overview" with no qualifier
- **THEN** WARN: "Heading 'Overview' at line N is non-descriptive. [RF-11]"

---

### Requirement: Visual Support Validation

The system SHALL validate visual support: conceptual sections > 300 words without visuals (WARN, DF-056), architecture keywords without diagram (WARN, DF-057), images without alt text (FAIL, DF-058), broken image paths (FAIL, DF-059).

Traces to: DF-056, DF-057, DF-058, DF-059

#### Scenario: Missing alt text

- **WHEN** content contains `![](image.png)`
- **THEN** FAIL: "Image at line N has no alt text. [RF-08]"

#### Scenario: Broken image path

- **WHEN** content references `![diagram](missing.png)` and `missing.png` does not exist
- **THEN** FAIL: "Image path 'missing.png' at line N does not exist."

---

### Requirement: Human Review Gate

The `docflow publish` command SHALL require explicit human signoff recorded as a `## Human Review` section in `checklist.md` with `Status: approved`. The gate SHALL NOT be bypassable even with `--yes`. The section SHALL include reviewer name, date, and status (approved|rejected|needs-revision).

Traces to: DF-080, DF-081

#### Scenario: Human review approved

- **WHEN** `checklist.md` contains `## Human Review` with `Status: approved`
- **THEN** the human review gate passes

#### Scenario: Human review missing

- **WHEN** `checklist.md` lacks `## Human Review`
- **THEN** publish aborts: "Human review required before publishing."

#### Scenario: Human review rejected

- **WHEN** `## Human Review` has `Status: rejected`
- **THEN** publish aborts: "Human review status is 'rejected'. Cannot publish."


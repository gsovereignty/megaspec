## MODIFIED Requirements

### Requirement: Validation Profiles

The system SHALL define validation profiles for tutorial (DF-040P), reference (DF-041P), guide (DF-042P), and whitepaper (DF-043P). Each profile SHALL specify which rules apply and at what severity. Rules not listed in a profile SHALL be skipped. The profile SHALL be auto-detected from content front matter `type` field or specified via `--profile` flag. All profiles SHALL include the `llm-artifacts` rule at WARN severity.

Traces to: DF-040P, DF-041P, DF-042P, DF-043P, DF-093

#### Scenario: Tutorial profile loads correct rules

- **WHEN** content type is "tutorial"
- **THEN** opening hook (FAIL), learning objectives (FAIL), prerequisites (FAIL), worked examples (FAIL), numbered steps (WARN), practice exercises (FAIL), narrative arc (WARN), Gagné compliance (WARN), llm-artifacts (WARN) rules are active
- **AND** Flesch-Kincaid target is grade 8

#### Scenario: All profiles include LLM artifact detection

- **WHEN** any content type is validated
- **THEN** the `llm-artifacts` rule is active at WARN severity

---

## ADDED Requirements

### Requirement: LLM Artifact Dictionary

The system SHALL maintain a curated dictionary of LLM-telltale patterns organized into categories: (a) overused style words derived from peer-reviewed excess vocabulary research, (b) typographic artifacts (em dashes, smart quotes, decorative emoji), (c) filler phrases and hedge phrases characteristic of LLM output, and (d) structural patterns (overused conjunctive adverb sentence openers). The dictionary SHALL export a scanner function returning matches with line, column, pattern, category, replacement, and message.

Traces to: DF-090

#### Scenario: Dictionary contains all categories

- **GIVEN** the LLM artifact dictionary
- **THEN** it contains entries in categories: word, typography, phrase, structural
- **AND** each category has at least 10 entries

#### Scenario: Scanner detects overused words

- **GIVEN** content containing "delve into the intricacies"
- **WHEN** the scanner runs
- **THEN** it returns matches for "delve" and "intricacies" with suggested replacements

#### Scenario: Scanner skips code blocks

- **GIVEN** content with `delve` inside a fenced code block
- **WHEN** the scanner runs
- **THEN** no match is returned for that occurrence

---

### Requirement: LLM Artifact Validation Rule

The system SHALL provide a `scan-llm-artifacts` validation rule that detects LLM-telltale patterns in document content and emits WARN diagnostics with the matched pattern, line number, and a suggested human-written replacement. The rule SHALL cite RF-19 in all diagnostics.

Traces to: DF-091

#### Scenario: Rule detects LLM artifacts

- **GIVEN** a document containing "delve", an em dash, and "It's worth noting that"
- **WHEN** validation runs with the `llm-artifacts` rule
- **THEN** three WARN diagnostics are emitted, each with pattern, replacement, and `[RF-19]`

#### Scenario: Clean content produces no diagnostics

- **GIVEN** a document with no LLM artifacts
- **WHEN** validation runs with the `llm-artifacts` rule
- **THEN** no diagnostics are produced

---

### Requirement: Validate --strip-llm Flag

The `docflow validate` command SHALL include a `--strip-llm` flag that outputs a cleaned version of the document with all detected LLM artifacts replaced by their suggested alternatives. When replacement is "[remove or rephrase]", the original text SHALL be wrapped in HTML comment markers for manual review.

Traces to: DF-092

#### Scenario: Strip replaces artifacts

- **GIVEN** a document containing "leveraging" and "In order to"
- **WHEN** `docflow validate --strip-llm` is run
- **THEN** stdout contains the document with "leveraging" replaced by "using" and "In order to" replaced by "To"

#### Scenario: Strip with --json includes metadata

- **GIVEN** a document with LLM artifacts
- **WHEN** `docflow validate --strip-llm --json` is run
- **THEN** the JSON output includes `cleaned` (string) and `replacements` (number) fields

---

### Requirement: Publish LLM Advisory

The publish gate SHALL emit an advisory count of remaining LLM artifacts after all mandatory gates pass. This advisory is informational only and does NOT block publishing.

Traces to: DF-093

#### Scenario: Publish with artifacts shows advisory

- **GIVEN** a publishable document containing LLM artifacts
- **WHEN** `docflow publish` succeeds (all gates pass)
- **THEN** an advisory message is shown: "Advisory: N LLM artifact(s) detected."

#### Scenario: Publish without artifacts shows no advisory

- **GIVEN** a publishable document with no LLM artifacts
- **WHEN** `docflow publish` succeeds
- **THEN** no LLM advisory is shown

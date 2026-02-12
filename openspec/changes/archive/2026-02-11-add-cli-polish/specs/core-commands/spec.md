# core-commands spec delta

## MODIFIED Requirements

### Requirement: List Published Documents

The system SHALL provide a `docflow list --publish` command that scans `publish/*.md` and displays each document's ID, title, audience, and estimated reading time. Reading time SHALL be computed dynamically from word count (excluding code blocks and front matter) at 200 wpm.

Traces to: DF-004, DF-021

#### Scenario: List published documents with --publish flag

- **WHEN** `publish/` contains `auth-guide.md` and `setup-tutorial.md`
- **THEN** `docflow list --publish` displays a table with ID, Title, Audience, and Reading Time
- **AND** reading time is computed from word count at 200 words per minute

#### Scenario: Reading time computation

- **WHEN** a published document contains 1000 words (excluding front matter and code blocks)
- **THEN** reading time is displayed as "5 min"

#### Scenario: List --publish with --json

- **WHEN** the user runs `docflow list --publish --json`
- **THEN** output is valid JSON: `{ "success": true, "documents": [...] }`
- **AND** each document includes `id`, `title`, `audience`, and `readingTime` fields

#### Scenario: List --publish with no published documents

- **WHEN** `publish/` is empty
- **THEN** `docflow list --publish` displays "No published documents found."

---

### Requirement: Show Document

The system SHALL provide a `docflow show [item]` command that displays the contents of a draft (from `drafts/[slug]/content.md`) or published document (from `publish/[slug].md`). When showing a draft, the command SHALL also run the scoring engine and append an engagement score summary showing all 5 dimensions (curiosity, clarity, action, flow, voice) plus the total score.

Traces to: DF-005

#### Scenario: Show a draft with engagement scores

- **WHEN** the user runs `docflow show auth-guide` and `drafts/auth-guide/content.md` exists
- **THEN** the document metadata is displayed followed by an engagement score summary
- **AND** all 5 engagement dimensions (curiosity, clarity, action, flow, voice) are shown with numeric scores

#### Scenario: Show a published document without scores

- **WHEN** the user runs `docflow show auth-guide` and `publish/auth-guide.md` exists
- **THEN** the document metadata is displayed
- **AND** no engagement scores are shown (published docs are finalized)

#### Scenario: Show with --json

- **WHEN** the user runs `docflow show auth-guide --json` for a draft
- **THEN** output is valid JSON containing metadata and engagement score data

---

### Requirement: Validate Command

The system SHALL provide a `docflow validate [slug]` command that loads the validation profile matching the content type (or specified by `--profile`), runs all rules in the profile, and outputs diagnostics. Each diagnostic SHALL report `[PASS]`, `[WARN]`, or `[FAIL]` with file location, explanation, and research citation. Exit code SHALL be 0 if no FAIL results, 1 otherwise. The command SHALL support `--strict` (treat WARN as FAIL), `--rule <ruleId>` (run a single rule), and `--engagement-report` (detailed scoring breakdown with descriptive labels).

Traces to: DF-006, DF-007

#### Scenario: Validate with --engagement-report

- **WHEN** the user runs `docflow validate auth-guide --engagement-report`
- **THEN** output includes curiosity, clarity, action, flow, and voice scores with descriptive labels
- **AND** each dimension shows a numeric score and contextual description

#### Scenario: Validate with --engagement-report and --json

- **WHEN** the user runs `docflow validate auth-guide --engagement-report --json`
- **THEN** output is valid JSON: `{ "success": boolean, "diagnostics": [...], "engagement": { "total": number, "dimensions": {...} } }`

#### Scenario: Validate without --engagement-report

- **WHEN** the user runs `docflow validate auth-guide` (no `--engagement-report` flag)
- **THEN** output includes only validation diagnostics, no engagement scores

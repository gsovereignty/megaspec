# core-commands Specification

## Purpose
TBD - created by archiving change add-core-commands. Update Purpose after archive.
## Requirements
### Requirement: List Drafts

The system SHALL provide a `docflow list` command that scans the `drafts/` directory and displays all active drafts with their slug, content type, and status (draft/in-review/validated). The command SHALL support `--json` for machine-readable output.

Traces to: DF-003

#### Scenario: List drafts with multiple entries

- **WHEN** the user has drafts at `drafts/auth-guide/`, `drafts/setup-tutorial/`, and `drafts/api-ref/`
- **THEN** `docflow list` displays a table with slug, type, and status for all three
- **AND** types and statuses are read from front matter in `content.md` or `outline.md`

#### Scenario: List drafts with no drafts

- **WHEN** the `drafts/` directory is empty
- **THEN** `docflow list` displays "No drafts found."
- **AND** exits with code 0

#### Scenario: List drafts with --json

- **WHEN** the user runs `docflow list --json`
- **THEN** output is valid JSON: `{ "success": true, "drafts": [...] }`

---

### Requirement: List Published Documents

The system SHALL provide a `docflow list --publish` command that scans `publish/*.md` and displays each document's ID, title, audience, and estimated reading time. Reading time SHALL be computed dynamically from word count at 200 wpm.

Traces to: DF-004, DF-021

#### Scenario: List published documents

- **WHEN** `publish/` contains `auth-guide.md` and `setup-tutorial.md`
- **THEN** `docflow list --publish` displays a table with id, title, audience, and reading time for each

#### Scenario: Reading time computation

- **WHEN** a published document contains 1000 words (excluding front matter and code blocks)
- **THEN** reading time is displayed as "5 min"

---

### Requirement: Show Document

The system SHALL provide a `docflow show [item]` command that displays the contents of a draft (from `drafts/[slug]/content.md`) or published document (from `publish/[slug].md`). When showing a draft, the command SHALL also run the scoring engine and append an engagement score summary.

Traces to: DF-005

#### Scenario: Show a draft with scores

- **WHEN** the user runs `docflow show auth-guide` and `drafts/auth-guide/content.md` exists
- **THEN** the document content is displayed followed by an engagement score summary

#### Scenario: Show a published document

- **WHEN** the user runs `docflow show auth-guide` and `publish/auth-guide.md` exists
- **THEN** the document content is displayed

#### Scenario: Show with --json

- **WHEN** the user runs `docflow show auth-guide --json`
- **THEN** output is valid JSON containing content and score data

---

### Requirement: Validate Command

The system SHALL provide a `docflow validate [slug]` command that loads the validation profile matching the content type (or specified by `--profile`), runs all rules in the profile, and outputs diagnostics. Each diagnostic SHALL report `[PASS]`, `[WARN]`, or `[FAIL]` with file location, explanation, and research citation. Exit code SHALL be 0 if no FAIL results, 1 otherwise. The command SHALL support `--strict` (treat WARN as FAIL) and `--engagement-report` (detailed scoring breakdown).

Traces to: DF-006, DF-007

#### Scenario: Validate a draft with failures

- **WHEN** the user runs `docflow validate setup-tutorial` and the draft has missing prerequisites
- **THEN** the output includes a FAIL diagnostic for the missing section with line number and research citation
- **AND** exit code is 1

#### Scenario: Validate with auto-detected profile

- **WHEN** the content's front matter contains `type: tutorial`
- **THEN** the tutorial validation profile is loaded automatically without `--profile`

#### Scenario: Validate with --strict

- **WHEN** the user runs `docflow validate auth-guide --strict` and there are WARN diagnostics
- **THEN** WARN diagnostics are elevated to FAIL and exit code is 1

#### Scenario: Validate with --engagement-report

- **WHEN** the user runs `docflow validate auth-guide --engagement-report`
- **THEN** output includes curiosity, clarity, action, flow, and voice scores with breakdowns

#### Scenario: Validate with --json

- **WHEN** the user runs `docflow validate auth-guide --json`
- **THEN** output is valid JSON: `{ "success": boolean, "diagnostics": [...], "scores"?: {...} }`

---

### Requirement: Publish Command

The system SHALL provide a `docflow publish [slug]` command that promotes a validated draft to `publish/[slug].md`. Publishing SHALL enforce sequential gates: (1) draft exists, (2) `docflow validate --strict` passes, (3) human review is approved in `checklist.md`, (4) no unacknowledged agent unknowns, (5) copy `content.md` to `publish/[slug].md`, (6) resolve all `{{doc:slug}}` cross-references. Any gate failure aborts the operation. Published files MUST be flat — no subdirectories in `publish/`.

Traces to: DF-008, DF-029, DF-080, DF-081, DF-082, DF-083, DF-085

#### Scenario: Successful publish

- **WHEN** the draft passes validation, has human review approval, and no unresolved unknowns
- **THEN** `publish/[slug].md` is created with resolved cross-references
- **AND** exit code is 0

#### Scenario: Publish rejected — validation failure

- **WHEN** `docflow validate [slug] --strict` returns FAIL results
- **THEN** publish aborts with diagnostic output: "Cannot publish: validation failed."

#### Scenario: Publish rejected — no human review

- **WHEN** `checklist.md` lacks a `## Human Review` section with `approved: true`
- **THEN** publish aborts: "Human review required before publishing."

#### Scenario: Publish rejected — unresolved unknowns

- **WHEN** `## Agent Contributions` → `### Unknowns` is non-empty and human review does not acknowledge unknowns
- **THEN** publish aborts with error

#### Scenario: Publish rejected — nested slug

- **WHEN** the user runs `docflow publish sub/dir-slug`
- **THEN** publish rejects the slug containing path separators

#### Scenario: Cross-reference resolution

- **WHEN** content contains `{{doc:auth-guide}}` and `publish/auth-guide.md` exists
- **THEN** the reference is replaced with `[Auth Guide](auth-guide.md)` in the published file

#### Scenario: Publish with --json

- **WHEN** the user runs `docflow publish auth-guide --json`
- **THEN** output is valid JSON: `{ "success": true, "published": "publish/auth-guide.md" }`

---

### Requirement: Archive Command

The system SHALL provide a `docflow archive [slug]` command that moves a published file from `publish/[slug].md` to `archive/YYYY-MM-DD-[slug].md` using the current date. If `drafts/[slug]/` still exists, it SHALL also be moved to `archive/YYYY-MM-DD-[slug]/`. The command SHALL support `--yes` to skip confirmation prompt.

Traces to: DF-009, DF-084

#### Scenario: Archive a published document

- **WHEN** the user runs `docflow archive auth-guide`
- **THEN** `publish/auth-guide.md` is moved to `archive/2026-02-11-auth-guide.md`
- **AND** the user is prompted for confirmation (unless `--yes`)

#### Scenario: Archive with draft cleanup

- **WHEN** `drafts/auth-guide/` exists alongside `publish/auth-guide.md`
- **THEN** both are moved to `archive/` with date prefix

#### Scenario: Archive nonexistent document

- **WHEN** `publish/auth-guide.md` does not exist
- **THEN** the command fails with "No published document found: auth-guide"

#### Scenario: Archive with --yes

- **WHEN** the user runs `docflow archive auth-guide --yes`
- **THEN** no confirmation prompt is shown

#### Scenario: Archive with --json

- **WHEN** the user runs `docflow archive auth-guide --json`
- **THEN** output is valid JSON: `{ "success": true, "archived": [...] }`

---

### Requirement: Metrics Command

The system SHALL provide a `docflow metrics [item]` command that displays readability scores (Flesch-Kincaid grade level, average sentence length, passive voice percentage), structural metrics (paragraph count, average paragraph length, list compliance), engagement score breakdown (5 dimensions with individual scores), and validation profile compliance summary.

Traces to: DF-010

#### Scenario: Metrics for a published document

- **WHEN** the user runs `docflow metrics auth-guide`
- **THEN** output includes Flesch-Kincaid grade, sentence length, passive voice %, engagement scores, and profile compliance

#### Scenario: Metrics with --json

- **WHEN** the user runs `docflow metrics auth-guide --json`
- **THEN** output is valid JSON with all metric values


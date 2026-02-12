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

The `docflow validate [file]` command SHALL run the full validation suite against a document. It SHALL support `--strict` (treat warnings as errors), `--rule <ruleId>` (run specific rule), `--engagement-report` (include engagement scores), and `--strip-llm` (output cleaned document with LLM artifacts replaced). Human output SHALL group diagnostics by severity. JSON output SHALL include diagnostics array, pass/warn/fail counts, and optional engagement and cleaned-content fields.

Traces to: DF-006, DF-007, DF-092

#### Scenario: Validate with --strip-llm

- **GIVEN** a file containing LLM artifacts like "delve" and em dashes
- **WHEN** `docflow validate --strip-llm <file>` is run
- **THEN** stdout contains the document with artifacts replaced by suggested alternatives
- **AND** validation diagnostics are still shown

#### Scenario: Validate --strip-llm --json

- **GIVEN** a file with LLM artifacts
- **WHEN** `docflow validate --strip-llm --json <file>` is run
- **THEN** output includes `cleaned` (cleaned content string) and `replacements` (count of applied replacements)

### Requirement: Publish Command

The system SHALL provide a `docflow publish [slug]` command that promotes a validated draft to `publish/[slug].md`. Publishing SHALL enforce sequential gates: (1) draft exists, (2) `docflow validate --strict` passes with zero failures — validation is mandatory and cannot be skipped, (3) human review is approved in `checklist.md`, (4) no unacknowledged agent unknowns remain, (5) read `content.md` and resolve all `{{doc:slug}}` cross-references, (6) strip all `## Agent Contributions` sections from published output, (7) add `published_at` timestamp to front matter, (8) write clean self-contained file to `publish/[slug].md`. Any gate failure aborts the operation. Published files MUST be flat — no subdirectories in `publish/`. The `--skip-validation` and `--strict` flags SHALL be removed since strict validation is always mandatory.

Traces to: DF-008, DF-029, DF-080, DF-081, DF-082, DF-083, DF-085

#### Scenario: Successful publish

- **WHEN** the draft passes strict validation, has human review approval, and no unresolved unknowns
- **THEN** `publish/[slug].md` is created with resolved cross-references, Agent Contributions stripped, and `published_at` timestamp
- **AND** exit code is 0

#### Scenario: Publish rejected — validation failure

- **WHEN** `docflow validate [slug] --strict` returns FAIL results
- **THEN** publish aborts with diagnostic output: "Cannot publish: validation failed. Fix the above issues and try again."

#### Scenario: Publish rejected — no human review

- **WHEN** `checklist.md` lacks a `## Human Review` section or status is not `approved`
- **THEN** publish aborts: "Human review required before publishing. Add a '## Human Review' section to checklist.md with 'Status: approved' after reviewing all content."

#### Scenario: Publish rejected — human review rejected

- **WHEN** `## Human Review` has `Status: rejected` or `Status: needs-revision`
- **THEN** publish aborts: "Human review status is '[status]'. Cannot publish."

#### Scenario: Publish rejected — unresolved unknowns

- **WHEN** any draft artifact has non-empty content under `## Agent Contributions` → `### Unknowns` and Human Review does not contain `acknowledged_unknowns: true`
- **THEN** publish aborts: "Agent-flagged unknowns remain unresolved. Either resolve them or add 'acknowledged_unknowns: true' to the Human Review section after reviewing."

#### Scenario: Publish with acknowledged unknowns

- **WHEN** `### Unknowns` has content but Human Review contains `acknowledged_unknowns: true`
- **THEN** publish proceeds normally

#### Scenario: Agent Contributions stripped from output

- **WHEN** publish succeeds
- **THEN** the published file does NOT contain `## Agent Contributions` or any of its subsections (`### Role`, `### Assumptions`, `### Unknowns`)

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

The system SHALL provide a `docflow archive [slug]` command that moves a published file from `publish/[slug].md` to `archive/YYYY-MM-DD-[slug].md` using the current date. If `drafts/[slug]/` still exists, it SHALL also be moved to `archive/YYYY-MM-DD-[slug]/`. The command SHALL add `archived_at` timestamp and optional `archive_reason` to front matter. The command SHALL support `--reason <reason>` to record why the document was archived.

Traces to: DF-009, DF-084

#### Scenario: Archive a published document

- **WHEN** the user runs `docflow archive auth-guide`
- **THEN** `publish/auth-guide.md` is moved to `archive/2026-02-11-auth-guide.md`
- **AND** `archived_at` timestamp is added to front matter

#### Scenario: Archive with draft cleanup

- **WHEN** `drafts/auth-guide/` exists alongside `publish/auth-guide.md`
- **THEN** `publish/auth-guide.md` is moved to `archive/2026-02-11-auth-guide.md`
- **AND** `drafts/auth-guide/` is moved to `archive/2026-02-11-auth-guide/`

#### Scenario: Archive with reason

- **WHEN** the user runs `docflow archive auth-guide --reason "superseded by v2"`
- **THEN** the archived file's front matter includes `archive_reason: "superseded by v2"`

#### Scenario: Archive nonexistent document

- **WHEN** `publish/auth-guide.md` does not exist
- **THEN** the command fails with "No published document found: auth-guide"
- **AND** exit code is 1

#### Scenario: Archive with --json

- **WHEN** the user runs `docflow archive auth-guide --json`
- **THEN** output is valid JSON: `{ "success": true, "archived": ["archive/2026-02-11-auth-guide.md"] }`

### Requirement: Metrics Command

The system SHALL provide a `docflow metrics [item]` command that displays readability scores (Flesch-Kincaid grade level, average sentence length, passive voice percentage), structural metrics (paragraph count, average paragraph length, list compliance), engagement score breakdown (5 dimensions with individual scores), and validation profile compliance summary.

Traces to: DF-010

#### Scenario: Metrics for a published document

- **WHEN** the user runs `docflow metrics auth-guide`
- **THEN** output includes Flesch-Kincaid grade, sentence length, passive voice %, engagement scores, and profile compliance

#### Scenario: Metrics with --json

- **WHEN** the user runs `docflow metrics auth-guide --json`
- **THEN** output is valid JSON with all metric values


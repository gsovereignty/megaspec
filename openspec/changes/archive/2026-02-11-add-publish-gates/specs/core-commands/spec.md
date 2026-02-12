## MODIFIED Requirements

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

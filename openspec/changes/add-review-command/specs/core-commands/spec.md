## ADDED Requirements
### Requirement: Review Command

The system SHALL provide a `docflow review <slug>` command that manages the `## Human Review` section in `drafts/<slug>/checklist.md`. The command SHALL support `--approve`, `--reject`, and `--needs-revision` flags to set the review status. The `--reviewer <name>` flag SHALL be required when setting a status. The `--acknowledge-unknowns` flag SHALL add `acknowledged_unknowns: true` to the section. The date SHALL be auto-filled with today's date (YYYY-MM-DD format).

When called without a status flag, the command SHALL display the current review status (reviewer, date, status, acknowledged unknowns). If no `## Human Review` section exists, it SHALL report "No review recorded."

If `checklist.md` does not exist, the command SHALL create it with the `## Human Review` section. If the section already exists, the command SHALL update it in place.

The command SHALL support `--json` and `--no-interactive` global flags.

#### Scenario: Approve a draft

- **WHEN** the user runs `docflow review caching-strategies --approve --reviewer "Jane Smith"`
- **THEN** `drafts/caching-strategies/checklist.md` contains a `## Human Review` section with `Status: approved`, `Reviewer: Jane Smith`, and today's date
- **AND** the command outputs `✓ Review recorded: approved by Jane Smith`

#### Scenario: Reject a draft

- **WHEN** the user runs `docflow review caching-strategies --reject --reviewer "Jane Smith"`
- **THEN** the `## Human Review` section has `Status: rejected`

#### Scenario: Show current review status

- **WHEN** the user runs `docflow review caching-strategies` (no status flag)
- **AND** a review exists with `Status: approved` by `Jane Smith` on `2026-02-12`
- **THEN** the command outputs the reviewer, date, and status

#### Scenario: No review recorded yet

- **WHEN** the user runs `docflow review caching-strategies` (no status flag)
- **AND** `checklist.md` has no `## Human Review` section
- **THEN** the command outputs `No review recorded for "caching-strategies".`

#### Scenario: Acknowledge unknowns

- **WHEN** the user runs `docflow review caching-strategies --approve --reviewer "Jane Smith" --acknowledge-unknowns`
- **THEN** the `## Human Review` section includes `acknowledged_unknowns: true`

#### Scenario: Missing reviewer flag

- **WHEN** the user runs `docflow review caching-strategies --approve` without `--reviewer`
- **THEN** the command exits with code 1 and message `--reviewer is required when setting review status`

#### Scenario: Draft does not exist

- **WHEN** `drafts/nonexistent/` does not exist
- **AND** the user runs `docflow review nonexistent --approve --reviewer "Jane"`
- **THEN** the command exits with code 1 and message `Draft "nonexistent" not found at drafts/nonexistent/`

#### Scenario: JSON output

- **WHEN** the user runs `docflow review caching-strategies --approve --reviewer "Jane Smith" --json`
- **THEN** output is valid JSON: `{ "success": true, "slug": "caching-strategies", "status": "approved", "reviewer": "Jane Smith", "date": "2026-02-12" }`

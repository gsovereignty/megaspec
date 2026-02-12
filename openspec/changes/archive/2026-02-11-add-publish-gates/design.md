# Design: add-publish-gates

## Overview

This change implements the publish safety gates and archive naming that the specs already require but the code does not enforce. No new architectural patterns; modifications to two existing command handlers plus one new utility module.

## Publish Command Flow (Updated)

The current `docflow publish <slug>` has two optional gates (validation with `--skip-validation`, strict mode with `--strict`). The updated flow enforces all gates sequentially with no bypass:

```
1. Verify drafts/<slug>/ exists with content.md
2. Run validate --strict (mandatory, no skip flag)
   → Abort on any FAIL
3. Parse checklist.md → ## Human Review section
   → Abort if missing, rejected, or needs-revision
   → Only "approved" proceeds
4. Scan all 4 artifacts for ## Agent Contributions → ### Unknowns
   → If any non-empty unknowns, check Human Review for acknowledged_unknowns: true
   → Abort if unknowns exist and not acknowledged
5. Read content.md
6. Resolve {{doc:slug}} cross-references
7. Strip ## Agent Contributions sections (internal metadata)
8. Add published_at timestamp to front matter
9. Write clean file to publish/<slug>.md
```

### Removed flags

- `--skip-validation` — removed entirely (DF-082 prohibits bypassing)
- `--strict` — removed (strict mode is now always on)

## Human Review Parsing

New module `src/utils/human-review.ts` parses the `## Human Review` section from `checklist.md`:

```
## Human Review
- **Reviewer**: Jane Smith
- **Date**: 2026-02-10
- **Status**: approved
- **Notes**: Looks good, minor typos fixed
- **acknowledged_unknowns**: true
```

Parsing strategy:
- Find `## Human Review` heading in checklist.md content
- Extract key-value pairs from `- **Key**: Value` or `key: value` list items
- Return structured `HumanReviewData` with `status`, `reviewer`, `date`, `acknowledgedUnknowns`
- Status values: `approved`, `rejected`, `needs-revision`

## Unknowns Check

Scan all 4 artifacts (`outline.md`, `content.md`, `checklist.md`, `research.md`) for:
1. A `## Agent Contributions` section
2. Within it, a `### Unknowns` subsection
3. Content under `### Unknowns` that is not empty, "None", "N/A", or an empty list

If non-empty unknowns exist, the Human Review section must contain `acknowledged_unknowns: true`.

## Agent Contributions Stripping

Before writing the published file, remove all content from `## Agent Contributions` to the next `## ` heading (or end of file). This includes `### Role`, `### Assumptions`, `### Unknowns` subsections — all internal metadata.

## Archive Command Changes

Current: `archive/<slug>.md`
Updated: `archive/YYYY-MM-DD-<slug>.md` (ISO date prefix)

When archiving from `publish/`:
- Move `publish/<slug>.md` → `archive/YYYY-MM-DD-<slug>.md`
- If `drafts/<slug>/` also exists, move entire directory → `archive/YYYY-MM-DD-<slug>/`
- Remove `--reason` flag (not in spec), keep metadata in front matter as `archived_at`

## Test Strategy

- **Unit tests** for `human-review.ts`: parse valid sections, handle missing/rejected/needs-revision, extract acknowledged_unknowns
- **Unit tests** for agent contributions stripping: strip section, handle no section, handle section at end of file
- **Unit tests** for unknowns scanning: empty, "None", non-empty, acknowledged
- **Integration tests** for publish: successful publish with all gates, rejection at each gate (no review, rejected review, unknowns, validation failure)
- **Integration tests** for archive: date-prefix naming, draft directory archival

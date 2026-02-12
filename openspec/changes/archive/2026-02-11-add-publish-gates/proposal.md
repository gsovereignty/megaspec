# Proposal: add-publish-gates

## Summary

Implement the publish safety gates and archive naming requirements that are specced but not yet coded. The current `docflow publish` command skips human review, allows `--skip-validation`, does not strip Agent Contributions from published output, and does not check for unacknowledged agent unknowns. The `docflow archive` command uses flat `slug.md` naming instead of the required `YYYY-MM-DD-slug.md` format.

## Motivation

Publishing is the final quality gate before content reaches readers. The PRD mandates (P0) that no draft bypasses human review (DF-080), that strict validation is always enforced (DF-082), and that published files are clean of internal metadata (DF-083). These gates are already specced in `validation-engine` and `core-commands` but the implementation does not enforce them.

## Scope

### In scope

- **Human review gate** (DF-080, DF-081): Parse `checklist.md` for `## Human Review` section, validate status field, block publish if not approved
- **Mandatory strict validation** (DF-082): Remove `--skip-validation` flag, always run `validate --strict` before publish
- **Agent Contributions stripping** (DF-083): Strip `## Agent Contributions` sections from published output
- **Unknowns acknowledgment check** (DF-085): Scan all 4 draft artifacts for non-empty `### Unknowns` under `## Agent Contributions`; require `acknowledged_unknowns: true` in Human Review if present
- **Date-prefixed archive naming** (DF-084): Change archive output from `archive/slug.md` to `archive/YYYY-MM-DD-slug.md`; move draft directory alongside published file
- **Tests**: Unit + integration tests for each gate, archive naming

### Out of scope

- Agent workflow (DF-070–075) — separate proposal
- `--engagement-report` flag on validate (DF-007) — separate enhancement
- Show command engagement summary (DF-005) — separate enhancement

## Design

No new architectural patterns are needed. The changes modify existing command handlers (`publish.ts`, `archive.ts`) and add a new utility module (`src/utils/human-review.ts`) for parsing the checklist Human Review section. See `design.md` for detailed flow changes.

## Affected Specs

- `core-commands` — MODIFIED: Publish Command, Archive Command (tighten scenarios to match implementation)
- `validation-engine` — no spec changes needed (Human Review Gate requirement already exists and is correct)

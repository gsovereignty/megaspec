# Change: Add Core CLI Commands

## Why

The CLI foundation (`docflow init`) exists but has no commands to work with content. Users cannot list, validate, publish, or archive documents. Without these, DocFlow is a scaffolding tool with no document lifecycle.

## What Changes

- Add `docflow list` command to display drafts and published documents (DF-003, DF-004)
- Add `docflow show [item]` command to display a document with engagement scores (DF-005)
- Add `docflow validate [slug]` command with pluggable validation profiles (DF-006, DF-007)
- Add `docflow publish [slug]` command with validation gate and human review gate (DF-008, DF-029, DF-080–083, DF-085)
- Add `docflow archive [slug]` command with timestamped archive naming (DF-009, DF-084)
- Add `docflow metrics [item]` command for readability and engagement summary (DF-010)
- Implement validation engine with rule registry and diagnostic output (DF-020–059)
- Implement engagement scoring engine with 5 dimensions (DF-060–065)
- Implement validation profiles for tutorial, reference, guide, whitepaper (DF-040P–043P)

## Impact

- Affected specs: `core-commands` (new capability), `validation-engine` (new capability), `engagement-scoring` (new capability)
- Affected code: `src/commands/`, `src/validators/`, `src/scoring/`, `src/utils/`
- Dependencies unblocked: DF-070–075 (agent workflow — requires validate and publish)

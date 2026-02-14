# Change: Add `docflow review` command for human review approval

## Why
Approving a draft for publication currently requires the user to manually edit `checklist.md` and type the `## Human Review` section with the correct format (`- **Reviewer**: ...`, `- **Date**: ...`, `- **Status**: approved`). Getting the format wrong causes the publish gate to reject the document with an unhelpful error. This is a mechanical step that should be a single command.

## What Changes
- Add a `docflow review <slug>` command that manages the human review section in `checklist.md`
- `--approve` appends or updates the `## Human Review` section with `Status: approved`
- `--reject` sets `Status: rejected`
- `--needs-revision` sets `Status: needs-revision`
- `--reviewer <name>` sets the reviewer name (required)
- `--acknowledge-unknowns` adds `acknowledged_unknowns: true` to the section
- Date is auto-filled with today's date
- Without a status flag, shows the current review status
- Affected specs: core-commands

## Impact
- Affected specs: core-commands (new command behavior)
- Affected code: `src/commands/review.ts` (new), `src/cli.ts` (register command)
- No breaking changes

# Change: Add watch mode to validation

## Why
Writers iterate on content in tight edit-save-check loops. Currently they must manually re-run `docflow validate` after every change. This friction slows the feedback cycle and discourages continuous quality checking. Watch mode enables live validation feedback, similar to `tsc --watch` or ESLint's watch mode.

## What Changes
- Add `--watch` flag to `docflow validate` that starts a long-running process monitoring the target file (or all drafts) for changes
- On each detected change, re-run the full validation suite and display updated diagnostics
- Show engagement score deltas when `--engagement-report` is also active
- Clear previous output between runs for a clean terminal experience
- Support `--json` output in watch mode (newline-delimited JSON per run)
- Graceful shutdown on SIGINT (Ctrl+C)

## Impact
- Affected specs: core-commands (modified — add `--watch` flag to validate command)
- Affected code: `src/commands/validate.ts` (add `--watch` flag and file watcher logic)
- No breaking changes — additive flag only
- New dependency: Node.js `fs.watch` or `chokidar` (prefer Node.js built-in `fs.watch` with `recursive: true` to avoid new dependencies)

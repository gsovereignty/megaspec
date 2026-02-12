## 1. Watch Mode Implementation
- [x] 1.1 Add `--watch` flag to `registerValidateCommand` in `src/commands/validate.ts`
- [x] 1.2 Extract current validation logic into a reusable `runValidation(file, opts, ctx)` function
- [x] 1.3 Implement file watcher using `fs.watch` with `{ recursive: true }` for drafts/ directory watching
- [x] 1.4 Implement single-file watcher for when a specific file is passed
- [x] 1.5 Add 300ms debounce logic to coalesce multiple file change events
- [x] 1.6 Clear terminal between runs (ANSI `\x1Bc`) — skip clearing in `--json` mode

## 2. Engagement Score Deltas
- [x] 2.1 Cache previous engagement scores between watch runs
- [x] 2.2 Compute and display score deltas when `--engagement-report` is active (e.g., `clarity: 72 → 78 (+6)`)

## 3. JSON Watch Output
- [x] 3.1 Emit newline-delimited JSON objects in `--json --watch` mode (one per run, no terminal clearing)
- [x] 3.2 Include `runNumber` field in each JSON object

## 4. Signal Handling
- [x] 4.1 Register SIGINT handler to close watcher and print summary line
- [x] 4.2 Ensure clean process exit (code 0) on Ctrl+C

## 5. Tests
- [x] 5.1 Unit test: `--watch` flag is accepted by validate command
- [x] 5.2 Unit test: `runValidation` helper produces correct diagnostics (extracted function)
- [x] 5.3 Unit test: engagement delta computation (score comparison logic)
- [x] 5.4 Integration test: `--watch` starts and responds to file changes (with short timeout)
- [x] 5.5 Integration test: `--watch --json` produces newline-delimited JSON

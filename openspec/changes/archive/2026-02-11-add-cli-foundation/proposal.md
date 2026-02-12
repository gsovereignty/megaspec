# Change: Add CLI Foundation

## Why

DocFlow has no codebase yet. Every requirement in the PRD (DF-003 through DF-085) depends on a working CLI entry point and project scaffolding. Without `docflow init`, there is no project structure for drafts, publishing, or validation to operate on. Without global `--json` and `--no-interactive` flags, no command can satisfy DF-011's universal contract.

## What Changes

- Add `docflow init [path]` command that scaffolds a new DocFlow project (DF-001)
- Add content-type templates for tutorial, reference, guide, and whitepaper (DF-002)
- Add global `--json` and `--no-interactive` CLI flags applied before command parsing (DF-011)
- Establish the TypeScript project structure, build pipeline, and test harness

## Impact

- Affected specs: `cli-foundation` (new capability)
- Affected code: New project — creates `src/`, `package.json`, `tsconfig.json`, test fixtures
- Dependencies unblocked: DF-003, DF-004, DF-005, DF-006, DF-008, DF-009, DF-010, DF-020–029

# Proposal: add-cli-polish

## Why

Three P0/P1 CLI requirements remain unimplemented: `docflow list --publish` (DF-004), engagement scores in `docflow show` (DF-005), and `docflow validate --engagement-report` (DF-007). These are small, self-contained gaps that can be closed together before tackling the larger agent workflow milestone.

## What Changes

### 1. `list --publish` flag (DF-004)

Add a `--publish` shorthand flag to the `list` command. When set, it filters to `publish/` documents and displays columns: **ID**, **Title**, **Audience**, **Reading Time** (word count / 200 wpm). The existing `--location` filter stays but `--publish` is the canonical shorthand per the PRD.

### 2. Engagement scores in `show` (DF-005)

When `docflow show <slug>` displays a **draft**, run the scoring engine (`computeEngagementScore`) on its `content.md` and append an engagement score summary block showing all 5 dimensions (curiosity, clarity, action, flow, voice) plus the total score. Published documents display without scores (already finalized).

### 3. `validate --engagement-report` flag (DF-007)

Add `--engagement-report` flag to `docflow validate`. When set, compute all 5 engagement dimensions and output a detailed breakdown table with numeric scores and descriptive labels (e.g., "Curiosity: 72/100 — Strong opening hook").

## Affected Specs

- **core-commands** — delta updates for List Published Documents, Show Document, and Validate Command requirements

## Scope

- Modify `src/commands/list.ts` — add `--publish` flag logic and alternate table format
- Modify `src/commands/list.ts` (registerShowCommand) — integrate scoring engine for drafts
- Modify `src/commands/validate.ts` — add `--engagement-report` flag and scoring output
- Update `test/commands.test.ts` — new integration tests for all three features
- No new dependencies required — scoring engine already exists

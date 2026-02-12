# Design: add-cli-polish

## Overview

Three small enhancements to existing CLI commands. No new modules, no architectural changes — just wiring the existing scoring engine into two commands and adding a flag to `list`.

## 1. `list --publish` (DF-004)

Add `--publish` boolean flag to `registerListCommand`. When set:
- Equivalent to `--location publish` but also changes the table format
- Table columns: `ID`, `TITLE`, `AUDIENCE`, `READING TIME`
- Reading time computed from word count (excluding code blocks and front matter) at 200 wpm
- `--json` output includes `readingTime` field per document
- `--publish` and `--location` are mutually exclusive — if both set, `--publish` wins

The `findDocuments()` function already returns `location`, `title`, and `audience`. We need to add `id` (from front matter) and compute reading time using the existing `countWords()` utility from `markdown.ts`.

### Changes to DocumentInfo

Add `id` field (from front matter `id` key). Add reading time computation at display time rather than in the data model (keeps it lightweight).

## 2. `show` with engagement scores (DF-005)

In `registerShowCommand`, after building the info block, check if `doc.location === 'drafts'`. If so:
- Read `content.md`
- Call `computeEngagementScore(content)` from `src/scoring/engagement.ts`
- Append score summary to human output:
  ```
  Engagement:
    Curiosity:   72/100
    Clarity:     85/100
    Action:      60/100
    Flow:        78/100
    Voice:       90/100
    Total:       77/100
  ```
- In `--json` mode, include `engagement` object with all dimension scores and total

For published docs, skip scoring (already finalized and reviewed).

## 3. `validate --engagement-report` (DF-007)

Add `--engagement-report` flag to `registerValidateCommand`. When set:
- After running validation diagnostics, also compute engagement scores
- Display a summary table:
  ```
  Engagement Report:
    Curiosity:   72/100 — Strong opening hook, information gaps detected
    Clarity:     85/100 — Clear structure, good sentence length
    Action:      60/100 — Needs more examples and exercises
    Flow:        78/100 — Good transitions, minor pacing issues
    Voice:       90/100 — Strong reader focus, active voice
    ─────────────────────
    Total:       77/100
  ```
- Descriptive labels derived from score ranges:
  - 80-100: "Strong" / "Excellent"
  - 60-79: "Good" / "Adequate"
  - 40-59: "Needs improvement"
  - 0-39: "Weak" / "Missing"
- In `--json` mode, include `engagement` object alongside `diagnostics`
- The `--engagement-report` flag works independently of `--strict`

### Score label mapping

Each dimension gets a label based on score range plus a brief contextual note derived from the dimension name:

| Dimension | High (80+) | Mid (60-79) | Low (<60) |
|-----------|-----------|-------------|-----------|
| Curiosity | "Strong opening and information gaps" | "Adequate hooks present" | "Needs stronger opening or questions" |
| Clarity | "Clear structure and language" | "Mostly clear, some dense sections" | "Needs simpler language or structure" |
| Action | "Rich examples and exercises" | "Some actionable content" | "Needs more examples or exercises" |
| Flow | "Smooth transitions and pacing" | "Adequate flow with minor gaps" | "Needs better transitions" |
| Voice | "Strong reader focus, active voice" | "Adequate voice and focus" | "Needs more reader-focused language" |

## Test Strategy

- **`list --publish`**: test with published docs showing correct columns, test `--json` includes reading time, test no results message
- **`show` with scores**: test draft shows engagement scores, test published doc does NOT show scores, test `--json` includes engagement
- **`validate --engagement-report`**: test flag produces score output, test `--json` includes engagement, test without flag does NOT include scores

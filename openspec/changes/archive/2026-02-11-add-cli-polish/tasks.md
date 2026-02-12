## 1. List --publish flag (DF-004)

- [x] 1.1 Add `id` field to `DocumentInfo` type in `list.ts`
- [x] 1.2 Populate `id` from front matter in `findDocuments()`
- [x] 1.3 Add `--publish` boolean flag to `registerListCommand`
- [x] 1.4 When `--publish` is set, filter to `publish/` and display alternate table: ID, TITLE, AUDIENCE, READING TIME
- [x] 1.5 Compute reading time using `countWords()` from `markdown.ts` at 200 wpm
- [x] 1.6 Include `readingTime` in `--json` output
- [x] 1.7 Integration tests: `list --publish` table, `list --publish --json`, empty publish/

## 2. Show with engagement scores (DF-005)

- [x] 2.1 Import `computeEngagementScore` into `list.ts`
- [x] 2.2 When showing a draft, compute engagement scores on content.md
- [x] 2.3 Append engagement score summary to human output (all 5 dimensions + total)
- [x] 2.4 Include `engagement` object in `--json` output for drafts
- [x] 2.5 Skip scoring for published documents
- [x] 2.6 Integration tests: draft shows scores, published doc does not, `--json` includes engagement

## 3. Validate --engagement-report (DF-007)

- [x] 3.1 Add `--engagement-report` flag to `registerValidateCommand`
- [x] 3.2 When flag is set, compute engagement scores after validation
- [x] 3.3 Display formatted score table with descriptive labels based on score ranges
- [x] 3.4 Include `engagement` in `--json` output when flag is set
- [x] 3.5 Integration tests: `--engagement-report` produces scores, `--json` includes engagement, default does not include scores

## 4. Build & Verify

- [x] 4.1 Run `pnpm build` — verify clean TypeScript compilation
- [x] 4.2 Run `pnpm test` — all existing + new tests pass

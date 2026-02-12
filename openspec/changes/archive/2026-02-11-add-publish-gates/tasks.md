## 1. Human Review Parser

- [x] 1.1 Create `src/utils/human-review.ts` with `HumanReviewData` type (status, reviewer, date, acknowledgedUnknowns)
- [x] 1.2 Implement `parseHumanReview(checklistContent: string)` — find `## Human Review` section, extract key-value pairs
- [x] 1.3 Implement `checkHumanReview(projectDir, slug)` — read `checklist.md`, call parser, return result or error message
- [x] 1.4 Unit tests for human review parsing: approved, rejected, needs-revision, missing section, malformed section, acknowledged_unknowns field

## 2. Unknowns Scanner

- [x] 2.1 Implement `scanUnknowns(projectDir, slug)` in `src/utils/human-review.ts` — scan all 4 artifacts for non-empty `### Unknowns` under `## Agent Contributions`
- [x] 2.2 Define "non-empty" as not matching: empty string, "None", "N/A", empty list items
- [x] 2.3 Unit tests for unknowns scanning: no unknowns, "None" unknowns, non-empty unknowns, missing artifacts, missing Agent Contributions section

## 3. Agent Contributions Stripping

- [x] 3.1 Implement `stripAgentContributions(content: string)` in `src/utils/markdown.ts` — remove `## Agent Contributions` through next `## ` heading or EOF
- [x] 3.2 Unit tests: strip section with subsections, no Agent Contributions section, section at end of file, multiple H2 sections after it

## 4. Publish Command Updates

- [x] 4.1 Remove `--skip-validation` and `--strict` flags — validation is always strict and mandatory
- [x] 4.2 Add human review gate after validation: call `checkHumanReview()`, abort with message if not approved
- [x] 4.3 Add unknowns gate after human review: call `scanUnknowns()`, check `acknowledgedUnknowns`, abort with message if needed
- [x] 4.4 Add Agent Contributions stripping before validation (validate publishable content)
- [x] 4.5 Integration tests: successful publish with all gates passing
- [x] 4.6 Integration tests: publish rejected at each gate (validation failure, missing review, rejected review, unacknowledged unknowns)
- [x] 4.7 Integration test: published file has no Agent Contributions section
- [x] 4.8 Integration test: published file has resolved cross-references and published_at timestamp

## 5. Archive Command Updates

- [x] 5.1 Change archive filename from `slug.md` to `YYYY-MM-DD-slug.md`
- [x] 5.2 When archiving from publish/, also move `drafts/slug/` to `archive/YYYY-MM-DD-slug/` if it exists
- [x] 5.3 Change source lookup: archive only from `publish/` (not from `drafts/` directly — drafts must be published first)
- [x] 5.4 Integration tests: date-prefixed filename, draft directory archival, nonexistent document error
- [x] 5.5 Integration test: `--json` output includes date-prefixed path

## 6. Build & Verify

- [x] 6.1 Run `pnpm build` — verify clean TypeScript compilation
- [x] 6.2 Run `pnpm test` — all existing + new tests pass

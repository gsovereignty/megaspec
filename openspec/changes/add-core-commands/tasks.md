## 1. Dependencies & Shared Infrastructure

- [x] 1.1 Install dependencies: gray-matter, remark, unified, mdast-util-to-string, unist-util-visit, syllable, retext, retext-passive
- [x] 1.2 Create `src/utils/markdown.ts` — parse Markdown to mdast AST, extract front matter
- [x] 1.3 Create `src/utils/front-matter.ts` — validate YAML front matter fields (DF-020)
- [x] 1.4 Create `src/utils/reading-time.ts` — compute reading time from word count (DF-021)
- [x] 1.5 Create `src/utils/cross-references.ts` — scan and resolve `{{doc:slug}}` patterns (DF-022, DF-023)

## 2. Validation Engine

- [x] 2.1 Create `src/validators/types.ts` — define Diagnostic, Rule, ValidationProfile, ValidationContext types
- [x] 2.2 Create `src/validators/registry.ts` — rule registry: register rules, load profile, execute rules
- [x] 2.3 Create `src/validators/profiles.ts` — define tutorial, reference, guide, whitepaper profiles (DF-040P–043P)

## 3. Draft Structure Validators (DF-020–029)

- [x] 3.1 Front matter validator: required fields id, title, type, audience, prerequisites (DF-020)
- [x] 3.2 Draft completeness validator: check for outline.md, research.md, content.md, checklist.md (DF-024)
- [x] 3.3 Outline structure validator: required headings and engagement strategy subheadings (DF-025)
- [x] 3.4 Checklist Gagné events validator: check for all 9 events (DF-026)
- [x] 3.5 Research.md structure validator: Sources, Evidence, Assumptions/Unknowns headings (DF-027)
- [x] 3.6 Agent Contributions validator: check all artifacts for required section (DF-028)
- [x] 3.7 Flat publish validator: reject slugs with path separators (DF-029)
- [x] 3.8 Cross-reference resolution validator (DF-023)

## 4. Cognitive Load Validators (DF-030–036)

- [x] 4.1 Paragraph length validator: WARN > 5 sentences (DF-030)
- [x] 4.2 List length validator: WARN > 7 items or < 3 items (DF-031, DF-032)
- [x] 4.3 Section density validator: WARN > 500 words without subheading (DF-033)
- [x] 4.4 Code comment validator: FAIL uncommented code in tutorials (DF-034)
- [x] 4.5 Worked example ordering validator: FAIL exercise before example in tutorials (DF-035)
- [x] 4.6 Code-prose proximity validator: WARN code > 3 lines from explanation (DF-036)

## 5. Engagement Mechanics Validators (DF-040–047)

- [x] 5.1 Opening hook validator: FAIL if first 200 words lack hook (DF-040)
- [x] 5.2 Question-before-answer validator: WARN answer without framing (DF-041)
- [x] 5.3 Example presence validator: FAIL H2 section without example in tutorials/guides (DF-042)
- [x] 5.4 Placeholder name detector: WARN generic names in code (DF-043)
- [x] 5.5 Step numbering validator: WARN steps without progress indicators (DF-044)
- [x] 5.6 Next-steps validator: WARN missing forward-linking section (DF-045)
- [x] 5.7 Transition validator: WARN > 50% transitions lack momentum phrases (DF-046)
- [x] 5.8 Narrative arc validator: WARN missing setup/confrontation/resolution in tutorials (DF-047)

## 6. Readability Validators (DF-050–055)

- [x] 6.1 Flesch-Kincaid grade level: WARN exceeds profile target (DF-050)
- [x] 6.2 Sentence length validator: WARN > 30 words (DF-051)
- [x] 6.3 Passive voice detector: WARN > 20% passive (DF-052)
- [x] 6.4 Reader-focus analyzer: WARN low you-to-system ratio (DF-053)
- [x] 6.5 Heading descriptiveness validator: WARN vague standalone headings (DF-054)
- [x] 6.6 Topic sentence validator: WARN main point not frontloaded (DF-055) — P2 stub

## 7. Visual Support Validators (DF-056–059)

- [x] 7.1 Visual density validator: WARN > 300 words conceptual section with no visuals (DF-056)
- [x] 7.2 Diagram suggestion validator: WARN architecture keywords without diagram (DF-057)
- [x] 7.3 Image alt text validator: FAIL missing alt text (DF-058)
- [x] 7.4 Image path validator: FAIL nonexistent image path (DF-059)

## 8. Engagement Scoring Engine (DF-060–065)

- [x] 8.1 Curiosity scorer: hooks, information gaps, cliffhangers, question headings (DF-060)
- [x] 8.2 Clarity scorer: FK grade, paragraph compliance, list compliance, heading descriptiveness (DF-061)
- [x] 8.3 Action scorer: code examples, exercises, next-steps, outcomes (DF-062)
- [x] 8.4 Flow scorer: transitions, tension-release, progressive disclosure, narrative arc (DF-063)
- [x] 8.5 Voice scorer: active voice ratio, reader pronouns, contractions, questions (DF-064)
- [x] 8.6 Total engagement score: weighted average with configurable weights (DF-065)

## 9. CLI Commands

- [x] 9.1 `docflow list` — scan drafts/, publish/, archive/, display slug, type, location (DF-003)
- [x] 9.2 `docflow list --type` / `--location` — filter by type or location (DF-004)
- [x] 9.3 `docflow show [slug]` — display document details with word count, reading time (DF-005)
- [x] 9.4 `docflow validate [file]` — run profile rules, output diagnostics, exit code (DF-006)
- [x] 9.5 `docflow validate --strict` / `--rule` — strict mode and single-rule filter (DF-007)
- [x] 9.6 `docflow publish [slug]` — validate gate, copy to publish/, resolve cross-refs (DF-008, DF-080–083, DF-085)
- [x] 9.7 `docflow archive [slug]` — move to archive/, add archived_at timestamp (DF-009, DF-084)
- [x] 9.8 `docflow metrics [file]` — engagement breakdown with dimension scores (DF-010)

## 10. Testing

- [x] 10.1 Unit tests for validation rules (24 tests: front matter, flat publish, paragraph length, list length, code comments, opening hook, placeholder names, FK, passive voice, headings, image alt text, profiles)
- [x] 10.2 Unit tests for engagement scoring (5 tests: range, dimensions, comparative, bounds, empty)
- [x] 10.3 Integration test: `docflow list` shows documents and supports --json
- [x] 10.4 Integration test: `docflow show` displays details and errors on missing
- [x] 10.5 Integration test: `docflow validate` runs and supports --json
- [x] 10.6 Integration test: `docflow publish` succeeds with skip-validation, errors on missing
- [x] 10.7 Integration test: `docflow archive` moves, timestamps, and supports --reason
- [x] 10.8 Integration test: `docflow metrics` computes scores and supports --json
- [x] 10.9 Integration test: all commands support `--json` output
- [x] 10.10 Profile tests: strict mode converts WARN to FAIL

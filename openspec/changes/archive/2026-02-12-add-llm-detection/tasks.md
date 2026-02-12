## 1. LLM Artifact Dictionary (DF-090)

- [x] 1.1 Create `src/validators/llm-artifacts.ts` with `LlmArtifactPattern` and `LlmArtifactMatch` types
- [x] 1.2 Add Category A: overused style words dictionary (≥50 word roots with inflections, each with replacement)
- [x] 1.3 Add Category B: typographic artifacts (em dashes, decorative emoji, smart quotes)
- [x] 1.4 Add Category C: filler/hedge phrases (≥15 phrases with replacements)
- [x] 1.5 Add Category D: structural patterns (6 conjunctive adverb opener regexes)
- [x] 1.6 Implement `scanLlmArtifacts(content: string): LlmArtifactMatch[]` — line-by-line scanning, skipping code blocks & front matter
- [x] 1.7 Unit tests: dictionary completeness, scanner accuracy, code-block skipping, line numbers

## 2. Validation Rule (DF-091)

- [x] 2.1 Register `llm-artifacts` rule in `src/validators/rules.ts`
- [x] 2.2 Rule calls `scanLlmArtifacts(ctx.rawContent)` and emits WARN diagnostics with `[RF-19]`
- [x] 2.3 Fixture tests: rule produces WARN for LLM content, no diagnostics for clean content

## 3. Profile Integration (DF-093)

- [x] 3.1 Add `llm-artifacts` rule to all profiles (guide, tutorial, reference, whitepaper) at WARN severity
- [x] 3.2 Add publish advisory: count artifacts and emit informational message (non-blocking)
- [x] 3.3 Integration tests: publish with artifacts shows advisory but succeeds

## 4. `--strip-llm` Flag (DF-092)

- [x] 4.1 Add `--strip-llm` flag to `registerValidateCommand`
- [x] 4.2 When set, apply replacements in reverse order and output cleaned content to stdout
- [x] 4.3 `--json` mode includes `{ cleaned, replacements }` fields
- [x] 4.4 Integration tests: `--strip-llm` produces cleaned output, `--json` includes fields

## 5. Build & Verify

- [x] 5.1 Run `pnpm build` — verify clean TypeScript compilation
- [x] 5.2 Run `pnpm test` — all existing + new tests pass (134 total)

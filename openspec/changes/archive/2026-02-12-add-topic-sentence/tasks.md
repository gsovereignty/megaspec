## 1. Implementation (DF-055)

- [x] 1.1 Add inline stopword list to `src/validators/rules.ts` (near DF-055 rule)
- [x] 1.2 Implement topic sentence heuristic: extract dominant keyword, check sentence 1
- [x] 1.3 Replace DF-055 stub with working rule, emit WARN with `[RF-11]` citation

## 2. Tests

- [x] 2.1 Test: paragraph whose key term appears only in sentence 3 → WARN
- [x] 2.2 Test: paragraph with key term in sentence 1 → no diagnostic
- [x] 2.3 Test: single-sentence paragraph → no diagnostic (skipped)
- [x] 2.4 Test: WARN message includes keyword name and sentence number

## 3. Build & Verify

- [x] 3.1 `pnpm build` — clean compilation
- [x] 3.2 `pnpm test` — all tests pass (138 total)

# Tasks: add-agent-instructions

## Implementation Order

Tasks are ordered for incremental, testable progress. The template content (task 2) is the bulk of the work. Init wiring (task 3) is trivial once the template exists.

- [x] **1. Extend init to scaffold `docflow/` directory**
  Add `'docflow'` to the `DIRECTORIES` array in `src/commands/init.ts`. Verify the directory is created on `docflow init`. No new files yet — just the directory.
  _Traces to: DF-074_
  _Test: Run init, verify `docflow/` directory exists._

- [x] **2. Create `src/templates/agents.md` template**
  Write the full AGENTS.md template content. This is the core deliverable. Sections in order:
  1. Quick Reference Checklist — bullet list of all engagement rules
  2. Content Type Rules — tutorial, guide, reference, whitepaper sections with good/bad examples per rule
  3. Research-Based Writing Guidance — one entry per RF (RF-01 through RF-19) with operational directives and examples
  4. Common Mistakes — patterns to avoid (generic examples, passive voice, answer-before-question, LLM vocabulary)
  5. Self-Validation Checklist — pre-completion walkthrough for agents
  6. Interview Mode (DF-070) — 7 questions, artifact generation steps
  7. Transform Mode (DF-071) — raw input analysis, transformation steps, factual preservation rules
  8. Agent Modes (DF-072) — single, role-based, consensus mode guidance
  9. Agent Contributions Format (DF-073) — required metadata structure with examples
  10. Role Contracts (DF-075) — researcher, writer, reviewer I/O contracts
  _Traces to: DF-070, DF-071, DF-072, DF-073, DF-074, DF-075_
  _Validation: Review each section against PRD OpenSpec Prompts for completeness._

- [x] **3. Wire AGENTS.md into init command**
  In `src/commands/init.ts`, after template copying, add logic to write `docflow/AGENTS.md` from `src/templates/agents.md` using the existing `writeFileIfNotExists()` helper. Update the fallback template generator to produce a minimal AGENTS.md stub.
  _Traces to: DF-074_
  _Test: Run init, verify `docflow/AGENTS.md` exists with expected content._

- [x] **4. Add init integration tests**
  Extend the init test suite to verify:
  - `docflow/` directory created
  - `docflow/AGENTS.md` file created with expected content
  - Idempotent — second init does not overwrite AGENTS.md
  - `--json` output includes `docflow/AGENTS.md` in created array
  _Traces to: DF-001, DF-074_

- [x] **5. Add AGENTS.md content verification tests**
  Add tests that verify the generated AGENTS.md contains all required sections:
  - All 7 interview questions present (DF-070)
  - Transform mode preservation directive present (DF-071)
  - All 3 agent modes documented (DF-072)
  - Agent Contributions format with Role/Assumptions/Unknowns (DF-073)
  - All 19 RF entries present (DF-074)
  - All 4 content type sections present (DF-074)
  - Researcher/writer/reviewer contracts present (DF-075)
  _Traces to: DF-070, DF-071, DF-072, DF-073, DF-074, DF-075_

- [x] **6. Run full test suite and fix regressions**
  Run `pnpm test` — all 138 existing tests plus new tests must pass. Fix any regressions from init changes.
  _Result: 148 tests passing (138 existing + 10 new). 2 CLI integration tests updated (count 9→11). Zero regressions._

## Dependencies

- Tasks 1 and 2 are parallelizable
- Task 3 depends on tasks 1 and 2
- Tasks 4 and 5 depend on task 3
- Task 6 depends on all above

## Notes

- The agent config block in `project.md` (DF-072 partial) is already implemented — no changes needed there
- The DF-028 validation rule (Agent Contributions section required) already exists — AGENTS.md instructions complement it
- The AGENTS.md template will be the largest single file in the project (~800-1200 lines) — this is by design

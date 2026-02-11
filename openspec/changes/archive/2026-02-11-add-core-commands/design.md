## Context

DocFlow has a working CLI entry point with `docflow init` and global `--json`/`--no-interactive` flags. This change adds the remaining CLI commands for the full document lifecycle: list → validate → publish → archive. It also builds the validation engine and engagement scoring system that underpin `validate`, `publish`, and `metrics`.

Stakeholders: SMEs (end users), DocFlow contributors (developers).

Constraints from `project.md`:
- TypeScript strict mode, Node.js >= 18 LTS
- pnpm, commander, vitest
- Thin CLI handlers delegating to service modules
- `--json` and `--no-interactive` on all commands (DF-011, already wired)

## Goals / Non-Goals

- **Goals**:
  - Complete document lifecycle: list, show, validate, publish, archive, metrics
  - Pluggable validation engine: rules registered per profile, diagnostics with PASS/WARN/FAIL
  - Engagement scoring: 5-dimension scoring (curiosity, clarity, action, flow, voice)
  - Validation profiles: tutorial, reference, guide, whitepaper — each loads its rule set
  - Human review gate on publish (DF-080)
  - Cross-reference resolution on publish (DF-022, DF-023, DF-083)
  - YAML front matter parsing and validation (DF-020)

- **Non-Goals**:
  - Agent workflow (DF-070–075) — separate change
  - CI/CD pipeline
  - Vale integration (optional, future)
  - Custom rule authoring API

## Decisions

- **Markdown parsing: remark/unified + mdast** — Already specified in project.md. Structural validation walks the AST; no regex on raw Markdown except for cross-references and front matter.
- **Front matter parsing: gray-matter** — De facto standard for YAML front matter in Markdown. Lighter than remark-frontmatter for our use case.
- **Readability: syllable + retext** — `syllable` for Flesch-Kincaid, `retext` + `retext-passive` for passive voice detection. Both recommended in PRD prompts.
- **Validation architecture: rule registry pattern** — Each rule is a function `(ast, context) → Diagnostic[]`. Profiles select which rules apply and at what severity. Rules are stateless and composable.
- **Diagnostic format**: `{ ruleId: string, severity: 'PASS' | 'WARN' | 'FAIL', line: number, message: string, research: string }`. All diagnostics cite their research foundation.
- **Scoring engine: pure functions** — Each dimension scorer takes AST + metadata and returns `{ score: number, breakdown: object }`. Total score is a weighted average with configurable weights.
- **Publish pipeline: sequential gates** — (1) Draft exists → (2) Validation passes (strict) → (3) Human review approved → (4) Copy content.md to publish/ → (5) Resolve cross-references. Any gate failure aborts.

### Alternatives Considered

| Option | Rejected Because |
|---|---|
| Single monolithic validator | Not composable; can't swap rules per profile |
| Async rule execution | Rules are CPU-bound AST walks, not I/O; async adds complexity without benefit |
| Store scores in front matter | PRD says compute dynamically (DF-021); storing creates staleness risk |
| Custom template engine for cross-refs | Regex `{{doc:slug}}` is simple and sufficient per DF-022 |

## Risks / Trade-offs

- **Risk**: Validation rule count is large (30+ rules). Implementation is substantial.
  - **Mitigation**: Rules are independent; implement P0 rules first, then P1/P2. Each rule is a small, testable function.
- **Risk**: Sentence boundary detection and syllable counting have edge cases.
  - **Mitigation**: Use established npm packages (retext-sentence, syllable) rather than custom parsing.
- **Risk**: Engagement scoring weights may need tuning.
  - **Mitigation**: Weights are configurable in project.md (DF-065). Start with PRD defaults.

## Open Questions

- None — PRD provides detailed implementation prompts for every requirement.

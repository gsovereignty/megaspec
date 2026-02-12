# Proposal: add-agent-instructions

## Summary

Generate `docflow/AGENTS.md` during `docflow init` — a comprehensive instruction file that any AI coding assistant can read to help SMEs write engagement-validated documentation. This file encodes all 19 research foundations as operational writing guidance, defines interview and transform mode workflows, and specifies role contracts for multi-agent setups.

## Motivation

DocFlow already validates output (33 rules, 4 profiles, 5 scoring dimensions) and provides publish safety gates, but it has no way to **guide the AI assistant that helps SMEs write**. The validation engine catches problems after the fact; the AGENTS.md file prevents them upfront by giving the agent concrete instructions derived from the same research.

This is the final P0 feature gap: DF-070 through DF-075 (6 requirements, 5 P0 + 1 P1).

## Scope

### In Scope

1. **AGENTS.md content generation** — A new template file (`src/templates/agents.md`) containing the full instruction set, generated into `docflow/AGENTS.md` during init
2. **Init command extension** — Add `docflow/` to scaffolded directories and write `docflow/AGENTS.md` from the template
3. **AGENTS.md content sections**:
   - Quick Reference Checklist (engagement rules summary)
   - Per Content Type Rules (tutorial, guide, reference, whitepaper) with good/bad examples
   - Research-Based Writing Guidance (RF-01 through RF-19 as operational instructions)
   - Common Mistakes to avoid
   - Self-Validation Checklist
   - Interview Mode Instructions (DF-070)
   - Transform Mode Instructions (DF-071)
   - Agent Mode Guidance (DF-072)
   - Agent Contributions Format (DF-073)
   - Role Contracts (DF-075)

### Out of Scope

- Programmatic agent orchestration or API keys
- LLM SDK integration
- Automated agent-to-agent handoff tooling
- Changes to validation rules or scoring engine
- `--strip-llm` flag (DF-092, separate P1 work)

## Affected Capabilities

| Capability | Impact | Details |
|---|---|---|
| cli-foundation | MODIFIED | Init scaffolds `docflow/` directory and `docflow/AGENTS.md` |
| agent-instructions | NEW | New capability tracking AGENTS.md content requirements |

## PRD Requirements Addressed

| ID | Priority | Summary |
|---|---|---|
| DF-074 | P0 | `docflow init` generates `docflow/AGENTS.md` with research-based writing guidance |
| DF-070 | P0 | Interview mode instructions in AGENTS.md |
| DF-071 | P0 | Transform mode instructions in AGENTS.md |
| DF-072 | P0 | Agent mode guidance in AGENTS.md (project.md config already done) |
| DF-073 | P0 | Agent Contributions format instructions in AGENTS.md |
| DF-075 | P1 | Role contracts (researcher/writer/reviewer) in AGENTS.md |

## Risks

- **Content quality**: The AGENTS.md file IS the product for this feature — its quality directly determines whether AI assistants produce good documentation. Invest in concrete examples, not abstract principles.
- **Size**: The file will be large (~800-1200 lines). This is intentional — it needs to be comprehensive enough for any AI assistant to follow without external references.
- **Maintenance**: When validation rules change, AGENTS.md should be updated to match. This is a manual process for now.

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# DocFlow Instructions

These instructions are for AI assistants implementing or modifying DocFlow.

## Authoritative Requirements Source

**Always read `@/prd.md` before implementing any DocFlow feature, fix, or change.** The PRD is the single source of truth for:
- All traceable requirements (DF-001 through DF-085, DF-040P through DF-043P)
- Research foundations (RF-01 through RF-18) backing each requirement
- OpenSpec implementation prompts — the exact instructions for building each feature
- Validation profiles and engagement scoring specifications
- Agent workflow definitions and role contracts

## When to Reference the PRD

Always open `@/prd.md` when the request:
- Mentions DocFlow, documentation workflow, or writing system
- Involves implementing a CLI command (`docflow init`, `validate`, `publish`, `archive`, etc.)
- Involves validation rules (cognitive load, engagement, readability, visual support)
- Involves engagement scoring (curiosity, clarity, action, flow, voice)
- Involves agent modes (interview, transform, role-based, consensus)
- Mentions any requirement ID (DF-XXX) or research foundation (RF-XX)
- Involves the `publish/`, `drafts/`, or `archive/` directories
- Sounds like it relates to content structure, templates, or validation profiles

## How to Use the PRD

1. **Find the requirement** — Look up the relevant DF-XXX ID in Section 5
2. **Read the OpenSpec Prompt** — Each requirement has an implementation prompt immediately below its category table
3. **Check the traceability matrix** — Section 6 maps dependencies between requirements
4. **Follow research foundations** — Section 4 explains the research backing each rule
5. **Verify against the profile** — Section 5.8 defines which rules apply per content type

## Implementation Rules

- **ALWAYS read `@/prd.md` before writing or modifying any code.** Do not begin implementation until you have identified the relevant requirement(s) and read their OpenSpec Prompts.
- Every implementation MUST trace back to a specific requirement ID (DF-XXX)
- Every validation rule MUST cite its research foundation (RF-XX) in diagnostic messages
- Every CLI command MUST support `--json` and `--no-interactive` flags (DF-011)
- Every agent-produced artifact MUST include `## Agent Contributions` (DF-028)
- Human review gate is MANDATORY — never bypass it (DF-080)
- Published files MUST be flat in `publish/` — no subdirectories (DF-029)

## Git Commit Messages

When asked to create a git commit message:
1. **Check uncommitted changes** — inspect the current set of staged and unstaged files to understand what has changed.
2. **Write a single-line problem statement** — the commit message MUST start with `problem: ` and describe the *problem being solved*, NOT the solution or the change made.
3. **Keep it short** — one line, no implementation details.

Good: `problem: Agents lack a mandatory PRD-check step before implementation`
Bad: `Add rule to always check prd.md before implementing`
Good: `problem: Published docs can contain unresolved cross-references`
Bad: `Add cross-reference validation to publish command`

## Cross-References

- Project context and conventions: `@/openspec/project.md`
- Full requirements and prompts: `@/prd.md`
- OpenSpec workflow (for spec changes): `@/openspec/AGENTS.md`
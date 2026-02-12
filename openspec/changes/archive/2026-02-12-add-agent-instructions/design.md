# Design: add-agent-instructions

## Architecture Decision

### File-Based Agent Pattern

DocFlow follows the same pattern as OpenSpec: generate an instruction file that AI assistants read. The assistant reading `docflow/AGENTS.md` **is** the agent — no API keys, no LLM SDK, no programmatic orchestration.

```
docflow init myproject/
├── project.md          # Agent config YAML (already scaffolded)
├── docflow/
│   └── AGENTS.md       # NEW — generated instruction file
├── publish/
├── drafts/
├── archive/
└── templates/
    ├── tutorial.md
    ├── reference.md
    ├── guide.md
    └── whitepaper.md
```

### Template Approach

The AGENTS.md content is stored as a static template in `src/templates/agents.md`, similar to the existing content-type templates. `docflow init` copies it to `docflow/AGENTS.md` using the same `writeFileIfNotExists()` pattern — idempotent, never overwrites.

**Why a static template, not generated content?**
- The instruction content is fixed — it encodes research foundations and validation rules that don't change per-project
- Template approach is consistent with how tutorial.md, guide.md, etc. are handled
- No runtime dependencies needed
- Users can customize their copy after init

### AGENTS.md Structure

The file follows a deliberate ordering: quick reference first (for agents that already know the system), then detailed guidance, then workflow modes, then metadata format.

```
# DocFlow Writing Instructions

## Quick Reference Checklist           ← Scan-friendly rule summary
## Content Type Rules                  ← Per-type rules with examples
  ### Tutorial / Guide / Reference / Whitepaper
## Research-Based Writing Guidance     ← RF-01 through RF-19 as operational instructions
## Common Mistakes                     ← Anti-patterns to avoid
## Self-Validation Checklist           ← Pre-completion mental walkthrough
## Interview Mode                      ← DF-070: structured SME questioning
## Transform Mode                      ← DF-071: raw input restructuring
## Agent Modes                         ← DF-072: single/role-based/consensus
## Agent Contributions Format          ← DF-073: required metadata sections
## Role Contracts                      ← DF-075: researcher/writer/reviewer I/O
```

### Init Command Changes

Minimal changes to `src/commands/init.ts`:

1. Add `'docflow'` to the `DIRECTORIES` array
2. Add AGENTS.md file writing after template copying, using the same `writeFileIfNotExists()` helper
3. The bundled template path: `src/templates/agents.md` → written to `docflow/AGENTS.md`

### Content Design Principles

The AGENTS.md content follows these rules:

1. **Operational, not academic** — "Pose a specific question before explaining the concept" not "Apply Loewenstein's Information Gap Theory"
2. **Good/bad examples** — Every rule includes a concrete before/after showing wrong and right output
3. **Directive tone** — "You MUST..." / "Never..." / "Always..." — agents need clear instructions, not suggestions
4. **Self-contained** — The file contains everything an agent needs. No external references required (though it cites RF-XX IDs for traceability)
5. **Organized by task** — An agent helping write a tutorial can jump to "Content Type Rules → Tutorial" and get everything it needs

### Test Strategy

- **Init integration test**: Verify `docflow init` creates `docflow/AGENTS.md`
- **Idempotence test**: Run init twice, verify file not overwritten
- **Content verification tests**: Verify AGENTS.md contains required sections (interview questions, transform steps, role contracts, all 4 content types, Agent Contributions format)
- **Template fallback test**: Verify `generateFallbackTemplate()` extension produces minimal AGENTS.md stub if bundled template is missing

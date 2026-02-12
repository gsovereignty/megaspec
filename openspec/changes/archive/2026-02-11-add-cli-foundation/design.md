## Context

DocFlow is a greenfield CLI tool. This change establishes the foundational project structure, CLI framework, and scaffolding command. All subsequent commands and validators will build on the patterns set here.

Stakeholders: SMEs (end users), DocFlow contributors (developers).

Constraints from `project.md`:
- TypeScript strict mode, Node.js >= 18 LTS
- pnpm package manager
- commander or oclif for CLI
- vitest for testing
- 2-space indent, single quotes, trailing commas (Prettier)
- Kebab-case file names, PascalCase types, camelCase functions

## Goals / Non-Goals

- **Goals**:
  - Working `docflow init` command that creates a valid project structure
  - Global `--json` and `--no-interactive` flags available to all commands
  - Content-type templates with required sections per validation profiles (DF-040P–043P)
  - Idempotent init — running again must not overwrite existing files
  - Integration tests proving scaffolding works

- **Non-Goals**:
  - Implementing any other CLI commands (list, validate, publish, etc.)
  - Implementing validation rules or scoring engine
  - Agent workflow or AGENTS.md generation
  - CI/CD pipeline setup

## Decisions

- **CLI framework: commander** — Lighter than oclif, sufficient for DocFlow's command surface, widely used. Oclif adds plugin architecture we don't need in v1.
- **Project layout: flat `src/` with `commands/`, `templates/`, `utils/`** — Matches the "thin CLI handlers delegating to services" pattern from project.md without premature module splitting.
- **Template storage: bundled `.md` files in `src/templates/`** — Copied to the target project on init. Simple, no template engine needed for v1.
- **Global flags via commander `.hook('preAction')`** — Intercepts all commands to parse `--json` and `--no-interactive` before the command handler runs. Stores values in a shared context object.
- **Output abstraction: `OutputContext`** — A thin wrapper that checks the `--json` flag and either formats human-readable output or emits JSON. All commands use this instead of raw `console.log`.

### Alternatives Considered

| Option | Rejected Because |
|---|---|
| oclif | Plugin system and code generation are overhead for a tool with < 10 commands |
| yargs | Less composable than commander for subcommands; weaker TypeScript types |
| Raw template strings | Harder to maintain; `.md` files can be validated independently |

## Risks / Trade-offs

- **Risk**: Template content may drift from validation profile requirements (DF-040P–043P) as profiles evolve.
  - **Mitigation**: Templates are tested against their profile in integration tests; any profile change will break the test.
- **Risk**: `--json` output shape not stabilised yet.
  - **Mitigation**: Start with a minimal contract (`{ success: boolean, data?: unknown, error?: string }`) and extend per-command.

## Open Questions

- None — this is foundational scaffolding with clear PRD guidance.

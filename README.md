# DocFlow

CLI tool that helps subject matter experts produce engaging, research-backed documentation.

DocFlow leverages research from classical rhetoric, cognitive science, instructional design, and modern UX to validate and improve technical writing — tutorials, references, guides, and whitepapers.

## Quick Start

```bash
pnpm install
pnpm build
```

Initialize a new DocFlow project:

```bash
docflow init my-project
```

This scaffolds:

- `project.md` — project configuration
- `drafts/` — working artifacts
- `publish/` — final audience-ready documents
- `archive/` — superseded versions
- `templates/` — content-type templates (tutorial, reference, guide, whitepaper)

## CLI Flags

All commands support:

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON |
| `--no-interactive` | Disable interactive prompts |

## Development

```bash
pnpm dev          # Watch mode
pnpm test         # Run tests
pnpm lint         # Lint
pnpm format       # Format with Prettier
```

## Tech Stack

- TypeScript (strict mode)
- Node.js >= 18
- commander (CLI)
- vitest (testing)
- pnpm (package manager)

## License

ISC

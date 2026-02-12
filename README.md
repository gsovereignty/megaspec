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
- `docflow/AGENTS.md` — AI assistant writing instructions encoding 19 research foundations

## Commands

### `docflow init [path]`

Scaffold a new DocFlow project. Idempotent — re-running won't overwrite existing files.

### `docflow validate [file]`

Validate a document against its content-type profile.

| Flag | Description |
|------|-------------|
| `-s, --strict` | Treat warnings as errors |
| `-r, --rule <ruleId>` | Run only a specific rule |
| `-e, --engagement-report` | Include engagement score report |
| `--strip-llm` | Detect and replace LLM writing artifacts, output cleaned content |
| `-w, --watch` | Watch for file changes and re-run validation continuously |

Watch mode clears the terminal between runs, shows engagement score deltas, and outputs newline-delimited JSON when combined with `--json`.

### `docflow list`

List all documents in the project.

| Flag | Description |
|------|-------------|
| `-t, --type <type>` | Filter by content type |
| `-l, --location <loc>` | Filter by location (drafts, publish, archive) |
| `-p, --publish` | Show published documents with ID, title, audience, and reading time |

### `docflow show <slug>`

Display details for a specific document. For drafts, includes engagement score summary.

### `docflow metrics <file>`

Compute and display engagement scores with visual score bars for all 5 dimensions (curiosity, clarity, action, flow, voice) and total score.

### `docflow publish <slug>`

Promote a validated draft to `publish/`. Enforces sequential gates: draft exists, strict validation passes (mandatory), human review approved, no unacknowledged unknowns, cross-references resolved, Agent Contributions stripped, `published_at` timestamp added.

### `docflow archive <slug>`

Move a published document to `archive/YYYY-MM-DD-<slug>.md`.

| Flag | Description |
|------|-------------|
| `--reason <reason>` | Record why the document was archived |

## Global Flags

All commands support:

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON |
| `--no-interactive` | Disable interactive prompts |

## Development

```bash
pnpm dev          # Watch mode (TypeScript compiler)
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

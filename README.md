# DocFlow

CLI tool that helps subject matter experts produce engaging, research-backed documentation.

DocFlow uses research from classical rhetoric, cognitive science, instructional design, and modern UX to validate and improve technical writing — tutorials, references, guides, and whitepapers. It generates instruction files that AI coding assistants read and follow, then validates the output against 80+ traceable requirements.

## Installation

```bash
git clone <repo-url> && cd megaspec
pnpm install
pnpm build
pnpm link --global
```

This compiles TypeScript to `dist/`, copies bundled templates, and symlinks the `docflow` binary onto your `PATH`. Verify with:

```bash
docflow --version
```

## Worked Example: Writing a Blog Post

DocFlow supports four content types: **tutorial**, **reference**, **guide**, and **whitepaper**. Blog posts map to the **guide** profile — it validates for opening hooks, concrete examples, question framing, and next steps.

### 1. Initialize the project

```bash
docflow init my-blog
```

The interactive setup asks 5 questions:

```
? Project name: Caching Strategies That Actually Work
? Content type: Guide — practical how-to with examples
? Target audience: Backend developers scaling Node.js APIs
? Topic: How to add caching layers to reduce database load
? How do you want to work with your AI assistant? Interview — AI asks questions, you answer
```

This creates the full project structure plus a ready-to-use prompt:

```
Created:
  publish/
  drafts/
  archive/
  templates/
  docflow/
  project.md
  templates/tutorial.md
  templates/reference.md
  templates/guide.md
  templates/whitepaper.md
  docflow/AGENTS.md
  drafts/caching-strategies-that-actually-work/
  drafts/caching-strategies-that-actually-work/PROMPT.md

DocFlow project initialized at /Users/gareth/git/my-blog

Next step: Open drafts/caching-strategies-that-actually-work/PROMPT.md and paste it into your AI assistant.
```

```bash
cd my-blog
```

### 2. Start writing with your AI assistant

Open `drafts/caching-strategies-that-actually-work/PROMPT.md` and paste its contents into your AI assistant. The prompt tells the AI to:

- Read `docflow/AGENTS.md` for writing rules
- Use the guide template from `templates/guide.md`
- Run the 7-question interview flow with your audience and topic pre-filled
- Produce `outline.md`, `content.md`, and `checklist.md` in the drafts directory

The AI will ask you structured questions about your domain knowledge — who the reader is, what they should learn, common mistakes, and key insights. From your answers, it generates engagement-validated content.

> **Tip:** If you already have rough notes or a brain dump, choose **Transform** mode during init instead — the AI will restructure your raw content rather than interviewing you.

### 3. Validate

```bash
docflow validate drafts/caching-strategies-that-actually-work/content.md
```

Output shows diagnostics grouped by severity:

```
Validating: drafts/caching-strategies-that-actually-work/content.md
Profile:    guide

Errors (1):
  ✗ DF-042:18 Section "Choosing a Strategy" has no example. [RF-06, RF-16]

Warnings (1):
  ⚠ DF-045 Document lacks a forward-linking section at the end. [RF-04, RF-13]

Result: 1 errors, 1 warnings
✗ Validation failed
```

Fix the issues, then use watch mode to validate on every save:

```bash
docflow validate drafts/caching-strategies-that-actually-work/content.md --watch --engagement-report
```

### 4. Check engagement scores

```bash
docflow metrics drafts/caching-strategies-that-actually-work/content.md
```

```
Engagement Score: drafts/caching-strategies/content.md

  Total:     ████████████████░░░░ 78/100

  Dimensions:
    Curiosity    ████████████░░░ 85/100
    Clarity      ██████████████░ 90/100
    Action       ████████░░░░░░░ 55/100
    Flow         ██████████░░░░░ 70/100
    Voice        ████████████░░░ 80/100
```

### 5. Get human review

Add a `## Human Review` section to `drafts/caching-strategies-that-actually-work/checklist.md`:

```markdown
## Human Review
- **Reviewer**: Jane Smith
- **Date**: 2026-02-12
- **Status**: approved
```

### 6. Publish

```bash
docflow publish caching-strategies-that-actually-work
# ✓ Published "caching-strategies-that-actually-work" to publish/caching-strategies-that-actually-work.md
```

The published file has cross-references resolved, Agent Contributions stripped, and a `published_at` timestamp added.

### 7. Archive when superseded

```bash
docflow archive caching-strategies-that-actually-work --reason "superseded by v2"
# ✓ Archived "caching-strategies-that-actually-work" to archive/2026-02-12-caching-strategies-that-actually-work.md
```

---

## Commands

### `docflow init [path]`

Scaffold a new DocFlow project with an interactive guided setup. Asks for project name, content type, target audience, topic, and preferred AI interaction mode (interview or transform), then generates a tailored `project.md` and a `drafts/<slug>/PROMPT.md` ready to paste into your AI assistant.

Idempotent — re-running won't overwrite existing files. Use `--no-interactive` to skip prompts and scaffold with defaults.

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

## LLM Artifact Detection

DocFlow scans for patterns that reveal AI-generated text (DF-090/DF-091, backed by [Kobak et al. 2024](https://www.science.org/doi/10.1126/sciadv.adn2533)):

| Category | Count | Examples |
|----------|-------|----------|
| Overused style words | 54 | delve, comprehensive, pivotal, robust, seamless |
| Filler/hedge phrases | 21 | "it's worth noting that", "in order to", "a myriad of" |
| Typographic artifacts | 4 | em dash (`—`), double hyphen (`--`), smart quotes, decorative emoji |
| Structural openers | 6 | "Additionally,", "Furthermore,", "Moreover," |
| Non-contracted forms | 65 | "it is" → "it's", "do not" → "don't", "cannot" → "can't" |

Use `--strip-llm` to auto-fix detectable artifacts:

```bash
docflow validate drafts/my-post/content.md --strip-llm
```

## Engagement Scoring

Every document gets scored across 5 research-backed dimensions:

| Dimension | Weight | What it measures |
|-----------|--------|------------------|
| Curiosity | 25% | Questions, opening hooks, information gaps, concrete stats |
| Clarity | 25% | Flesch-Kincaid grade, sentence length, heading descriptiveness |
| Action | 20% | Code blocks, examples, exercises, step indicators |
| Flow | 15% | Section transitions, next steps, narrative arc (setup → resolution) |
| Voice | 15% | Reader pronouns ("you"), active voice ratio, engaging tone |

Target: 90+ in each dimension for publication-ready content.

```bash
docflow validate drafts/my-post/content.md --engagement-report
```

## Validation Profiles

Each content type has a tailored rule set:

| Profile | Key rules |
|---------|-----------|
| **Guide** | Opening hook, example per H2, question framing, next steps |
| **Tutorial** | Step-by-step structure, Gagné's Nine Events, worked examples |
| **Reference** | Consistent structure, complete coverage, scannable layout |
| **Whitepaper** | Thesis statement, evidence chains, executive summary |

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

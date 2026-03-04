# DocFlow

CLI tool for AI-assisted technical writing. You provide domain expertise, your LLM does the writing, and DocFlow validates the output.

DocFlow is designed to run inside an AI coding assistant (Copilot, Cursor, Claude Code, etc.). The assistant reads the validation output, understands exactly what failed and why, and rewrites the text to fix it — no manual editing needed. You stay in control as the subject matter expert: answering questions, reviewing drafts, and approving publication.

The validation rules are backed by research from classical rhetoric, cognitive science, instructional design, and modern UX — 80+ traceable requirements across tutorials, references, guides, and whitepapers.

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

## How It Works

1. **You** run `docflow init` and answer 5 questions about your topic and audience
2. **DocFlow** generates a prompt tailored to your content type — paste it into your AI assistant
3. **The LLM** interviews you (or transforms your raw notes), then writes the document
4. **The LLM** runs `docflow validate` and reads the structured diagnostics — each error includes a rule ID, line number, and research citation
5. **The LLM** rewrites the flagged sections and re-validates until the document passes
6. **You** review, approve, and publish

The validate → fix → re-validate loop is the core workflow. Every diagnostic is machine-readable, so the LLM can parse it and act on it without human intervention.

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

DocFlow project initialized at /Users/g/git/my-blog

✓ Prompt copied to clipboard. Paste it into your AI assistant to start writing.
```

On macOS (and Linux with `xclip`, or Windows) the prompt is automatically copied to your clipboard. Otherwise the output shows the path to open manually.

```bash
cd my-blog
```

### 2. Start writing with your AI assistant

Open `drafts/caching-strategies-that-actually-work/PROMPT.md` and paste its contents into your AI assistant. The prompt tells the LLM to:

- Read `docflow/AGENTS.md` for writing rules and engagement criteria
- Use the guide template from `templates/guide.md`
- Run the 7-question interview flow with your audience and topic pre-filled
- Produce `outline.md`, `content.md`, and `checklist.md` in the drafts directory

The LLM will ask you structured questions about your domain knowledge — who the reader is, what they should learn, common mistakes, and key insights. From your answers, it generates the first draft.

> **Tip:** If you already have rough notes or a brain dump, choose **Transform** mode during init instead — the LLM will restructure your raw content rather than interviewing you.

### 3. Validate and fix

The LLM runs validation and reads the output:

```bash
docflow validate drafts/caching-strategies-that-actually-work/content.md
```

Each diagnostic includes the rule ID, line number, a human-readable message, and the research citation — giving the LLM everything it needs to fix the issue:

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

The LLM reads this, adds a concrete example to the flagged section, adds a "Next steps" section, and re-runs validation. This loop continues until all errors are resolved.

For continuous feedback during editing, use watch mode:

```bash
docflow validate drafts/caching-strategies-that-actually-work/content.md --watch --engagement-report
```

With `--json`, output is machine-parseable JSON — useful for LLMs that prefer structured input:

```bash
docflow validate drafts/caching-strategies-that-actually-work/content.md --json
```

### 4. Check engagement scores

The LLM can also check how engaging the content is across 5 research-backed dimensions:

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

DocFlow enforces a mandatory human review gate — no document can be published without explicit SME approval. Add a `## Human Review` section to `drafts/caching-strategies-that-actually-work/checklist.md`:

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

The published file has cross-references resolved, Agent Contributions stripped, and a `published_at` timestamp added. If LLM artifacts are detected, an advisory is printed (non-blocking).

### 7. Archive when superseded

```bash
docflow archive caching-strategies-that-actually-work --reason "superseded by v2"
# ✓ Archived "caching-strategies-that-actually-work" to archive/2026-02-12-caching-strategies-that-actually-work.md
```

Archiving moves both the published file and the corresponding `drafts/<slug>/` directory (if it exists).

---

## Commands

### `docflow init [path]`

Scaffold a new DocFlow project with an interactive guided setup. Asks for project name, content type, target audience, topic, and preferred AI interaction mode (interview or transform), then generates a tailored `project.md` and a `drafts/<slug>/PROMPT.md` ready to paste into your LLM.

Idempotent — re-running won't overwrite existing files. Use `--no-interactive` to skip prompts and scaffold with defaults.

### `docflow validate [file]`

Validate a document against its content-type profile. If no file is given, looks for `content.md` in the current directory or under `drafts/`.

Designed to be called by an LLM: every diagnostic includes a rule ID, line number, plain-English message, and research citation so the LLM can read the output and rewrite the flagged text without human intervention. Use `--json` for structured output.

| Flag | Description |
|------|-------------|
| `-s, --strict` | Treat warnings as errors |
| `-r, --rule <ruleId>` | Run only a specific rule |
| `-e, --engagement-report` | Include engagement score report |
| `--strip-llm` | Detect and replace LLM writing artifacts, output cleaned content |
| `-w, --watch` | Watch for file changes and re-run validation continuously |

Watch mode clears the terminal between runs, shows engagement score deltas, and outputs newline-delimited JSON when combined with `--json`.

### `docflow list`

List all documents in the project (drafts, published, and archived).

| Flag | Description |
|------|-------------|
| `-t, --type <type>` | Filter by content type |
| `-l, --location <loc>` | Filter by location (drafts, publish, archive) |
| `-p, --publish` | Show published documents with ID, title, audience, and reading time |

### `docflow show <slug>`

Display details for a specific document including word count, reading time, and available artifacts. For drafts, includes engagement score summary across all 5 dimensions.

### `docflow metrics <file>`

Compute and display engagement scores with visual score bars for all 5 dimensions (curiosity, clarity, action, flow, voice) and total score. Each dimension includes a brief description of what was measured.

### `docflow publish <slug>`

Promote a validated draft to `publish/`. Enforces sequential gates:

1. Draft `drafts/<slug>/content.md` exists
2. Strict validation passes (mandatory, no bypass)
3. Human review approved in `checklist.md`
4. No unacknowledged unknowns (or `acknowledged_unknowns: true` in Human Review)
5. `{{doc:slug}}` cross-references resolved
6. `## Agent Contributions` section stripped
7. `published_at` timestamp added to front matter
8. LLM artifact advisory printed (non-blocking)

### `docflow archive <slug>`

Move a published document to `archive/YYYY-MM-DD-<slug>.md`. Also moves `drafts/<slug>/` if it still exists.

| Flag | Description |
|------|-------------|
| `--reason <reason>` | Record why the document was archived (stored in front matter as `archive_reason`) |

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

## Research Foundations

Every validation rule and scoring dimension traces back to a specific research foundation. When the LLM sees a diagnostic like `[RF-05, RF-11]`, it knows *why* the rule exists and can make a principled fix rather than a superficial one.

| ID | Discipline | Source | Key principle | How DocFlow uses it |
|----|-----------|--------|---------------|---------------------|
| RF-01 | Classical rhetoric | Aristotle, *Rhetoric* | Ethos (credibility), Pathos (emotion), Logos (logic) | Outline requires explicit persuasion mode signals |
| RF-02 | Dramatic structure | Aristotle, *Poetics* | Peripeteia (reversal), Anagnorisis (recognition), Catharsis | Tension-release pattern validation in content sections |
| RF-03 | Dialectic method | Plato, Socratic dialogues | Question-driven discovery | Question-based heading validation, FAQ patterns |
| RF-04 | Curiosity | Loewenstein (1994), Information Gap Theory | Curiosity arises from gap between known and unknown | Opening hook validation, question-before-answer checks |
| RF-05 | Cognitive load | Sweller, Cognitive Load Theory | Working memory limits (5±2 items) | Paragraph length, list size, chunking, section density |
| RF-06 | Worked examples | Sweller, Renkl | Studied examples > problem-solving for novices | Annotated code examples, example-per-section requirement |
| RF-07 | Flow state | Csikszentmihalyi | Challenge must match skill; clear goals + feedback | Progressive disclosure validation, goal statements |
| RF-08 | Dual coding | Paivio; Mayer, Multimedia Learning | Verbal + visual = better retention | Visual support validation (images, diagrams for conceptual content) |
| RF-09 | Instructional design | Gagné, Nine Events of Instruction | Structured learning sequence | Tutorial compliance checklist, draft completeness |
| RF-10 | Instructional design | Merrill, First Principles | Task-centered, activation, demonstration, application | Outline structure requirements |
| RF-11 | Web reading | Nielsen (1997–2020) | F-pattern scanning, inverted pyramid | Frontloading, heading descriptiveness, paragraph limits |
| RF-12 | Minimalism | Carroll (1990) | Action-oriented, task-based, error recovery | Verb-based headings, immediate code examples |
| RF-13 | Addictive design | Nir Eyal, *Hooked* | Variable rewards, triggers, investment | Progress signals, next-steps sections, achievement markers |
| RF-14 | Influence | Cialdini, *Influence* | Authority, social proof, reciprocity, commitment | Ethos signals, usage stats, incremental commitment |
| RF-15 | Completion | Zeigarnik Effect | Incomplete tasks create mental tension | Numbered steps, progress indicators |
| RF-16 | Narrative nonfiction | Talese, Wolfe, McPhee | Concrete detail, scene-setting, specificity | Generic placeholder detection (flags foo/bar), domain-specific naming |
| RF-17 | Voice | Strunk & White; Zinsser | Active voice, conversational tone, "you" focus | Active voice ratio, pronoun analysis, passive voice detection |
| RF-18 | Story structure | Campbell, *Hero with a Thousand Faces* | Hero's journey: ordinary → call → threshold → return | Tutorial narrative arc validation |
| RF-19 | LLM excess vocabulary | Kobak et al. (2024), *Science Advances* | LLMs produce statistically detectable excess usage of certain style words | LLM artifact detection dictionary (150+ patterns), vocabulary cleansing |

### Language analysis tools

DocFlow uses these libraries to measure prose quality programmatically:

| Tool | What it does | Used for |
|------|-------------|----------|
| **Flesch-Kincaid formula** | Computes reading grade level from syllable count and sentence length | DF-050: flags content above target grade (8 for tutorials, 10 for guides, 12 for whitepapers) |
| **syllable** (npm) | Counts syllables per word | Input to Flesch-Kincaid and readability scoring |
| **Passive voice detector** | Regex-based `is/are/was/were/been + past participle` pattern matching | DF-052: flags documents exceeding 20–25% passive voice |
| **unified / remark-parse** | Parses Markdown into an AST (headings, paragraphs, lists, code blocks) | Structural validation — section density, list length, heading depth, code block presence |
| **retext / retext-passive** | Natural language processing pipeline for English prose | Prose-level analysis and passive voice detection |
| **LLM artifact dictionary** | 150+ patterns: overused words, filler phrases, non-contracted forms, typographic markers | DF-090/DF-091: detects and auto-replaces AI-generated writing patterns |
| **Sentence splitter** | Regex-based sentence boundary detection | Paragraph length checks (max 5 sentences), sentence length checks (max 30 words) |
| **Information gap detector** | Keyword scanning for curiosity triggers (why, how, imagine, surprisingly) | Engagement scoring: curiosity dimension |
| **Active voice ratio** | Counts "you"/reader pronouns vs total pronoun usage | Engagement scoring: voice dimension |
| **Transition phrase scanner** | Detects bridging phrases between sections (now that, let's, building on) | Engagement scoring: flow dimension |

## Shell Scripts

Three standalone shell scripts for local audio/video transcription and summarization on Apple Silicon using MLX. These are independent of the DocFlow CLI and require a Python virtual environment (auto-created on first run).

### `transcribe.sh`

Transcribe audio files to text using MLX Whisper (Apple Silicon GPU).

```bash
./transcribe.sh recording.mp3
```

- Supports model selection: tiny, base, small (default), medium, large-v3, turbo, or custom Hugging Face model
- Shows audio duration and real-time progress
- Outputs `<basename>_transcript.txt`
- Requires: `ffmpeg`, Apple Silicon Mac
- Dependencies installed into `.venv` (mlx-whisper)

### `cleanup-transcript.sh`

Clean up a raw Whisper transcript using a local LLM via MLX — fixes formatting, removes filler words, and improves readability.

```bash
./cleanup-transcript.sh recording_transcript.txt
```

- Model choices: Llama 3.2 1B, 3B, Llama 3.1 8B 4-bit (default), 8B 8-bit, or custom
- Outputs `<basename>_cleaned.txt`
- Requires: `.venv` with `mlx-lm` (installed by `summarize-transcript.sh`)

### `summarize-transcript.sh`

Summarize a transcript using Qwen 2.5 with MLX (Apple Silicon GPU). Handles transcripts of any length via intelligent chunking.

```bash
./summarize-transcript.sh transcript.txt
./summarize-transcript.sh --install   # Pre-download model only
```

- Model choices: Qwen 2.5 7B, 14B, 32B 4-bit (default), 32B 8-bit, or custom
- Summary styles: Executive, Detailed, Bullet-only, Chapter, Blog Post (default)
- Requires: Apple Silicon Mac, ~20 GB RAM for default 32B model
- Dependencies auto-installed into `.venv` on first run

## Development

```bash
pnpm build          # Compile TypeScript and copy templates to dist/
pnpm dev            # Watch mode (TypeScript compiler)
pnpm test           # Run tests (vitest)
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Lint with ESLint
pnpm format         # Format with Prettier
pnpm format:check   # Check formatting without writing
```

After making changes, rebuild and relink the CLI:

```bash
pnpm build && pnpm link --global
```

## Project Structure

```
src/
  cli.ts                   # Entry point — registers all commands
  commands/
    init.ts                # docflow init — interactive project scaffolding
    validate.ts            # docflow validate — rule validation + watch mode
    list.ts                # docflow list + docflow show
    metrics.ts             # docflow metrics — engagement scoring display
    publish.ts             # docflow publish — publish gate enforcement
    archive.ts             # docflow archive — archive published docs
  scoring/
    engagement.ts          # 5-dimension engagement scoring engine
  templates/
    agents.md              # AI writing instructions (bundled into projects)
    guide.md               # Guide content template
    tutorial.md            # Tutorial content template
    reference.md           # Reference content template
    whitepaper.md          # Whitepaper content template
  utils/
    cross-references.ts    # {{doc:slug}} cross-reference resolver
    front-matter.ts        # YAML front matter parsing
    human-review.ts        # Human review gate + unknowns scanner
    markdown.ts            # Markdown AST parsing, word counting, agent stripping
    output-context.ts      # JSON/human output abstraction
    reading-time.ts        # Reading time estimation
  validators/
    llm-artifacts.ts       # LLM artifact detection and auto-fix
    profiles.ts            # Content-type validation profiles
    registry.ts            # Rule registry and profile execution
    rules.ts               # All validation rule implementations
    types.ts               # Diagnostic, ValidationContext types
test/                      # Vitest test suite (200+ tests)
```

## Tech Stack

- **TypeScript** — strict mode, ESM
- **Node.js** >= 18
- **commander** — CLI framework
- **@inquirer/prompts** — interactive init prompts
- **gray-matter** — YAML front matter parsing
- **unified / remark-parse** — Markdown AST parsing
- **retext / retext-passive** — natural language analysis (passive voice detection)
- **syllable** — syllable counting for readability metrics
- **vitest** — test framework
- **ESLint + Prettier** — linting and formatting
- **pnpm** — package manager

## License

ISC

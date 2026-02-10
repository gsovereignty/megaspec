# Project Context

## Purpose

DocFlow is an independent, CLI-first tool that helps subject matter experts (non-writers) produce engaging, addictive documentation, whitepapers, tutorials, and technical articles. It leverages LLM agents and research-backed validation rules drawn from classical rhetoric (Aristotle, Plato), cognitive science (Sweller, Loewenstein, Csikszentmihalyi), instructional design (Gagné, Merrill), and modern UX research (Nielsen) to systematically transform expert knowledge into content humans love to read.

DocFlow lives alongside OpenSpec in the megaspec repo but is fully independent — separate codebase, CLI, and AGENTS.md instructions. It can coexist with OpenSpec in the same project without conflict.

### Goals

- Enable SMEs to author high-quality documentation without professional writing skills
- Enforce engagement mechanics through automated validation (not subjective review)
- Produce flat, audience-ready master Markdown files in a single `publish/` folder
- Support configurable agent workflows (interview mode, transform mode) per project
- Provide engagement scoring and readability metrics with actionable feedback

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js (>=18 LTS)
- **CLI framework**: commander or oclif
- **Markdown parsing**: remark / unified + mdast (structural validation)
- **NLP / prose checks**: retext + plugins (passive voice, readability, sentence complexity)
- **Readability metrics**: Flesch-Kincaid, custom scoring engine
- **Style linting**: Vale integration (optional external linter)
- **Testing**: vitest + fixture-based golden tests
- **Storage**: Plain Markdown files + Git (no database)
- **Package manager**: pnpm

## Project Conventions

### Code Style

- Strict TypeScript with no implicit `any`
- ESLint with recommended + TypeScript rules
- Prettier for formatting (2-space indent, single quotes, trailing commas)
- Kebab-case for file names and CLI commands
- PascalCase for types/interfaces, camelCase for variables/functions

### Architecture Patterns

- **CLI layer**: Thin command handlers that delegate to service modules
- **Validation engine**: Rule-based with pluggable validators per content type
- **Validation profiles**: Tutorial, Reference, Guide, Whitepaper — each loads a different rule set
- **Template engine**: Scaffolds project files on `docflow init`
- **Scoring engine**: Computes engagement, clarity, action, flow, and voice scores
- **File conventions**: All document IDs are kebab-case slugs derived from title
- **Cross-references**: `{{doc:slug}}` syntax auto-resolved during publish step

### Testing Strategy

- Unit tests for each validator rule (fixture Markdown → expected diagnostics)
- Golden tests for engagement scoring (known input → known score)
- Integration tests for CLI commands (init, validate, publish, archive)
- Snapshot tests for template scaffolding output
- All tests run via `vitest`; CI must pass before merge

### Git Workflow

- `main` branch is always deployable
- Feature branches named `feat/[description]` or `fix/[description]`
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- PRs require passing CI + human review
- Squash merge to main

## Domain Context

### Key Concepts

- **SME (Subject Matter Expert)**: The primary user — has deep domain knowledge but may not be a skilled writer
- **Master file**: The final audience-facing Markdown document in `publish/`
- **Draft**: Working artifacts in `drafts/[slug]/` including outline, research, content, checklist
- **Engagement mechanics**: Validated patterns (hooks, information gaps, tension-release, progressive disclosure) that research proves increase reader engagement
- **Validation profile**: A content-type-specific rule set (tutorial, reference, guide, whitepaper) that adjusts which validation rules apply and their thresholds
- **Agent mode**: Configurable per project — interview mode (agent asks SME questions, generates draft) or transform mode (SME provides raw input, agent polishes)
- **Document ID (slug)**: Kebab-case identifier derived from document title, used for cross-references (`{{doc:slug}}`)

### Research Foundations

| Domain | Key Sources | Applied As |
|---|---|---|
| Classical rhetoric | Aristotle (ethos, pathos, logos; dramatic arc) | Outline structure, persuasion signals |
| Dialectic method | Plato / Socratic questioning | Question-driven headings, FAQ patterns |
| Curiosity | Loewenstein (information gap theory) | Hook validation, question-before-answer checks |
| Cognitive load | Sweller (CLT, worked examples) | Paragraph/list limits, example requirements |
| Flow state | Csikszentmihalyi | Goal clarity, progressive challenge |
| Dual coding | Paivio, Mayer | Visual support validation |
| Instructional design | Gagné (9 events), Merrill (first principles) | Tutorial compliance checklist |
| Web reading | Nielsen (F-pattern, scanning) | Frontloading, heading descriptiveness |
| Minimalism | Carroll | Action-oriented structure |
| Addictive content | Nir Eyal (Hooked), Cialdini, Zeigarnik | Progress signals, variable rewards |

### Three-Stage Workflow

```
drafts/[slug]/          →    publish/[slug].md    →    archive/YYYY-MM-DD-[slug].md
(working artifacts)          (master files)             (superseded versions)
```

### Draft Artifacts (per document)

| File | Purpose | Agent Role |
|---|---|---|
| `outline.md` | Reader journey, learning outcomes, engagement strategy, Aristotelian modes | Architect produces, SME validates |
| `research.md` | Sources, evidence, SME interview notes, narrative decisions | Researcher produces |
| `content.md` | The actual document with structured sections | Writer produces from outline + research |
| `checklist.md` | Writing tasks following Gagné's 9 events, status tracking | Generated from outline, tracks progress |

### Agent Modes (configurable in project.md)

| Mode | Description | Best For |
|---|---|---|
| **Interview** | Agent asks structured questions, generates draft from answers | SMEs who prefer conversation |
| **Transform** | SME provides raw notes/bullet points, agent transforms into engaging prose | SMEs who have existing content |
| **Single agent** | One agent handles all phases | Simple documents |
| **Role-based** | Separate researcher, writer, reviewer agents with handoffs | Complex whitepapers |
| **Consensus** | Multiple agents produce drafts, best elements merged | High-stakes content |

### Agent Configuration

```yaml
# Example agent config in project.md or docflow.yaml
agents:
  mode: role-based          # single | role-based | consensus
  interaction: interview    # interview | transform
  roles:
    researcher: true
    writer: true
    reviewer: true
  human_review: required    # required | optional
```

## Important Constraints

- **Human review gate**: All agent-produced content MUST receive explicit human signoff before promotion to `publish/`
- **Flat publish folder**: Master files MUST exist in a single `publish/` directory — no subdirectories
- **Independence**: DocFlow shares no internals with OpenSpec — separate CLI, separate codebase, separate instructions
- **Markdown only**: Final output is always Markdown; rendering to HTML/PDF is out of scope for v1
- **Git-based**: All state is file-based; no database or external service dependencies
- **Offline capable**: Core validation and scoring must work without network access (agent modes require LLM access)

## External Dependencies

- **LLM providers**: Required for agent modes (interview, transform, role-based). Provider-agnostic — works with any model that supports the AGENTS.md convention (Claude, GPT, etc.)
- **Vale** (optional): External prose linter for advanced style enforcement beyond built-in rules
- **Git**: Required for archive timestamping and version history
- **Node.js >= 18**: Runtime requirement

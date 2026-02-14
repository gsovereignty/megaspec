## MODIFIED Requirements

### Requirement: Project Initialization

The system SHALL provide a `docflow init [path]` command that scaffolds a new DocFlow project with the following structure at the given path (or current directory if none given): `project.md`, `publish/`, `drafts/`, `archive/`, a `templates/` directory containing scaffold files for tutorial, reference, guide, and whitepaper content types, and a `docflow/` directory containing `AGENTS.md` with AI assistant writing instructions.

The command MUST be idempotent — running it again on an existing project MUST NOT overwrite existing files.

When run without `--no-interactive`, the command SHALL launch an interactive guided setup that asks the user the following questions in order:

1. **Project name** — a short descriptive name for the documentation project (used as the heading in `project.md`)
2. **Content type** — which type of content the user wants to write: tutorial, guide, reference, or whitepaper (single select)
3. **Target audience** — a free-text description of who will read this content (e.g., "Backend developers familiar with Express but new to WebSockets")
4. **Topic** — a free-text description of what the content is about (e.g., "How to deploy a WebSocket server to production")
5. **Agent interaction mode** — whether the user wants to work in interview mode (AI asks questions, user answers) or transform mode (user provides raw notes, AI restructures): interview or transform

Based on the answers, the command SHALL:

- Generate `project.md` with the project name as the heading and the agent configuration block populated with the chosen interaction mode
- Scaffold a `drafts/<slug>/` directory where `<slug>` is derived from the project name (kebab-cased, lowercase, max 60 chars)
- Generate a `drafts/<slug>/PROMPT.md` file containing a complete, ready-to-paste prompt for the user's AI assistant. The prompt SHALL:
  - Reference `docflow/AGENTS.md` as the instruction file to follow
  - Specify the chosen content type and template path
  - Include the target audience and topic from the user's answers
  - For **interview mode**: instruct the AI to begin the 7-question interview flow (DF-070) with the audience and topic pre-filled as context
  - For **transform mode**: instruct the AI to accept the user's raw input and apply the transform workflow (DF-071) for the chosen content type
  - Remind the AI to produce `outline.md`, `content.md`, and `checklist.md` in the drafts directory

When `--no-interactive` is passed, the command MUST skip all interactive prompts and scaffold with the same default configuration as the current non-interactive behavior (single mode, interview interaction, all roles enabled, human review required). No `drafts/` directory or `PROMPT.md` is created in non-interactive mode.

Traces to: DF-001, DF-070, DF-071, DF-072, DF-074

#### Scenario: Fresh project initialization

- **WHEN** the user runs `docflow init my-project` in an empty parent directory
- **THEN** the directory `my-project/` is created containing `project.md`, `publish/`, `drafts/`, `archive/`, `templates/` with four content-type template files, and `docflow/AGENTS.md`
- **AND** the exit code is 0

#### Scenario: Init current directory

- **WHEN** the user runs `docflow init` without a path argument in an empty directory
- **THEN** the current directory is scaffolded with `project.md`, `publish/`, `drafts/`, `archive/`, `templates/`, and `docflow/AGENTS.md`

#### Scenario: Idempotent re-run

- **WHEN** the user runs `docflow init` in a directory that already contains a `project.md` and `docflow/AGENTS.md`
- **THEN** existing files are NOT overwritten
- **AND** the command reports which files were skipped and which were created
- **AND** the exit code is 0

#### Scenario: Init with --json output

- **WHEN** the user runs `docflow init my-project --json`
- **THEN** the output is valid JSON containing `{ "success": true, "created": [...], "skipped": [...] }`
- **AND** `docflow/AGENTS.md` appears in the `created` array

#### Scenario: AGENTS.md generated from bundled template

- **WHEN** the user runs `docflow init`
- **THEN** `docflow/AGENTS.md` is created from the bundled template at `src/templates/agents.md`
- **AND** the file contains all required sections: Quick Reference Checklist, Content Type Rules, Research-Based Writing Guidance, Common Mistakes, Self-Validation Checklist, Interview Mode, Transform Mode, Agent Modes, Agent Contributions Format, and Role Contracts

#### Scenario: Interactive guided setup with interview mode

- **WHEN** the user runs `docflow init my-project` without `--no-interactive`
- **AND** answers: project name "WebSocket Deployment Guide", content type "guide", audience "Backend developers familiar with Express", topic "Deploying WebSocket servers to production", interaction mode "interview"
- **THEN** `project.md` is created with heading "# WebSocket Deployment Guide" and agent config with `interaction: interview`
- **AND** `drafts/websocket-deployment-guide/` directory is created
- **AND** `drafts/websocket-deployment-guide/PROMPT.md` is created containing a prompt that references `docflow/AGENTS.md`, specifies content type "guide", includes the audience and topic, and instructs the AI to begin the 7-question interview flow

#### Scenario: Interactive guided setup with transform mode

- **WHEN** the user runs `docflow init` without `--no-interactive`
- **AND** answers: project name "API Reference", content type "reference", audience "Senior engineers integrating our payment API", topic "Payment processing REST API endpoints", interaction mode "transform"
- **THEN** `project.md` is created with heading "# API Reference" and agent config with `interaction: transform`
- **AND** `drafts/api-reference/PROMPT.md` is created containing a prompt that instructs the AI to accept raw input, apply transform mode rules, and produce artifacts for a reference document

#### Scenario: Non-interactive fallback

- **WHEN** the user runs `docflow init --no-interactive`
- **THEN** the command scaffolds with default configuration (single mode, interview, all roles, human review required)
- **AND** no interactive prompts are displayed
- **AND** no `drafts/` subdirectory or `PROMPT.md` is created
- **AND** `project.md` contains the default hardcoded agent configuration

#### Scenario: Init with --json skips interactive prompts

- **WHEN** the user runs `docflow init --json`
- **THEN** the command behaves as non-interactive (no prompts displayed)
- **AND** the output is valid JSON with `created` and `skipped` arrays

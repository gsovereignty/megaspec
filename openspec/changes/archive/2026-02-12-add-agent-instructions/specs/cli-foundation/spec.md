# cli-foundation Spec Delta

## MODIFIED Requirements

### Requirement: Project Initialization

The system SHALL provide a `docflow init [path]` command that scaffolds a new DocFlow project with the following structure at the given path (or current directory if none given): `project.md`, `publish/`, `drafts/`, `archive/`, a `templates/` directory containing scaffold files for tutorial, reference, guide, and whitepaper content types, and a `docflow/` directory containing `AGENTS.md` with AI assistant writing instructions.

The command MUST be idempotent — running it again on an existing project MUST NOT overwrite existing files.

Traces to: DF-001, DF-074

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

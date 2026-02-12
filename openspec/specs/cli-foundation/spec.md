# cli-foundation Specification

## Purpose
TBD - created by archiving change add-cli-foundation. Update Purpose after archive.
## Requirements
### Requirement: Project Initialization

The system SHALL provide a `docflow init [path]` command that scaffolds a new DocFlow project with the following structure at the given path (or current directory if none given): `project.md`, `publish/`, `drafts/`, `archive/`, and a `templates/` directory containing scaffold files for tutorial, reference, guide, and whitepaper content types.

The command MUST be idempotent — running it again on an existing project MUST NOT overwrite existing files.

Traces to: DF-001

#### Scenario: Fresh project initialization

- **WHEN** the user runs `docflow init my-project` in an empty parent directory
- **THEN** the directory `my-project/` is created containing `project.md`, `publish/`, `drafts/`, `archive/`, and `templates/` with four content-type template files
- **AND** the exit code is 0

#### Scenario: Init current directory

- **WHEN** the user runs `docflow init` without a path argument in an empty directory
- **THEN** the current directory is scaffolded with `project.md`, `publish/`, `drafts/`, `archive/`, and `templates/`

#### Scenario: Idempotent re-run

- **WHEN** the user runs `docflow init` in a directory that already contains a `project.md`
- **THEN** existing files are NOT overwritten
- **AND** the command reports which files were skipped and which were created
- **AND** the exit code is 0

#### Scenario: Init with --json output

- **WHEN** the user runs `docflow init my-project --json`
- **THEN** the output is valid JSON containing `{ "success": true, "created": [...], "skipped": [...] }`

---

### Requirement: Content Type Templates

The system SHALL scaffold content-type templates for tutorial, reference, guide, and whitepaper into the project's `templates/` directory on `docflow init`. Each template MUST include YAML front matter with `type`, `audience`, `id`, and `title` placeholder fields, and MUST include all required sections for its content type as defined by the validation profiles (DF-040P through DF-043P).

Traces to: DF-002

#### Scenario: Tutorial template contains required sections

- **WHEN** the user runs `docflow init`
- **THEN** `templates/tutorial.md` exists with YAML front matter containing `type: tutorial`, `audience`, `id`, and `title` fields
- **AND** the template contains sections for: opening hook, learning objectives, prerequisites, worked example, practice exercise, and next steps

#### Scenario: Reference template contains required sections

- **WHEN** the user runs `docflow init`
- **THEN** `templates/reference.md` exists with YAML front matter containing `type: reference`
- **AND** the template contains sections for: front matter fields, heading hierarchy, and code examples

#### Scenario: Guide template contains required sections

- **WHEN** the user runs `docflow init`
- **THEN** `templates/guide.md` exists with YAML front matter containing `type: guide`
- **AND** the template contains sections for: opening hook, examples per section, question framing, and next steps

#### Scenario: Whitepaper template contains required sections

- **WHEN** the user runs `docflow init`
- **THEN** `templates/whitepaper.md` exists with YAML front matter containing `type: whitepaper`
- **AND** the template contains sections for: opening hook, ethos signals, evidence and citations, and logical argument structure

---

### Requirement: Global CLI Flags

All CLI commands SHALL support `--json` and `--no-interactive` flags. The `--json` flag MUST cause the command to output valid JSON instead of human-formatted text. The `--no-interactive` flag MUST prevent the command from prompting for user input; if input would be required, the command MUST fail with an error instead.

These flags MUST be applied as global options before command parsing so every current and future command inherits them automatically.

Traces to: DF-011

#### Scenario: JSON output flag

- **WHEN** the user runs any `docflow` command with the `--json` flag
- **THEN** the output is valid JSON
- **AND** no human-formatted text is written to stdout

#### Scenario: No-interactive flag prevents prompts

- **WHEN** the user runs a command that would normally prompt for input with the `--no-interactive` flag
- **THEN** no interactive prompt is displayed
- **AND** the command either succeeds with sensible defaults or fails with an error explaining the missing input

#### Scenario: Flags are global

- **WHEN** a new command is added to the CLI
- **THEN** it automatically inherits `--json` and `--no-interactive` without additional flag registration


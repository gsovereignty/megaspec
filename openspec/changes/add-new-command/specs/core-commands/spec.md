## ADDED Requirements
### Requirement: New Draft Command

The system SHALL provide a `docflow new <slug>` command that scaffolds a complete draft directory at `drafts/<slug>/` containing four artifacts: `content.md`, `outline.md`, `research.md`, and `checklist.md`. Each artifact SHALL be generated from the content-type template with front matter fields populated from CLI arguments. All four artifacts SHALL include a stub `## Agent Contributions` section with `### Role`, `### Assumptions`, and `### Unknowns` subsections.

The command SHALL support `--type <type>` (tutorial, reference, guide, whitepaper; default: guide), `--title <title>` (used in front matter and H1 heading; default: slug converted to title case), and `--audience <level>` (beginner, intermediate, advanced; default: intermediate).

The command SHALL refuse to overwrite an existing draft directory, emitting an error: `Draft "<slug>" already exists at drafts/<slug>/`. The command SHALL support `--json` and `--no-interactive` global flags.

#### Scenario: Scaffold a new guide draft

- **WHEN** the user runs `docflow new caching-strategies --type guide --title "Caching Strategies"`
- **THEN** `drafts/caching-strategies/` is created containing `content.md`, `outline.md`, `research.md`, and `checklist.md`
- **AND** `content.md` has front matter with `type: guide`, `title: Caching Strategies`, `id: caching-strategies`, `audience: intermediate`
- **AND** `content.md` body is populated from the guide template
- **AND** all four files end with a stub `## Agent Contributions` section

#### Scenario: Default values when flags omitted

- **WHEN** the user runs `docflow new my-post`
- **THEN** front matter has `type: guide`, `title: My Post`, `audience: intermediate`, `id: my-post`

#### Scenario: Refuse to overwrite existing draft

- **WHEN** `drafts/caching-strategies/` already exists
- **AND** the user runs `docflow new caching-strategies`
- **THEN** the command exits with code 1 and message `Draft "caching-strategies" already exists at drafts/caching-strategies/`

#### Scenario: JSON output

- **WHEN** the user runs `docflow new my-post --json`
- **THEN** output is valid JSON: `{ "success": true, "slug": "my-post", "created": ["content.md", "outline.md", "research.md", "checklist.md"] }`

#### Scenario: Invalid content type

- **WHEN** the user runs `docflow new my-post --type blog`
- **THEN** the command exits with code 1 and message `Invalid content type: blog. Must be one of: tutorial, reference, guide, whitepaper`

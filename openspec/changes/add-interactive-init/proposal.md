# Change: Add interactive guided setup to `docflow init`

## Why

The current `docflow init` command silently scaffolds directories and boilerplate files with hardcoded defaults. The user then has to manually edit `project.md`, figure out which content type to use, and separately prompt their AI assistant to start the interview or transform workflow. This creates a gap between project initialization and productive writing — the user has to read documentation to understand what to do next.

By making `init` interactive, DocFlow can ask the user a few focused questions (topic, content type, audience, preferred agent mode) and generate a tailored `project.md` plus a ready-to-use `drafts/<slug>/PROMPT.md` file. The user can then paste that prompt directly into their AI assistant and start writing immediately.

## What Changes

- `docflow init` gains an interactive setup flow that asks 5 questions: project name, content type, target audience, topic description, and agent interaction mode
- Based on answers, `project.md` is generated with tailored configuration instead of hardcoded defaults
- A `drafts/<slug>/PROMPT.md` file is generated containing a ready-to-paste prompt for the user's AI assistant, pre-populated with the interview mode questions or transform mode instructions for the chosen content type and topic
- When `--no-interactive` is passed, the command falls back to current non-interactive scaffolding behavior with sensible defaults (preserving backward compatibility)
- Adds `@inquirer/prompts` as a production dependency for interactive terminal prompts

## Impact

- Affected specs: cli-foundation (modifies Project Initialization requirement)
- Affected code: `src/commands/init.ts`, `package.json`
- No breaking changes — `--no-interactive` preserves existing behavior exactly

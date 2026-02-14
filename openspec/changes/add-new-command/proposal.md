# Change: Add `docflow new` command for draft scaffolding

## Why
Creating a draft currently requires the user to manually `mkdir`, hand-write four Markdown files with correct front matter and structure, and remember to add `## Agent Contributions` sections to each. This is the most tedious step in the workflow and the most common source of errors for new users.

## What Changes
- Add a `docflow new <slug>` command that scaffolds a complete `drafts/<slug>/` directory
- The command generates `content.md`, `outline.md`, `research.md`, and `checklist.md` from the content-type template
- Front matter fields (`type`, `title`, `id`, `audience`) are populated from CLI arguments
- All four artifacts include a stub `## Agent Contributions` section
- Supports `--type <type>` (default: guide), `--title <title>`, and `--audience <level>` flags
- Idempotent — refuses to overwrite an existing draft directory
- Affected specs: cli-foundation, core-commands

## Impact
- Affected specs: cli-foundation (new command registration), core-commands (new command behavior)
- Affected code: `src/commands/new.ts` (new), `src/cli.ts` (register command)
- No breaking changes

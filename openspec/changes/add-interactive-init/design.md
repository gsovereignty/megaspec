## Context

The `docflow init` command currently scaffolds a project non-interactively with hardcoded defaults. This change makes it interactive — asking the user questions and generating a tailored prompt file their AI assistant can follow. This is a cross-cutting change: it affects `init.ts`, introduces a new dependency, and generates a new artifact type (`PROMPT.md`).

## Goals / Non-Goals

- **Goals**: Guide users from zero to "paste this prompt into your AI assistant" in one command; generate content-type-aware prompts that leverage the interview or transform workflows already defined in `docflow/AGENTS.md`
- **Non-Goals**: Building an AI agent runtime, adding LLM API integration, or replacing the existing AGENTS.md instruction system; this is still file-based agent architecture

## Decisions

- **Prompting library**: Use `@inquirer/prompts` (modern, ESM-native, tree-shakeable successor to inquirer.js). It's already a transitive dependency via rollup. Alternatives: `readline` (too low-level, poor UX), `prompts` (less maintained), `clack` (nice UX but smaller ecosystem).
- **PROMPT.md location**: Place in `drafts/<slug>/PROMPT.md` rather than project root. Rationale: the prompt is specific to a piece of content being written, not a project-level config. This aligns with the `add-new-command` proposal which also scaffolds under `drafts/<slug>/`.
- **Slug derivation**: Lowercase, replace non-alphanumeric with hyphens, collapse consecutive hyphens, trim to 60 chars. No uniqueness check needed — `writeFileIfNotExists` handles collisions.
- **--json implies --no-interactive**: When `--json` is passed, skip prompts and use defaults. JSON output consumers are scripts/CI, not humans.
- **Interview vs transform prompt content**: The generated PROMPT.md does NOT duplicate the full interview/transform instructions from AGENTS.md. Instead it references AGENTS.md and provides the specific context (content type, audience, topic) that those instructions need. This keeps the prompt short and avoids content drift.

## Risks / Trade-offs

- **New dependency**: `@inquirer/prompts` adds ~50KB to the bundle. Mitigated: it's already a transitive dep, well-maintained, and the standard Node.js prompting solution.
- **Interactive by default**: Existing scripts calling `docflow init` without `--no-interactive` will now hang waiting for input. Mitigated: `--json` also implies non-interactive, and CI environments typically pass `--no-interactive`.

## Open Questions

- None — the design is straightforward and the interactive patterns are well-established in CLI tooling.

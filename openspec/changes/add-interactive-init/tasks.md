## 1. Implementation

- [x] 1.1 Add `@inquirer/prompts` as a production dependency
- [x] 1.2 Implement interactive prompt flow in `src/commands/init.ts` — ask 5 questions (project name, content type, audience, topic, interaction mode) when not `--no-interactive` and not `--json`
- [x] 1.3 Generate tailored `project.md` from user answers instead of hardcoded content (project name as heading, chosen interaction mode in agent config)
- [x] 1.4 Implement slug derivation from project name (kebab-case, lowercase, max 60 chars) and scaffold `drafts/<slug>/` directory
- [x] 1.5 Implement `PROMPT.md` generation — produce a ready-to-paste prompt file for interview mode (pre-filling audience/topic context, referencing the 7 questions) or transform mode (instructing AI to accept raw input)
- [x] 1.6 Add tests for interactive init flow (mock prompts), PROMPT.md content for both modes, slug derivation, non-interactive fallback, and --json behavior

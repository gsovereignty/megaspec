## 1. Project Setup

- [x] 1.1 Initialize pnpm project with `package.json` (name: `docflow`, type: module, bin entry)
- [x] 1.2 Configure TypeScript (`tsconfig.json`: strict, ES2022 target, Node module resolution)
- [x] 1.3 Configure ESLint with recommended + TypeScript rules
- [x] 1.4 Configure Prettier (2-space indent, single quotes, trailing commas)
- [x] 1.5 Configure vitest for unit and integration testing
- [x] 1.6 Add npm scripts: `build`, `dev`, `test`, `lint`, `format`

## 2. CLI Framework

- [x] 2.1 Create `src/cli.ts` entry point using commander
- [x] 2.2 Implement global `--json` flag (boolean, default false)
- [x] 2.3 Implement global `--no-interactive` flag (boolean, default false)
- [x] 2.4 Create `OutputContext` utility that switches between human and JSON output
- [x] 2.5 Wire global flags via `preAction` hook into shared context
- [x] 2.6 Add `bin` entry in `package.json` pointing to compiled CLI

## 3. Init Command

- [x] 3.1 Create `src/commands/init.ts` with `docflow init [path]` command
- [x] 3.2 Scaffold `project.md` from bundled template
- [x] 3.3 Scaffold `publish/`, `drafts/`, `archive/` directories
- [x] 3.4 Scaffold `templates/` directory with 4 content-type templates
- [x] 3.5 Implement idempotency — skip existing files, report what was created vs skipped
- [x] 3.6 Support `--json` output for init results
- [x] 3.7 Support `--no-interactive` (no confirmation prompts)

## 4. Content-Type Templates

- [x] 4.1 Create `src/templates/tutorial.md` with YAML front matter and required sections per DF-040P
- [x] 4.2 Create `src/templates/reference.md` with YAML front matter and required sections per DF-041P
- [x] 4.3 Create `src/templates/guide.md` with YAML front matter and required sections per DF-042P
- [x] 4.4 Create `src/templates/whitepaper.md` with YAML front matter and required sections per DF-043P
- [x] 4.5 Each template MUST include YAML front matter fields: `type`, `audience`, `id`, `title`

## 5. Testing

- [x] 5.1 Integration test: `docflow init` creates all expected directories and files
- [x] 5.2 Integration test: `docflow init` is idempotent (second run skips existing)
- [x] 5.3 Integration test: `docflow init --json` returns valid JSON with created file list
- [x] 5.4 Unit test: `OutputContext` correctly switches between human and JSON modes
- [x] 5.5 Snapshot test: each template file matches expected scaffold output
- [x] 5.6 Integration test: `docflow init` in an existing project reports skipped files

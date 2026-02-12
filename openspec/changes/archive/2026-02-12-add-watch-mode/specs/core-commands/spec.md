## MODIFIED Requirements
### Requirement: Validate Command

The `docflow validate [file]` command SHALL run the full validation suite against a document. It SHALL support `--strict` (treat warnings as errors), `--rule <ruleId>` (run specific rule), `--engagement-report` (include engagement scores), `--strip-llm` (output cleaned document with LLM artifacts replaced), and `--watch` (continuously re-run validation on file changes). Human output SHALL group diagnostics by severity. JSON output SHALL include diagnostics array, pass/warn/fail counts, and optional engagement and cleaned-content fields. When `--watch` is active, the command SHALL monitor the target file (or all `drafts/**/*.md` if no file specified) for changes, debounce events (300ms), clear the terminal between runs, and re-display validation results. The command SHALL exit cleanly on SIGINT. When `--watch` is combined with `--engagement-report`, score deltas from the previous run SHALL be displayed. In `--json` mode with `--watch`, output SHALL be newline-delimited JSON (one object per run) without clearing.

Traces to: DF-006, DF-007, DF-092

#### Scenario: Validate with --strip-llm

- **GIVEN** a file containing LLM artifacts like "delve" and em dashes
- **WHEN** `docflow validate --strip-llm <file>` is run
- **THEN** stdout contains the document with artifacts replaced by suggested alternatives
- **AND** validation diagnostics are still shown

#### Scenario: Validate --strip-llm --json

- **GIVEN** a file with LLM artifacts
- **WHEN** `docflow validate --strip-llm --json <file>` is run
- **THEN** output includes `cleaned` (cleaned content string) and `replacements` (count of applied replacements)

#### Scenario: Watch mode re-runs validation on file change

- **GIVEN** the user runs `docflow validate content.md --watch`
- **WHEN** `content.md` is modified and saved
- **THEN** the terminal is cleared and validation results are re-displayed
- **AND** the process continues watching for further changes

#### Scenario: Watch mode with engagement deltas

- **GIVEN** the user runs `docflow validate content.md --watch --engagement-report`
- **AND** the first run shows `clarity: 72`
- **WHEN** the file is edited and clarity improves
- **THEN** the re-run shows `clarity: 72 → 78 (+6)`

#### Scenario: Watch mode with --json

- **GIVEN** the user runs `docflow validate content.md --watch --json`
- **WHEN** the file changes twice
- **THEN** stdout contains two newline-separated JSON objects, each with full validation results
- **AND** the terminal is not cleared between runs

#### Scenario: Watch mode with no file argument

- **GIVEN** the user runs `docflow validate --watch` in a DocFlow project
- **WHEN** any `.md` file under `drafts/` is modified
- **THEN** that file is validated and results are displayed

#### Scenario: Watch mode graceful shutdown

- **GIVEN** the user runs `docflow validate --watch`
- **WHEN** the user presses Ctrl+C
- **THEN** the watcher closes, a summary line is printed, and the process exits with code 0

## MODIFIED Requirements

### Requirement: Validate Command

The `docflow validate [file]` command SHALL run the full validation suite against a document. It SHALL support `--strict` (treat warnings as errors), `--rule <ruleId>` (run specific rule), `--engagement-report` (include engagement scores), and `--strip-llm` (output cleaned document with LLM artifacts replaced). Human output SHALL group diagnostics by severity. JSON output SHALL include diagnostics array, pass/warn/fail counts, and optional engagement and cleaned-content fields.

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

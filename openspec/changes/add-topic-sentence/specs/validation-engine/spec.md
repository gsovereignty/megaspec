## MODIFIED Requirements

### Requirement: Readability Validation

The system SHALL validate readability: Flesch-Kincaid grade level against profile target (WARN, DF-050), sentences > 30 words (WARN, DF-051), passive voice > 20% (WARN, DF-052), low reader-focus ratio (WARN, DF-053), vague standalone headings (WARN, DF-054), topic sentence frontloading (WARN, DF-055).

Traces to: DF-050, DF-051, DF-052, DF-053, DF-054, DF-055

#### Scenario: Topic sentence not frontloaded

- **GIVEN** a paragraph where the dominant non-stopword keyword "caching" appears only in sentence 3
- **WHEN** validation runs
- **THEN** WARN: "Paragraph at line N may not frontload its main point. The key topic 'caching' first appears in sentence 3. [RF-11]"

#### Scenario: Topic sentence properly frontloaded

- **GIVEN** a paragraph where the dominant keyword appears in sentence 1
- **WHEN** validation runs
- **THEN** no diagnostic is emitted for DF-055

#### Scenario: Single-sentence paragraph skipped

- **GIVEN** a paragraph with only one sentence
- **WHEN** validation runs
- **THEN** no diagnostic is emitted for DF-055

# engagement-scoring Specification

## Purpose
TBD - created by archiving change add-core-commands. Update Purpose after archive.
## Requirements
### Requirement: Curiosity Score

The system SHALL compute a Curiosity Score (0-10) based on: opening hook presence (+3), information gaps posed as questions before answers (+1 each, max +3), cliffhanger transitions between sections (+0.5 each, max +2), and question-based headings (+0.5 each, max +2).

Traces to: DF-060

#### Scenario: Document with strong curiosity signals

- **WHEN** content has an opening hook, 3 information gaps, 2 cliffhangers, and 2 question headings
- **THEN** curiosity score is 10

#### Scenario: Document with no curiosity signals

- **WHEN** content has no hook, no questions, no cliffhangers
- **THEN** curiosity score is 0

---

### Requirement: Clarity Score

The system SHALL compute a Clarity Score (0-10) based on: Flesch-Kincaid within target (+0–3), paragraph length compliance as percentage of paragraphs ≤ 5 sentences (+0–3), list compliance as percentage of lists with 3-7 items (+0–2), and heading descriptiveness as percentage passing blocklist (+0–2).

Traces to: DF-061

#### Scenario: Highly readable document

- **WHEN** FK is at target, all paragraphs ≤ 5 sentences, all lists 3-7 items, all headings descriptive
- **THEN** clarity score is 10

---

### Requirement: Action Score

The system SHALL compute an Action Score (0-10) based on: annotated code examples (+1 each, max +4), exercises/practice sections (+2 each, max +4), next-steps section present (+1), and concrete outcome statements (+0.5 each, max +1).

Traces to: DF-062

#### Scenario: Tutorial with examples and exercises

- **WHEN** content has 4 annotated code examples, 2 exercises, next steps, and 2 outcome statements
- **THEN** action score is 10

---

### Requirement: Flow Score

The system SHALL compute a Flow Score (0-10) based on: section transition phrases as percentage of H2 transitions with momentum phrases (+0–3), tension-release patterns as percentage of sections with problem-before-solution (+0–3), progressive disclosure heuristic (+0–2), and narrative arc completeness with setup/confrontation/resolution (+0–2).

Traces to: DF-063

#### Scenario: Well-structured tutorial

- **WHEN** content has momentum transitions, tension-release, progressive complexity, and complete arc
- **THEN** flow score approaches 10

---

### Requirement: Voice Score

The system SHALL compute a Voice Score (0-10) based on: active voice ratio (+0–3, 0 at ≤60%, 3 at ≥80%), reader pronoun ratio you:system (+0–3, 0 at ≤1:4, 3 at ≥1:1), contractions present (+1), questions in prose (+0.5 each, max +2), and informal markers (+0.5 each, max +1).

Traces to: DF-064

#### Scenario: Conversational document

- **WHEN** content has 85% active voice, 1:1 reader ratio, contractions, questions, and informal markers
- **THEN** voice score approaches 10

#### Scenario: Whitepaper with relaxed voice scoring

- **WHEN** profile is whitepaper
- **THEN** passive voice threshold increases to 35% and reader pronoun ratio is not checked

---

### Requirement: Total Engagement Score

The system SHALL compute a Total Engagement Score as a weighted average of the five dimension scores. Default weights: Curiosity=0.25, Clarity=0.25, Action=0.20, Flow=0.15, Voice=0.15. Weights SHALL be configurable in `project.md` under `scoring.weights`.

Traces to: DF-065

#### Scenario: Default weight calculation

- **WHEN** dimension scores are Curiosity=8, Clarity=6, Action=7, Flow=5, Voice=9
- **THEN** total = (8×0.25) + (6×0.25) + (7×0.20) + (5×0.15) + (9×0.15) = 7.0

#### Scenario: Custom weights

- **WHEN** `project.md` specifies `scoring.weights.curiosity: 0.40`
- **THEN** the total score reflects the custom weighting


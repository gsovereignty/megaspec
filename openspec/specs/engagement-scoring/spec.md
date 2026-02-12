# engagement-scoring Specification

## Purpose
Defines the five-dimension engagement scoring engine (curiosity, clarity, action, flow, voice) that quantifies how engaging a document is on a 0-100 scale, with configurable weights for the total score.
## Requirements
### Requirement: Curiosity Score

The system SHALL compute a Curiosity Score (0-100) based on: opening hook presence, information gaps posed as questions before answers, cliffhanger transitions between sections, question-based headings, and concrete statistics or numbers.

Traces to: DF-060

#### Scenario: Document with strong curiosity signals

- **WHEN** content has an opening hook, multiple information gaps, and question headings
- **THEN** curiosity score approaches 100

#### Scenario: Document with no curiosity signals

- **WHEN** content has no hook, no questions, no cliffhangers
- **THEN** curiosity score is 0

---

### Requirement: Clarity Score

The system SHALL compute a Clarity Score (0-100) based on: Flesch-Kincaid grade level relative to profile target, sentence length compliance, and heading descriptiveness ratio.

Traces to: DF-061

#### Scenario: Highly readable document

- **WHEN** FK is at target, all sentences ≤ 30 words, and all headings are descriptive
- **THEN** clarity score approaches 100

---

### Requirement: Action Score

The system SHALL compute an Action Score (0-100) based on: code block count, example/use-case headings, exercise/practice sections, and step progress indicators.

Traces to: DF-062

#### Scenario: Tutorial with examples and exercises

- **WHEN** content has multiple code blocks, example headings, exercises, and step progress indicators
- **THEN** action score approaches 100

---

### Requirement: Flow Score

The system SHALL compute a Flow Score (0-100) based on: section transition phrases between H2 sections, presence of next-steps sections, and narrative arc completeness (setup + resolution).

Traces to: DF-063

#### Scenario: Well-structured tutorial

- **WHEN** content has momentum transitions, next steps, and a complete narrative arc
- **THEN** flow score approaches 100

---

### Requirement: Voice Score

The system SHALL compute a Voice Score (0-100) based on: reader pronoun ratio (you vs system phrases), active voice ratio (with profile-specific passive voice threshold), and engaging tone markers.

Traces to: DF-064

#### Scenario: Conversational document

- **WHEN** content has high active voice ratio, strong reader pronoun presence, and engaging tone words
- **THEN** voice score approaches 100

#### Scenario: Whitepaper with relaxed voice scoring

- **WHEN** profile is whitepaper
- **THEN** passive voice threshold increases to 35%

---

### Requirement: Total Engagement Score

The system SHALL compute a Total Engagement Score (0-100) as a weighted average of the five dimension scores. Default weights: Curiosity=0.25, Clarity=0.25, Action=0.20, Flow=0.15, Voice=0.15.

Traces to: DF-065

#### Scenario: Default weight calculation

- **WHEN** dimension scores are Curiosity=80, Clarity=60, Action=70, Flow=50, Voice=90
- **THEN** total = (80×0.25) + (60×0.25) + (70×0.20) + (50×0.15) + (90×0.15) = 70


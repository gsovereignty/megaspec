# agent-instructions Specification

## Purpose
TBD - created by archiving change add-agent-instructions. Update Purpose after archive.
## Requirements
### Requirement: Research-Based Writing Guidance

The `docflow/AGENTS.md` file SHALL encode all 19 research foundations (RF-01 through RF-19) as operational writing instructions. Each research foundation MUST have a dedicated section containing: the principle stated as a concrete directive, at least one good example, at least one bad example, and the rule IDs that validate compliance.

Instructions MUST be operational ("pose a specific question before explaining the concept") not academic ("apply Loewenstein's Information Gap Theory").

Traces to: DF-074

#### Scenario: All research foundations covered

- **WHEN** the user reads `docflow/AGENTS.md`
- **THEN** there is a writing guidance entry for each of RF-01 through RF-19
- **AND** each entry contains a directive, a good example, and a bad example

#### Scenario: Operational not academic instructions

- **WHEN** the agent reads the RF-04 (curiosity) entry
- **THEN** it finds instructions like "pose a specific question before explaining the concept" or "tell the reader what they'll be able to do, then withhold the how"
- **AND** it does NOT find instructions like "apply Information Gap Theory" or "leverage Loewenstein's framework"

---

### Requirement: Content Type Writing Rules

The `docflow/AGENTS.md` file SHALL include a section for each content type (tutorial, guide, reference, whitepaper) listing which validation rules apply, their severity, and concrete good/bad output examples for each rule.

Traces to: DF-074

#### Scenario: Tutorial rules documented

- **WHEN** the agent reads the tutorial rules section
- **THEN** it finds requirements for: opening hook, learning objectives, prerequisites, worked examples, practice exercises, next steps, numbered steps, and narrative arc
- **AND** each requirement includes at least one good and one bad example

#### Scenario: Reference rules exclude engagement

- **WHEN** the agent reads the reference rules section
- **THEN** opening hooks, narrative arc, and exercise checks are explicitly marked as NOT APPLICABLE
- **AND** the focus is on structure, completeness, and heading hierarchy

---

### Requirement: Interview Mode Instructions

The `docflow/AGENTS.md` file SHALL include interview mode instructions that tell the AI assistant to: (1) read the content type template to determine required sections, (2) ask the SME 7 structured questions in a defined order, (3) generate `outline.md` from answers, (4) draft `content.md` applying engagement rules, (5) generate `checklist.md` mapped to Gagné's 9 events, (6) document all assumptions in Agent Contributions sections.

Traces to: DF-070

#### Scenario: Seven interview questions present

- **WHEN** the agent reads the interview mode section
- **THEN** it finds these 7 questions in order: "Who is the target reader?", "What should they be able to do after reading?", "What do they already know?", "What's the core problem this solves?", "Walk me through the main steps/concepts", "What mistakes do people commonly make?", "What's the surprising insight or key takeaway?"

#### Scenario: Interview produces three artifacts

- **WHEN** the agent follows interview mode instructions with complete SME answers
- **THEN** it generates `outline.md`, `content.md`, and `checklist.md`
- **AND** each file includes an `## Agent Contributions` section

---

### Requirement: Transform Mode Instructions

The `docflow/AGENTS.md` file SHALL include transform mode instructions that tell the AI assistant to: (1) accept raw SME input, (2) analyze for engagement gaps, (3) generate `outline.md` structuring the raw input, (4) transform into `content.md` with engagement mechanics, (5) preserve all factual claims without hallucination, (6) flag uncertain transformations in Agent Contributions.

Traces to: DF-071

#### Scenario: Transform preserves factual claims

- **WHEN** the agent reads transform mode instructions
- **THEN** it finds an explicit directive to never hallucinate domain claims
- **AND** it finds instructions to flag uncertain items in `### Unknowns`

#### Scenario: Transform applies engagement mechanics

- **WHEN** the agent reads transform mode instructions
- **THEN** it finds directives to apply: opening hook, tension-release per section, concrete examples, reader-centric voice, and progressive disclosure

---

### Requirement: Agent Mode Guidance

The `docflow/AGENTS.md` file SHALL document when each agent mode is appropriate: **single** mode for simple documentation, **role-based** mode for complex whitepapers with researcher → writer → reviewer handoff, and **consensus** mode for high-stakes content requiring multi-agent agreement.

Traces to: DF-072

#### Scenario: Mode selection guidance

- **WHEN** the agent reads the agent modes section
- **THEN** it finds descriptions of single, role-based, and consensus modes
- **AND** each mode includes guidance on when to use it and an example use case

---

### Requirement: Agent Contributions Format

The `docflow/AGENTS.md` file SHALL instruct agents on the required metadata format for agent-produced artifacts. Every artifact MUST include `## Agent Contributions` with subsections: `### Role`, `### Assumptions`, and `### Unknowns`.

Traces to: DF-073

#### Scenario: Format fully specified

- **WHEN** the agent reads the Agent Contributions section
- **THEN** it finds the exact Markdown structure to use with `## Agent Contributions`, `### Role`, `### Assumptions`, and `### Unknowns`
- **AND** it finds an example showing correct formatting

#### Scenario: Unknowns default documented

- **WHEN** the agent reads the Agent Contributions section
- **THEN** it finds instructions to use "None" in `### Unknowns` when there are no uncertainties (not an empty section)

---

### Requirement: Role Contracts

The `docflow/AGENTS.md` file SHALL define explicit role contracts for researcher, writer, and reviewer. Each contract MUST specify: what the role receives as input, what it produces as output, and what metadata it must include in `## Agent Contributions`.

Traces to: DF-075

#### Scenario: Researcher contract

- **WHEN** the agent reads the researcher role contract
- **THEN** it finds: input is `outline.md` + SME topic, output is `research.md` with Sources, Evidence, and Assumptions/Unknowns sections

#### Scenario: Writer contract

- **WHEN** the agent reads the writer role contract
- **THEN** it finds: input is `outline.md` + `research.md`, output is `content.md` following engagement rules

#### Scenario: Reviewer contract

- **WHEN** the agent reads the reviewer role contract
- **THEN** it finds: input is all 4 artifacts, output is review comments with engagement score assessment and violation list

#### Scenario: Handoff documentation required

- **WHEN** the agent reads the role contracts
- **THEN** each role requires documenting handoff in Agent Contributions: "Received [files] from [role], produced [file]"


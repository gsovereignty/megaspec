# Proposal: add-topic-sentence

## Why

DF-055 (topic sentence validation) has been a P2 stub since the initial core-commands implementation. It is the last single-rule gap in the readability validation category (DF-050–DF-055). Implementing it completes the readability rule set and improves scanability feedback for authors.

## What Changes

Replace the DF-055 stub with a working heuristic that checks whether each paragraph's dominant keyword appears in its first sentence. The implementation uses simple word-frequency analysis with a stopword list — no external NLP dependencies required.

## Requirements

- **DF-055**: Topic sentence frontloading — WARN when a paragraph's dominant non-stopword keyword first appears in sentence 2 or later.

## Affected Specs

- **validation-engine** (modified): Add scenario for topic sentence validation.

## Scope

- Modified: `src/validators/rules.ts` (replace stub with implementation)
- New tests in `test/validators.test.ts` (fixture tests for DF-055)
- No new dependencies, no new files, no API changes

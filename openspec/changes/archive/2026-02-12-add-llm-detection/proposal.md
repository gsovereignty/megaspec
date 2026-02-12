# Proposal: add-llm-detection

## Summary

Add LLM artifact detection and stripping capabilities to DocFlow. This introduces a curated dictionary of LLM writing telltales (backed by peer-reviewed research), a validation rule to detect them, a `--strip-llm` flag to auto-clean documents, and integration into all validation profiles and the publish advisory flow.

## Motivation

When agents produce documentation, the output often contains telltale signs of LLM-generated writing — overused words like "delve", "tapestry", "landscape"; typographic artifacts like em dashes and decorative emoji; filler phrases like "It's worth noting that"; and formulaic sentence openers like "Furthermore," and "Moreover,". These markers reduce reader trust and make content feel generic.

Research by Kobak et al. (2024, *Science Advances*) identified 379 style words with statistically elevated usage in post-ChatGPT scientific writing, providing a rigorous empirical basis for detection. DocFlow should detect and help authors remove these artifacts as part of the validation workflow.

## Requirements

- **DF-090**: Curated LLM artifact dictionary (4 categories: words, typography, phrases, structural patterns)
- **DF-091**: `scan-llm-artifacts` validation rule (WARN severity, line-level diagnostics with replacements)
- **DF-092**: `--strip-llm` flag on validate command (auto-clean output)
- **DF-093**: Profile integration + publish advisory (non-blocking)

## Affected Specs

- **validation-engine** (modified): Add `llm-artifacts` rule to all profiles
- **core-commands** (modified): Add `--strip-llm` flag to validate command

## Scope

- New module: `src/validators/llm-artifacts.ts` (dictionary + scanner)
- Modified: `src/validators/rules.ts` (register new rule)
- Modified: `src/validators/profiles.ts` (add to all profiles)
- Modified: `src/commands/validate.ts` (add `--strip-llm` flag)
- Modified: `src/commands/publish.ts` (add advisory)
- New tests: unit tests for scanner, fixture tests for rule, integration tests for CLI flags

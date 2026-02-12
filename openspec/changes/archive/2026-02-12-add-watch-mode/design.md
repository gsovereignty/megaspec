## Context
Writers using DocFlow currently run `docflow validate` manually after each edit. Watch mode eliminates this friction by automatically re-running validation when files change.

## Goals / Non-Goals
- Goals: Live validation feedback on file save, clear console between runs, support all existing validate flags alongside `--watch`, show engagement score deltas
- Non-Goals: Hot-reload of custom rules, browser-based dashboard, LSP/editor integration (future work), watching publish/ or archive/ directories

## Decisions
- **File watching**: Use Node.js built-in `fs.watch` with `{ recursive: true }` (available since Node 19.1, stable in Node 20+). Avoids adding `chokidar` as a dependency. The project already requires Node >=18, but `recursive` support on all platforms is solid from Node 20. We'll document the Node 20+ recommendation.
- **Alternatives considered**: chokidar (mature, cross-platform, but adds 15+ transitive dependencies for a feature that Node.js now handles natively). Decision: prefer built-in.
- **Debouncing**: Debounce file change events with a 300ms delay to avoid duplicate runs when editors write temp files or trigger multiple change events per save.
- **Output strategy**: Clear terminal with ANSI escape codes (`\x1Bc`) before each re-run. In `--json` mode, emit newline-delimited JSON objects (one per run) without clearing.
- **Score deltas**: When `--engagement-report` is combined with `--watch`, cache the previous run's scores and display the delta (e.g., `clarity: 72 → 78 (+6)`). This requires minimal state — just the last engagement result.
- **Signal handling**: Register SIGINT handler to print a summary line and exit cleanly.
- **Scope of watch**: If a specific file is passed, watch that file only. If no file is passed, watch all `drafts/` recursively for `*.md` changes.

## Risks / Trade-offs
- `fs.watch` behavior varies slightly across platforms (macOS uses FSEvents, Linux uses inotify). Risk is low for Markdown files. Mitigation: debounce handles duplicate events.
- Watching large draft directories could produce noise. Mitigation: only trigger on `.md` file changes.
- `--watch` combined with `--strip-llm` is unusual — we'll run strip-llm on each change and output to stdout each time. Document that `--strip-llm --watch` is supported but verbose.

## Open Questions
- None — straightforward feature.

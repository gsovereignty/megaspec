import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseMarkdown } from '../utils/markdown.js';
import type { ContentType } from '../utils/front-matter.js';
import type { ValidationContext, Diagnostic, Severity } from '../validators/types.js';
import { getProfile } from '../validators/profiles.js';
import { executeProfile } from '../validators/registry.js';
import { computeEngagementScore, type EngagementScore, type ScoringContext } from '../scoring/engagement.js';
import { scanLlmArtifacts, stripLlmArtifacts } from '../validators/llm-artifacts.js';
// Side-effect import: registers all rules
import '../validators/rules.js';
import { output, outputError, type OutputContext } from '../utils/output-context.js';

export interface ValidateResult {
  slug: string;
  contentType: string;
  diagnostics: Diagnostic[];
  pass: number;
  warn: number;
  fail: number;
  passed: boolean;
}

export function validateFile(
  filePath: string,
  projectDir: string,
  strict: boolean = false,
): ValidateResult {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return validateContent(raw, filePath, projectDir, strict);
}

/**
 * Validate raw markdown content without reading from a file.
 * Used by publish to validate content after stripping Agent Contributions.
 */
export function validateContent(
  raw: string,
  filePath: string,
  projectDir: string,
  strict: boolean = false,
): ValidateResult {
  const parsed = parseMarkdown(raw);

  const contentType = (parsed.frontMatter.type as ContentType) || 'guide';
  const slug = (parsed.frontMatter.id as string) || path.basename(filePath, '.md');

  const profile = getProfile(contentType);

  const ctx: ValidationContext = {
    ast: parsed.ast,
    content: parsed.content,
    rawContent: raw,
    frontMatter: parsed.frontMatter,
    contentType,
    projectDir,
    slug,
    filePath,
  };

  const diagnostics = executeProfile(profile, ctx, strict);

  const pass = diagnostics.filter((d) => d.severity === 'PASS').length;
  const warn = diagnostics.filter((d) => d.severity === 'WARN').length;
  const fail = diagnostics.filter((d) => d.severity === 'FAIL').length;

  return {
    slug,
    contentType,
    diagnostics,
    pass,
    warn,
    fail,
    passed: fail === 0,
  };
}

function formatDiagnostic(d: Diagnostic): string {
  const icon = d.severity === 'FAIL' ? '✗' : d.severity === 'WARN' ? '⚠' : '✓';
  const line = d.line > 0 ? `:${d.line}` : '';
  const research = d.research ? ` [${d.research}]` : '';
  return `  ${icon} ${d.ruleId}${line} ${d.message}${research}`;
}

const ENGAGEMENT_LABELS: Record<string, { high: string; mid: string; low: string }> = {
  curiosity: {
    high: 'Strong opening and information gaps',
    mid: 'Adequate hooks present',
    low: 'Needs stronger opening or questions',
  },
  clarity: {
    high: 'Clear structure and language',
    mid: 'Mostly clear, some dense sections',
    low: 'Needs simpler language or structure',
  },
  action: {
    high: 'Rich examples and exercises',
    mid: 'Some actionable content',
    low: 'Needs more examples or exercises',
  },
  flow: {
    high: 'Smooth transitions and pacing',
    mid: 'Adequate flow with minor gaps',
    low: 'Needs better transitions',
  },
  voice: {
    high: 'Strong reader focus, active voice',
    mid: 'Adequate voice and focus',
    low: 'Needs more reader-focused language',
  },
};

function getEngagementLabel(dimension: string, score: number): string {
  const labels = ENGAGEMENT_LABELS[dimension];
  if (!labels) return '';
  if (score >= 80) return labels.high;
  if (score >= 60) return labels.mid;
  return labels.low;
}

/**
 * Compute engagement score deltas between two runs.
 */
export function computeEngagementDeltas(
  current: EngagementScore,
  previous: EngagementScore,
): Record<string, number> {
  const deltas: Record<string, number> = {};
  for (const key of Object.keys(current.dimensions) as Array<keyof typeof current.dimensions>) {
    deltas[key] = current.dimensions[key].score - previous.dimensions[key].score;
  }
  deltas['total'] = current.total - previous.total;
  return deltas;
}

function formatDelta(delta: number): string {
  if (delta > 0) return ` (+${delta})`;
  if (delta < 0) return ` (${delta})`;
  return '';
}

/**
 * Resolve the target file to validate. Returns the absolute path or undefined on error.
 */
export function resolveValidationTarget(
  file: string | undefined,
  ctx: OutputContext,
): string | undefined {
  if (file) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) {
      outputError(ctx, `File not found: ${resolved}`, { error: 'file_not_found', file: resolved });
      return undefined;
    }
    return resolved;
  }

  const candidates = [
    'content.md',
    path.join('drafts', '**', 'content.md'),
  ];
  const found = candidates.find((c) => fs.existsSync(path.resolve(c)));
  if (!found) {
    outputError(
      ctx,
      'No file specified and no content.md found. Usage: docflow validate <file>',
      { error: 'no_file' },
    );
    return undefined;
  }
  return path.resolve(found);
}

export interface RunValidationOpts {
  strict: boolean;
  rule?: string;
  engagementReport: boolean;
  stripLlm: boolean;
}

export interface RunValidationResult {
  result: ValidateResult;
  engagement?: EngagementScore;
}

/**
 * Run a single validation pass on the given file. Returns result + optional engagement scores.
 * Does NOT produce any output — caller is responsible for display.
 */
export function runValidation(
  targetFile: string,
  projectDir: string,
  opts: RunValidationOpts,
): RunValidationResult {
  const result = validateFile(targetFile, projectDir, opts.strict);

  // Filter by rule if specified
  if (opts.rule) {
    result.diagnostics = result.diagnostics.filter((d) => d.ruleId === opts.rule);
    result.pass = result.diagnostics.filter((d) => d.severity === 'PASS').length;
    result.warn = result.diagnostics.filter((d) => d.severity === 'WARN').length;
    result.fail = result.diagnostics.filter((d) => d.severity === 'FAIL').length;
    result.passed = result.fail === 0;
  }

  let engagement: EngagementScore | undefined;
  if (opts.engagementReport) {
    const raw = fs.readFileSync(targetFile, 'utf-8');
    const parsed = parseMarkdown(raw);
    const contentType = (parsed.frontMatter.type as ContentType) || 'guide';
    const scoringCtx: ScoringContext = {
      ast: parsed.ast,
      content: parsed.content,
      contentType,
    };
    engagement = computeEngagementScore(scoringCtx);
  }

  return { result, engagement };
}

/**
 * Format and output validation results for a single run.
 */
function outputValidationResult(
  ctx: OutputContext,
  targetFile: string,
  projectDir: string,
  { result, engagement }: RunValidationResult,
  opts: RunValidationOpts,
  previousEngagement?: EngagementScore,
): void {
  // Handle --strip-llm
  if (opts.stripLlm) {
    const raw = fs.readFileSync(targetFile, 'utf-8');
    const { cleaned, replacements } = stripLlmArtifacts(raw);

    if (ctx.json) {
      output(ctx, '', { success: true, cleaned, replacements, ...result, ...(engagement ? { engagement } : {}) });
    } else {
      output(ctx, cleaned, { cleaned, replacements });
      if (replacements > 0) {
        outputError(ctx, `\n${replacements} LLM artifact(s) replaced.`, { replacements });
      }
    }
    return;
  }

  if (ctx.json) {
    output(ctx, '', { success: true, ...result, ...(engagement ? { engagement } : {}) });
    return;
  }

  // Human output
  const lines: string[] = [];
  lines.push(`Validating: ${path.relative(projectDir, targetFile)}`);
  lines.push(`Profile:    ${result.contentType}`);
  lines.push('');

  if (result.diagnostics.length === 0) {
    lines.push('✓ All checks passed.');
  } else {
    const fails = result.diagnostics.filter((d) => d.severity === 'FAIL');
    const warns = result.diagnostics.filter((d) => d.severity === 'WARN');

    if (fails.length > 0) {
      lines.push(`Errors (${fails.length}):`);
      fails.forEach((d) => lines.push(formatDiagnostic(d)));
      lines.push('');
    }
    if (warns.length > 0) {
      lines.push(`Warnings (${warns.length}):`);
      warns.forEach((d) => lines.push(formatDiagnostic(d)));
      lines.push('');
    }

    lines.push(`Result: ${result.fail} errors, ${result.warn} warnings`);
    lines.push(result.passed ? '✓ Validation passed' : '✗ Validation failed');
  }

  if (engagement) {
    const deltas = previousEngagement ? computeEngagementDeltas(engagement, previousEngagement) : undefined;
    lines.push('');
    lines.push('Engagement Report:');
    for (const [key, dim] of Object.entries(engagement.dimensions)) {
      const label = getEngagementLabel(key, dim.score);
      if (deltas && previousEngagement) {
        const prev = previousEngagement.dimensions[key as keyof typeof previousEngagement.dimensions].score;
        const delta = deltas[key];
        if (delta !== 0) {
          lines.push(`  ${dim.label.padEnd(12)} ${prev} → ${dim.score}/100${formatDelta(delta)} — ${label}`);
        } else {
          lines.push(`  ${dim.label.padEnd(12)} ${dim.score}/100 — ${label}`);
        }
      } else {
        lines.push(`  ${dim.label.padEnd(12)} ${dim.score}/100 — ${label}`);
      }
    }
    lines.push('  ' + '─'.repeat(30));
    if (deltas) {
      const totalDelta = deltas['total'];
      if (totalDelta !== 0) {
        const prevTotal = previousEngagement!.total;
        lines.push(`  ${'Total'.padEnd(12)} ${prevTotal} → ${engagement.total}/100${formatDelta(totalDelta)}`);
      } else {
        lines.push(`  ${'Total'.padEnd(12)} ${engagement.total}/100`);
      }
    } else {
      lines.push(`  ${'Total'.padEnd(12)} ${engagement.total}/100`);
    }
  }

  output(ctx, lines.join('\n'), { ...result, ...(engagement ? { engagement } : {}) });
}

const WATCH_DEBOUNCE_MS = 300;

/**
 * Start watching for file changes and re-running validation.
 */
function startWatchMode(
  targetFile: string | undefined,
  file: string | undefined,
  projectDir: string,
  opts: RunValidationOpts,
  ctx: OutputContext,
): void {
  let previousEngagement: EngagementScore | undefined;
  let runNumber = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const doRun = (fileToValidate: string) => {
    runNumber++;
    try {
      // Clear terminal in human mode
      if (!ctx.json) {
        process.stdout.write('\x1Bc');
        process.stdout.write(`[Watch] Run #${runNumber} — ${new Date().toLocaleTimeString()}\n\n`);
      }

      const runResult = runValidation(fileToValidate, projectDir, opts);

      if (ctx.json) {
        // NDJSON mode: emit one JSON object per run
        const jsonData = {
          success: true,
          runNumber,
          ...runResult.result,
          ...(runResult.engagement ? { engagement: runResult.engagement } : {}),
        };
        if (opts.stripLlm) {
          const raw = fs.readFileSync(fileToValidate, 'utf-8');
          const { cleaned, replacements } = stripLlmArtifacts(raw);
          Object.assign(jsonData, { cleaned, replacements });
        }
        process.stdout.write(JSON.stringify(jsonData) + '\n');
      } else {
        outputValidationResult(ctx, fileToValidate, projectDir, runResult, opts, previousEngagement);
      }

      previousEngagement = runResult.engagement;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      outputError(ctx, `Validation error: ${message}`, { error: 'validation_error', message });
    }
  };

  // Determine what to watch
  let watchPath: string;
  let watchOpts: fs.WatchOptions;

  if (targetFile) {
    // Watch the specific file's directory and filter by filename
    watchPath = path.dirname(targetFile);
    watchOpts = {};
  } else {
    // Watch all drafts recursively
    const draftsDir = path.join(projectDir, 'drafts');
    if (!fs.existsSync(draftsDir)) {
      fs.mkdirSync(draftsDir, { recursive: true });
    }
    watchPath = draftsDir;
    watchOpts = { recursive: true };
  }

  // Initial run
  if (targetFile) {
    doRun(targetFile);
  } else {
    if (!ctx.json) {
      process.stdout.write('[Watch] Watching drafts/ for changes...\n');
    }
  }

  const watcher = fs.watch(watchPath, watchOpts, (eventType, filename) => {
    if (!filename) return;
    const name = String(filename);
    // Only react to .md files
    if (!name.endsWith('.md')) return;

    // If watching a specific file, only react to that file
    if (targetFile && path.resolve(watchPath, name) !== targetFile) return;

    // Debounce
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const fileToValidate = targetFile || path.resolve(watchPath, name);
      if (fs.existsSync(fileToValidate)) {
        doRun(fileToValidate);
      }
    }, WATCH_DEBOUNCE_MS);
  });

  // Handle SIGINT for clean shutdown
  const cleanup = () => {
    watcher.close();
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!ctx.json) {
      process.stdout.write(`\n[Watch] Stopped after ${runNumber} run(s).\n`);
    }
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Keep process alive
  watcher.on('error', (err) => {
    outputError(ctx, `Watch error: ${err.message}`, { error: 'watch_error', message: err.message });
    cleanup();
  });
}

export function registerValidateCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('validate [file]')
    .description('Validate a document against its content-type profile')
    .option('-s, --strict', 'Treat warnings as errors', false)
    .option('-r, --rule <ruleId>', 'Run only a specific rule')
    .option('-e, --engagement-report', 'Include engagement score report', false)
    .option('--strip-llm', 'Detect and strip LLM writing artifacts, output cleaned content', false)
    .option('-w, --watch', 'Watch for file changes and re-run validation', false)
    .action((file: string | undefined, opts) => {
      const ctx = getCtx();
      const projectDir = process.cwd();

      const validationOpts: RunValidationOpts = {
        strict: opts.strict,
        rule: opts.rule,
        engagementReport: opts.engagementReport,
        stripLlm: opts.stripLlm,
      };

      // Resolve target file (may be undefined for watch-all-drafts mode)
      const targetFile = resolveValidationTarget(file, ctx);

      if (opts.watch) {
        // Watch mode: targetFile can be undefined (watch all drafts)
        if (!targetFile && !file) {
          // No specific file — watch all drafts
          startWatchMode(undefined, file, projectDir, validationOpts, ctx);
        } else if (!targetFile) {
          // File was specified but not found
          process.exitCode = 1;
          return;
        } else {
          startWatchMode(targetFile, file, projectDir, validationOpts, ctx);
        }
        return;
      }

      // Non-watch mode: targetFile is required
      if (!targetFile) {
        process.exitCode = 1;
        return;
      }

      try {
        const runResult = runValidation(targetFile, projectDir, validationOpts);

        outputValidationResult(ctx, targetFile, projectDir, runResult, validationOpts);

        if (!runResult.result.passed) {
          process.exitCode = 1;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        outputError(ctx, `Validation error: ${message}`, { error: 'validation_error', message });
        process.exitCode = 1;
      }
    });
}

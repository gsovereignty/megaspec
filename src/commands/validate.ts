import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseMarkdown } from '../utils/markdown.js';
import type { ContentType } from '../utils/front-matter.js';
import type { ValidationContext, Diagnostic, Severity } from '../validators/types.js';
import { getProfile } from '../validators/profiles.js';
import { executeProfile } from '../validators/registry.js';
import { computeEngagementScore, type ScoringContext } from '../scoring/engagement.js';
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
    .action((file: string | undefined, opts) => {
      const ctx = getCtx();
      const projectDir = process.cwd();

      // Find file to validate
      let targetFile: string;
      if (file) {
        targetFile = path.resolve(file);
      } else {
        // Look for content.md in current dir or drafts
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
          process.exitCode = 1;
          return;
        }
        targetFile = path.resolve(found);
      }

      if (!fs.existsSync(targetFile)) {
        outputError(ctx, `File not found: ${targetFile}`, { error: 'file_not_found', file: targetFile });
        process.exitCode = 1;
        return;
      }

      try {
        const result = validateFile(targetFile, projectDir, opts.strict);

        // Filter by rule if specified
        if (opts.rule) {
          result.diagnostics = result.diagnostics.filter((d) => d.ruleId === opts.rule);
          result.pass = result.diagnostics.filter((d) => d.severity === 'PASS').length;
          result.warn = result.diagnostics.filter((d) => d.severity === 'WARN').length;
          result.fail = result.diagnostics.filter((d) => d.severity === 'FAIL').length;
          result.passed = result.fail === 0;
        }

        // Compute engagement scores if requested
        let engagement: ReturnType<typeof computeEngagementScore> | undefined;
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

        // Handle --strip-llm: strip LLM artifacts and output cleaned content
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
          if (!result.passed) {
            process.exitCode = 1;
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
          // Group by severity
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
          lines.push('');
          lines.push('Engagement Report:');
          for (const [key, dim] of Object.entries(engagement.dimensions)) {
            const label = getEngagementLabel(key, dim.score);
            lines.push(`  ${dim.label.padEnd(12)} ${dim.score}/100 — ${label}`);
          }
          lines.push('  ' + '─'.repeat(30));
          lines.push(`  ${'Total'.padEnd(12)} ${engagement.total}/100`);
        }

        output(ctx, lines.join('\n'), { ...result, ...(engagement ? { engagement } : {}) });

        if (!result.passed) {
          process.exitCode = 1;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        outputError(ctx, `Validation error: ${message}`, { error: 'validation_error', message });
        process.exitCode = 1;
      }
    });
}

import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseMarkdown } from '../utils/markdown.js';
import type { ContentType } from '../utils/front-matter.js';
import { computeEngagementScore, type ScoringContext } from '../scoring/engagement.js';
import { output, outputError, type OutputContext } from '../utils/output-context.js';

function scoreBar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export function registerMetricsCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('metrics <file>')
    .description('Compute engagement score for a document')
    .action((file: string) => {
      const ctx = getCtx();

      const filePath = path.resolve(file);
      if (!fs.existsSync(filePath)) {
        outputError(ctx, `File not found: ${filePath}`, { error: 'file_not_found', file: filePath });
        process.exitCode = 1;
        return;
      }

      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = parseMarkdown(raw);

        const contentType = (parsed.frontMatter.type as ContentType) || 'guide';

        const scoringCtx: ScoringContext = {
          ast: parsed.ast,
          content: parsed.content,
          contentType,
        };

        const score = computeEngagementScore(scoringCtx);

        if (ctx.json) {
          output(ctx, '', { success: true, file: path.relative(process.cwd(), filePath), ...score });
          return;
        }

        const lines: string[] = [];
        lines.push(`Engagement Score: ${path.relative(process.cwd(), filePath)}`);
        lines.push('');
        lines.push(`  Total:     ${scoreBar(score.total)} ${score.total}/100`);
        lines.push('');
        lines.push('  Dimensions:');
        for (const [key, dim] of Object.entries(score.dimensions)) {
          lines.push(`    ${dim.label.padEnd(12)} ${scoreBar(dim.score, 15)} ${dim.score}/100`);
          lines.push(`                 ${dim.details}`);
        }

        output(ctx, lines.join('\n'), score);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        outputError(ctx, `Metrics error: ${message}`, { error: 'metrics_error', message });
        process.exitCode = 1;
      }
    });
}

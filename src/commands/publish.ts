import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseMarkdown } from '../utils/markdown.js';
import { resolveCrossReferences } from '../utils/cross-references.js';
import { validateFile } from './validate.js';
import { output, outputError, type OutputContext } from '../utils/output-context.js';

export function registerPublishCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('publish <slug>')
    .description('Publish a draft document to publish/')
    .option('-s, --strict', 'Require zero warnings to publish', false)
    .option('--skip-validation', 'Skip validation before publishing', false)
    .action((slug: string, opts) => {
      const ctx = getCtx();
      const projectDir = process.cwd();

      const draftDir = path.join(projectDir, 'drafts', slug);
      const contentPath = path.join(draftDir, 'content.md');

      if (!fs.existsSync(contentPath)) {
        outputError(ctx, `Draft "${slug}" not found at ${draftDir}`, { error: 'draft_not_found', slug });
        process.exitCode = 1;
        return;
      }

      // Validate unless skipped
      if (!opts.skipValidation) {
        const result = validateFile(contentPath, projectDir, opts.strict);
        if (!result.passed) {
          const failCount = result.fail;
          outputError(
            ctx,
            `Validation failed with ${failCount} error(s). Fix issues or use --skip-validation.`,
            { error: 'validation_failed', diagnostics: result.diagnostics },
          );
          process.exitCode = 1;
          return;
        }
      }

      // Read content and resolve cross-references
      const raw = fs.readFileSync(contentPath, 'utf-8');
      const resolved = resolveCrossReferences(raw, projectDir);

      // Ensure publish/ exists
      const publishDir = path.join(projectDir, 'publish');
      if (!fs.existsSync(publishDir)) {
        fs.mkdirSync(publishDir, { recursive: true });
      }

      // Write to publish/ (flat — DF-029)
      const publishPath = path.join(publishDir, `${slug}.md`);
      fs.writeFileSync(publishPath, resolved, 'utf-8');

      // Add published_at to front matter if not present
      const parsed = parseMarkdown(resolved);
      if (!parsed.frontMatter.published_at) {
        const now = new Date().toISOString();
        const updated = resolved.replace(
          /^---\n/,
          `---\npublished_at: "${now}"\n`,
        );
        fs.writeFileSync(publishPath, updated, 'utf-8');
      }

      const relPath = path.relative(projectDir, publishPath);
      output(ctx, `✓ Published "${slug}" to ${relPath}`, {
        success: true,
        slug,
        path: relPath,
      });
    });
}

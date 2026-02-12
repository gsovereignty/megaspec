import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseMarkdown, stripAgentContributions } from '../utils/markdown.js';
import { resolveCrossReferences } from '../utils/cross-references.js';
import { validateContent } from './validate.js';
import { checkHumanReview, scanUnknowns } from '../utils/human-review.js';
import { scanLlmArtifacts } from '../validators/llm-artifacts.js';
import { output, outputError, type OutputContext } from '../utils/output-context.js';

export function registerPublishCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('publish <slug>')
    .description('Publish a draft document to publish/')
    .action((slug: string) => {
      const ctx = getCtx();
      const projectDir = process.cwd();

      // 1. Verify drafts/<slug>/ exists with content.md
      const draftDir = path.join(projectDir, 'drafts', slug);
      const contentPath = path.join(draftDir, 'content.md');

      if (!fs.existsSync(contentPath)) {
        outputError(ctx, `Draft "${slug}" not found at ${draftDir}`, { error: 'draft_not_found', slug });
        process.exitCode = 1;
        return;
      }

      // 2. Read content and strip Agent Contributions (internal metadata)
      const raw = fs.readFileSync(contentPath, 'utf-8');
      const stripped = stripAgentContributions(raw);

      // 3. Validate stripped content — always strict, no bypass (DF-082)
      const result = validateContent(stripped, contentPath, projectDir, true);
      if (!result.passed) {
        outputError(
          ctx,
          `Validation failed with ${result.fail} error(s). Fix all issues before publishing.`,
          { error: 'validation_failed', diagnostics: result.diagnostics },
        );
        process.exitCode = 1;
        return;
      }

      // 4. Parse Human Review section from checklist.md (DF-080)
      const review = checkHumanReview(projectDir, slug);
      if (!review.ok || !review.data) {
        outputError(ctx, `Human review gate failed: ${review.error}`, {
          error: 'human_review_missing',
          slug,
          detail: review.error,
        });
        process.exitCode = 1;
        return;
      }

      if (review.data.status !== 'approved') {
        outputError(
          ctx,
          `Human review status is "${review.data.status}". Only "approved" documents can be published.`,
          { error: 'human_review_not_approved', slug, status: review.data.status },
        );
        process.exitCode = 1;
        return;
      }

      // 5. Scan for unacknowledged unknowns (DF-081)
      const unknowns = scanUnknowns(projectDir, slug);
      if (unknowns.hasUnknowns && !review.data.acknowledgedUnknowns) {
        outputError(
          ctx,
          `Unacknowledged unknowns found in: ${unknowns.files.join(', ')}. ` +
            `Add "acknowledged_unknowns: true" to the Human Review section or resolve the unknowns.`,
          { error: 'unacknowledged_unknowns', slug, files: unknowns.files },
        );
        process.exitCode = 1;
        return;
      }

      // 6. Resolve {{doc:slug}} cross-references
      const resolved = resolveCrossReferences(stripped, projectDir);

      // 6a. LLM artifact advisory (DF-093) — informational only, non-blocking
      const llmMatches = scanLlmArtifacts(stripped);
      let llmAdvisory: string | undefined;
      if (llmMatches.length > 0) {
        llmAdvisory = `Advisory: ${llmMatches.length} LLM artifact(s) detected. Consider running 'docflow validate --strip-llm' to review.`;
        if (!ctx.json) {
          output(ctx, llmAdvisory, { llmArtifacts: llmMatches.length });
        }
      }

      // 7. Add published_at timestamp to front matter
      const parsed = parseMarkdown(resolved);
      let finalContent = resolved;
      if (!parsed.frontMatter.published_at) {
        const now = new Date().toISOString();
        finalContent = resolved.replace(
          /^---\n/,
          `---\npublished_at: "${now}"\n`,
        );
      }

      // 8. Write clean file to publish/<slug>.md (flat — DF-029)
      const publishDir = path.join(projectDir, 'publish');
      if (!fs.existsSync(publishDir)) {
        fs.mkdirSync(publishDir, { recursive: true });
      }

      const publishPath = path.join(publishDir, `${slug}.md`);
      fs.writeFileSync(publishPath, finalContent, 'utf-8');

      const relPath = path.relative(projectDir, publishPath);
      output(ctx, `✓ Published "${slug}" to ${relPath}`, {
        success: true,
        slug,
        path: relPath,
        reviewer: review.data.reviewer,
        ...(llmMatches.length > 0 ? { llmArtifacts: llmMatches.length, llmAdvisory } : {}),
      });
    });
}

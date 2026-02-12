import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { output, outputError, type OutputContext } from '../utils/output-context.js';

export function registerArchiveCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('archive <slug>')
    .description('Move a published document to archive/')
    .option('--reason <reason>', 'Reason for archiving')
    .action((slug: string, opts) => {
      const ctx = getCtx();
      const projectDir = process.cwd();

      // Archive only from publish/ (drafts must be published first)
      const publishPath = path.join(projectDir, 'publish', `${slug}.md`);

      if (!fs.existsSync(publishPath)) {
        outputError(ctx, `Document "${slug}" not found in publish/. Only published documents can be archived.`, {
          error: 'not_found',
          slug,
        });
        process.exitCode = 1;
        return;
      }

      // Read current content
      const raw = fs.readFileSync(publishPath, 'utf-8');
      const { data, content } = matter(raw);

      // Add archive metadata
      data.archived_at = new Date().toISOString();
      if (opts.reason) {
        data.archive_reason = opts.reason;
      }

      // Reconstruct with updated front matter
      const updatedContent = matter.stringify(content, data);

      // Ensure archive/ exists
      const archiveDir = path.join(projectDir, 'archive');
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      // Date-prefixed filename: YYYY-MM-DD-slug.md
      const datePrefix = new Date().toISOString().slice(0, 10);
      const archiveFilename = `${datePrefix}-${slug}.md`;
      const archivePath = path.join(archiveDir, archiveFilename);
      fs.writeFileSync(archivePath, updatedContent, 'utf-8');

      // Remove published file
      fs.unlinkSync(publishPath);

      // Also move drafts/<slug>/ to archive/<date>-<slug>/ if it exists
      const draftDir = path.join(projectDir, 'drafts', slug);
      if (fs.existsSync(draftDir)) {
        const archiveDraftDir = path.join(archiveDir, `${datePrefix}-${slug}`);
        fs.renameSync(draftDir, archiveDraftDir);
      }

      const relPath = path.relative(projectDir, archivePath);
      output(ctx, `✓ Archived "${slug}" to ${relPath}${opts.reason ? ` (reason: ${opts.reason})` : ''}`, {
        success: true,
        slug,
        path: relPath,
        reason: opts.reason ?? null,
      });
    });
}

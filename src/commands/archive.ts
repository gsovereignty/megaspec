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

      const publishPath = path.join(projectDir, 'publish', `${slug}.md`);
      const draftDir = path.join(projectDir, 'drafts', slug);

      // Find the source file
      let sourcePath: string | null = null;
      let sourceLocation: string = '';

      if (fs.existsSync(publishPath)) {
        sourcePath = publishPath;
        sourceLocation = 'publish';
      } else if (fs.existsSync(path.join(draftDir, 'content.md'))) {
        sourcePath = path.join(draftDir, 'content.md');
        sourceLocation = 'drafts';
      }

      if (!sourcePath) {
        outputError(ctx, `Document "${slug}" not found in publish/ or drafts/`, {
          error: 'not_found',
          slug,
        });
        process.exitCode = 1;
        return;
      }

      // Read current content
      const raw = fs.readFileSync(sourcePath, 'utf-8');
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

      // Write to archive (flat)
      const archivePath = path.join(archiveDir, `${slug}.md`);
      fs.writeFileSync(archivePath, updatedContent, 'utf-8');

      // Remove from source location
      if (sourceLocation === 'publish') {
        fs.unlinkSync(publishPath);
      } else if (sourceLocation === 'drafts') {
        // Remove entire draft directory
        fs.rmSync(draftDir, { recursive: true, force: true });
      }

      const relPath = path.relative(projectDir, archivePath);
      output(ctx, `✓ Archived "${slug}" to ${relPath}${opts.reason ? ` (reason: ${opts.reason})` : ''}`, {
        success: true,
        slug,
        from: sourceLocation,
        path: relPath,
        reason: opts.reason ?? null,
      });
    });
}

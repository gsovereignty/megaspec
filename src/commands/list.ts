import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { output, outputError, type OutputContext } from '../utils/output-context.js';
import { parseMarkdown, countWords } from '../utils/markdown.js';
import { computeEngagementScore, type ScoringContext } from '../scoring/engagement.js';
import type { ContentType } from '../utils/front-matter.js';

interface DocumentInfo {
  id: string;
  slug: string;
  title: string;
  type: string;
  audience: string;
  location: 'drafts' | 'publish' | 'archive';
  path: string;
}

function findDocuments(projectDir: string): DocumentInfo[] {
  const docs: DocumentInfo[] = [];

  const locations: Array<{ dir: string; location: DocumentInfo['location'] }> = [
    { dir: path.join(projectDir, 'publish'), location: 'publish' },
    { dir: path.join(projectDir, 'archive'), location: 'archive' },
    { dir: path.join(projectDir, 'drafts'), location: 'drafts' },
  ];

  for (const { dir, location } of locations) {
    if (!fs.existsSync(dir)) continue;

    if (location === 'drafts') {
      // Drafts are directories containing content.md
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const contentPath = path.join(dir, entry.name, 'content.md');
        if (!fs.existsSync(contentPath)) continue;

        try {
          const raw = fs.readFileSync(contentPath, 'utf-8');
          const { data } = matter(raw);
          docs.push({
            id: (data.id as string) || entry.name,
            slug: entry.name,
            title: (data.title as string) || entry.name,
            type: (data.type as string) || 'unknown',
            audience: (data.audience as string) || 'unknown',
            location,
            path: contentPath,
          });
        } catch {
          docs.push({
            id: entry.name,
            slug: entry.name,
            title: entry.name,
            type: 'unknown',
            audience: 'unknown',
            location,
            path: contentPath,
          });
        }
      }
    } else {
      // Publish and archive are flat directories with .md files
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
        const filePath = path.join(dir, entry.name);
        const slug = entry.name.replace(/\.md$/, '');

        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter(raw);
          docs.push({
            id: (data.id as string) || slug,
            slug,
            title: (data.title as string) || slug,
            type: (data.type as string) || 'unknown',
            audience: (data.audience as string) || 'unknown',
            location,
            path: filePath,
          });
        } catch {
          docs.push({
            id: slug,
            slug,
            title: slug,
            type: 'unknown',
            audience: 'unknown',
            location,
            path: filePath,
          });
        }
      }
    }
  }

  return docs;
}

export function registerListCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('list')
    .description('List all documents in the project')
    .option('-t, --type <type>', 'Filter by content type')
    .option('-l, --location <location>', 'Filter by location (drafts, publish, archive)')
    .option('-p, --publish', 'Show published documents with ID, title, audience, and reading time')
    .action((opts) => {
      const ctx = getCtx();
      const projectDir = process.cwd();

      let docs = findDocuments(projectDir);

      if (opts.publish) {
        docs = docs.filter((d) => d.location === 'publish');
      } else {
        if (opts.type) {
          docs = docs.filter((d) => d.type === opts.type);
        }
        if (opts.location) {
          docs = docs.filter((d) => d.location === opts.location);
        }
      }

      if (opts.publish) {
        // Compute reading time for each document
        const publishDocs = docs.map((d) => {
          const raw = fs.readFileSync(d.path, 'utf-8');
          const wc = countWords(raw);
          const readingTime = Math.ceil(wc / 200);
          return { ...d, readingTime };
        });

        if (ctx.json) {
          output(ctx, '', { success: true, documents: publishDocs, count: publishDocs.length });
          return;
        }

        if (publishDocs.length === 0) {
          output(ctx, 'No published documents found.', { documents: [], count: 0 });
          return;
        }

        const header = `${'ID'.padEnd(20)} ${'TITLE'.padEnd(30)} ${'AUDIENCE'.padEnd(14)} ${'READING TIME'.padEnd(12)}`;
        const separator = '-'.repeat(header.length);
        const rows = publishDocs.map(
          (d) =>
            `${d.id.padEnd(20)} ${d.title.padEnd(30)} ${d.audience.padEnd(14)} ${`~${d.readingTime} min`.padEnd(12)}`,
        );

        output(ctx, [header, separator, ...rows].join('\n'), { documents: publishDocs, count: publishDocs.length });
        return;
      }

      if (ctx.json) {
        output(ctx, '', { success: true, documents: docs, count: docs.length });
        return;
      }

      if (docs.length === 0) {
        output(ctx, 'No documents found.', { documents: [], count: 0 });
        return;
      }

      const header = `${'SLUG'.padEnd(30)} ${'TYPE'.padEnd(12)} ${'AUDIENCE'.padEnd(14)} ${'LOCATION'.padEnd(10)}`;
      const separator = '-'.repeat(header.length);
      const rows = docs.map(
        (d) =>
          `${d.slug.padEnd(30)} ${d.type.padEnd(12)} ${d.audience.padEnd(14)} ${d.location.padEnd(10)}`,
      );

      output(ctx, [header, separator, ...rows].join('\n'), { documents: docs, count: docs.length });
    });
}

export function registerShowCommand(
  program: Command,
  getCtx: () => OutputContext,
): void {
  program
    .command('show <slug>')
    .description('Show details for a specific document')
    .action((slug: string) => {
      const ctx = getCtx();
      const projectDir = process.cwd();

      const docs = findDocuments(projectDir);
      const doc = docs.find((d) => d.slug === slug);

      if (!doc) {
        outputError(ctx, `Document "${slug}" not found.`, { slug, error: 'not_found' });
        process.exitCode = 1;
        return;
      }

      const raw = fs.readFileSync(doc.path, 'utf-8');
      const { data } = matter(raw);
      const wordCount = raw.split(/\s+/).filter((w) => w.length > 0).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Check draft artifacts
      const artifacts: string[] = [];
      if (doc.location === 'drafts') {
        const draftDir = path.join(projectDir, 'drafts', slug);
        for (const file of ['outline.md', 'content.md', 'checklist.md', 'research.md']) {
          if (fs.existsSync(path.join(draftDir, file))) {
            artifacts.push(file);
          }
        }
      }

      // Compute engagement scores for drafts
      let engagement: { total: number; dimensions: Record<string, { score: number; label: string; details: string }> } | undefined;
      if (doc.location === 'drafts') {
        try {
          const parsed = parseMarkdown(raw);
          const contentType = (parsed.frontMatter.type as ContentType) || 'guide';
          const scoringCtx: ScoringContext = {
            ast: parsed.ast,
            content: parsed.content,
            contentType,
          };
          engagement = computeEngagementScore(scoringCtx);
        } catch {
          // Skip scoring on error
        }
      }

      const info = {
        slug: doc.slug,
        title: doc.title,
        type: doc.type,
        audience: doc.audience,
        location: doc.location,
        wordCount,
        readingTime,
        frontMatter: data,
        artifacts,
        path: doc.path,
        ...(engagement ? { engagement } : {}),
      };

      if (ctx.json) {
        output(ctx, '', { success: true, ...info });
        return;
      }

      const lines = [
        `Title:       ${doc.title}`,
        `Slug:        ${doc.slug}`,
        `Type:        ${doc.type}`,
        `Audience:    ${doc.audience}`,
        `Location:    ${doc.location}`,
        `Words:       ${wordCount}`,
        `Reading:     ~${readingTime} min`,
      ];
      if (artifacts.length > 0) {
        lines.push(`Artifacts:   ${artifacts.join(', ')}`);
      }
      if (engagement) {
        lines.push('');
        lines.push('Engagement:');
        for (const [, dim] of Object.entries(engagement.dimensions)) {
          lines.push(`  ${dim.label.padEnd(12)} ${dim.score}/100`);
        }
        lines.push(`  ${'Total'.padEnd(12)} ${engagement.total}/100`);
      }
      output(ctx, lines.join('\n'), info);
    });
}

export { findDocuments, type DocumentInfo };

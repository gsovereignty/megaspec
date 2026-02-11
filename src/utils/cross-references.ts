import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import type { Diagnostic } from '../validators/types.js';

const CROSS_REF_PATTERN = /\{\{doc:([a-z0-9-]+)\}\}/g;

export interface CrossReference {
  slug: string;
  offset: number;
  line: number;
}

/**
 * Find all {{doc:slug}} cross-references in content.
 */
export function findCrossReferences(
  content: string,
): CrossReference[] {
  const refs: CrossReference[] = [];
  let match: RegExpExecArray | null;
  const pattern = new RegExp(CROSS_REF_PATTERN.source, 'g');
  while ((match = pattern.exec(content)) !== null) {
    const line = content.slice(0, match.index).split('\n').length;
    refs.push({
      slug: match[1],
      offset: match.index,
      line,
    });
  }
  return refs;
}

/**
 * Validate that all cross-references resolve to existing files.
 */
export function validateCrossReferences(
  content: string,
  projectDir: string,
): Diagnostic[] {
  const refs = findCrossReferences(content);
  const diagnostics: Diagnostic[] = [];

  for (const ref of refs) {
    const publishPath = path.join(projectDir, 'publish', `${ref.slug}.md`);
    const draftPath = path.join(
      projectDir,
      'drafts',
      ref.slug,
      'content.md',
    );
    if (!fs.existsSync(publishPath) && !fs.existsSync(draftPath)) {
      diagnostics.push({
        ruleId: 'DF-023',
        severity: 'FAIL',
        line: ref.line,
        message: `Unresolved cross-reference: {{doc:${ref.slug}}} — no matching document found in publish/ or drafts/`,
        research: '',
      });
    }
  }

  return diagnostics;
}

/**
 * Resolve all {{doc:slug}} references to Markdown links.
 * Used during publish.
 */
export function resolveCrossReferences(
  content: string,
  projectDir: string,
): string {
  return content.replace(CROSS_REF_PATTERN, (_match, slug: string) => {
    // Try to read title from published file
    const publishPath = path.join(projectDir, 'publish', `${slug}.md`);
    const draftPath = path.join(projectDir, 'drafts', slug, 'content.md');

    let title = slug;
    for (const filePath of [publishPath, draftPath]) {
      if (fs.existsSync(filePath)) {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const { data } = matter(raw);
          if (data.title && typeof data.title === 'string') {
            title = data.title;
          }
        } catch {
          // Use slug as fallback title
        }
        break;
      }
    }

    return `[${title}](${slug}.md)`;
  });
}

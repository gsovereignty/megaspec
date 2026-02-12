import * as fs from 'node:fs';
import * as path from 'node:path';

export interface HumanReviewData {
  status: 'approved' | 'rejected' | 'needs-revision';
  reviewer: string;
  date: string;
  notes: string;
  acknowledgedUnknowns: boolean;
}

export interface HumanReviewResult {
  ok: boolean;
  data?: HumanReviewData;
  error?: string;
}

export interface UnknownsResult {
  hasUnknowns: boolean;
  files: string[];
}

/**
 * Parse the ## Human Review section from checklist.md content.
 * Expects key-value pairs in `- **Key**: Value` format.
 */
export function parseHumanReview(checklistContent: string): HumanReviewResult {
  const lines = checklistContent.split('\n');
  let inSection = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    if (/^## Human Review\s*$/.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^## /.test(line)) {
      break;
    }
    if (inSection) {
      sectionLines.push(line);
    }
  }

  if (!inSection) {
    return { ok: false, error: 'Missing "## Human Review" section in checklist.md' };
  }

  const sectionBody = sectionLines.join('\n');

  // Extract key-value pairs from `- **Key**: Value` lines
  const pairs = new Map<string, string>();
  const linePattern = /^- \*\*(.+?)\*\*:\s*(.+)$/gm;
  let match: RegExpExecArray | null;
  while ((match = linePattern.exec(sectionBody)) !== null) {
    pairs.set(match[1].toLowerCase().trim(), match[2].trim());
  }

  const status = pairs.get('status');
  if (!status) {
    return { ok: false, error: 'Missing "Status" field in Human Review section' };
  }

  const normalizedStatus = status.toLowerCase();
  if (!['approved', 'rejected', 'needs-revision'].includes(normalizedStatus)) {
    return {
      ok: false,
      error: `Invalid review status "${status}". Must be approved, rejected, or needs-revision.`,
    };
  }

  const reviewer = pairs.get('reviewer') ?? '';
  const date = pairs.get('date') ?? '';
  const notes = pairs.get('notes') ?? '';
  const ackRaw = pairs.get('acknowledged_unknowns') ?? 'false';
  const acknowledgedUnknowns = ackRaw.toLowerCase() === 'true';

  return {
    ok: true,
    data: {
      status: normalizedStatus as HumanReviewData['status'],
      reviewer,
      date,
      notes,
      acknowledgedUnknowns,
    },
  };
}

/**
 * Check human review status for a draft slug.
 * Reads checklist.md from drafts/<slug>/ and parses the Human Review section.
 */
export function checkHumanReview(projectDir: string, slug: string): HumanReviewResult {
  const checklistPath = path.join(projectDir, 'drafts', slug, 'checklist.md');

  if (!fs.existsSync(checklistPath)) {
    return { ok: false, error: `checklist.md not found for draft "${slug}"` };
  }

  const content = fs.readFileSync(checklistPath, 'utf-8');
  return parseHumanReview(content);
}

const ARTIFACT_FILES = ['outline.md', 'content.md', 'checklist.md', 'research.md'];

/**
 * Check whether unknowns content is effectively empty.
 */
function isUnknownsEmpty(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed === '' || trimmed === '-') return true;

  const lower = trimmed.toLowerCase();
  if (lower === 'none' || lower === 'n/a' || lower === 'none.') return true;

  // Check for list items that are all empty or "None"/"N/A"
  const lines = trimmed.split('\n').map((l) => l.replace(/^[-*]\s*/, '').trim());
  return lines.every((l) => l === '' || l.toLowerCase() === 'none' || l.toLowerCase() === 'n/a');
}

/**
 * Scan all artifacts in a draft for non-empty ### Unknowns sections
 * under ## Agent Contributions.
 */
export function scanUnknowns(projectDir: string, slug: string): UnknownsResult {
  const draftDir = path.join(projectDir, 'drafts', slug);
  const filesWithUnknowns: string[] = [];

  for (const file of ARTIFACT_FILES) {
    const filePath = path.join(draftDir, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let inAgentContributions = false;
    let inUnknowns = false;
    const unknownsLines: string[] = [];

    for (const line of lines) {
      if (/^## Agent Contributions\s*$/.test(line)) {
        inAgentContributions = true;
        continue;
      }
      if (inAgentContributions && /^## (?!#)/.test(line)) {
        // Hit next H2 — end of Agent Contributions
        break;
      }
      if (inAgentContributions && /^### Unknowns\s*$/.test(line)) {
        inUnknowns = true;
        continue;
      }
      if (inUnknowns && /^### /.test(line)) {
        // Hit next H3 — end of Unknowns subsection
        inUnknowns = false;
        continue;
      }
      if (inUnknowns) {
        unknownsLines.push(line);
      }
    }

    if (unknownsLines.length > 0 && !isUnknownsEmpty(unknownsLines.join('\n'))) {
      filesWithUnknowns.push(file);
    }
  }

  return {
    hasUnknowns: filesWithUnknowns.length > 0,
    files: filesWithUnknowns,
  };
}

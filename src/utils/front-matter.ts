import type { Diagnostic } from '../validators/types.js';

const VALID_TYPES = ['tutorial', 'reference', 'guide', 'whitepaper'] as const;
const VALID_AUDIENCES = ['beginner', 'intermediate', 'advanced'] as const;

export type ContentType = (typeof VALID_TYPES)[number];
export type Audience = (typeof VALID_AUDIENCES)[number];

export interface FrontMatterData {
  id: string;
  title: string;
  type: ContentType;
  audience: Audience;
  prerequisites: string[];
}

export function validateFrontMatter(
  data: Record<string, unknown>,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message:
        'Missing or empty required front matter field: id (must be kebab-case slug)',
      research: 'RF-09',
    });
  } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.id as string)) {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message: `Invalid front matter field "id": "${data.id}". Must be kebab-case (e.g., "my-doc-slug")`,
      research: 'RF-09',
    });
  }

  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message: 'Missing or empty required front matter field: title',
      research: 'RF-09',
    });
  }

  if (!data.type || typeof data.type !== 'string') {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message: 'Missing required front matter field: type',
      research: 'RF-09',
    });
  } else if (!VALID_TYPES.includes(data.type as ContentType)) {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message: `Invalid content type: "${data.type}". Must be one of: ${VALID_TYPES.join(', ')}`,
      research: 'RF-09',
    });
  }

  if (!data.audience || typeof data.audience !== 'string') {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message: 'Missing required front matter field: audience',
      research: 'RF-09',
    });
  } else if (!VALID_AUDIENCES.includes(data.audience as Audience)) {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message: `Invalid audience: "${data.audience}". Must be one of: ${VALID_AUDIENCES.join(', ')}`,
      research: 'RF-09',
    });
  }

  if (data.prerequisites !== undefined && !Array.isArray(data.prerequisites)) {
    diagnostics.push({
      ruleId: 'DF-020',
      severity: 'FAIL',
      line: 1,
      message:
        'Front matter field "prerequisites" must be an array of strings',
      research: 'RF-09',
    });
  }

  return diagnostics;
}

export function parseFrontMatter(
  data: Record<string, unknown>,
): FrontMatterData | null {
  if (
    !data.id ||
    !data.title ||
    !data.type ||
    !data.audience
  ) {
    return null;
  }
  return {
    id: data.id as string,
    title: data.title as string,
    type: data.type as ContentType,
    audience: data.audience as Audience,
    prerequisites: Array.isArray(data.prerequisites)
      ? (data.prerequisites as string[])
      : [],
  };
}

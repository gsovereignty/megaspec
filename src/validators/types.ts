import type { Root } from 'mdast';
import type { ContentType } from '../utils/front-matter.js';

export type Severity = 'PASS' | 'WARN' | 'FAIL';

export interface Diagnostic {
  ruleId: string;
  severity: Severity;
  line: number;
  message: string;
  research: string;
}

export interface ValidationContext {
  ast: Root;
  content: string;
  rawContent: string;
  frontMatter: Record<string, unknown>;
  contentType: ContentType;
  projectDir: string;
  slug: string;
  filePath: string;
}

export type ValidationRule = (ctx: ValidationContext) => Diagnostic[];

export interface ProfileRule {
  ruleId: string;
  severity: Severity;
  rule: ValidationRule;
}

export interface ValidationProfile {
  name: ContentType;
  fleschKincaidTarget: number;
  passiveVoiceThreshold: number;
  rules: ProfileRule[];
}

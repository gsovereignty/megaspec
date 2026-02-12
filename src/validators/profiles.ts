import type { ValidationProfile, ProfileRule } from './types.js';
import type { ContentType } from '../utils/front-matter.js';

// Rule IDs matching our validator implementations
const RULE_IDS = {
  // Draft structure
  FRONT_MATTER: 'DF-020',
  CROSS_REFS: 'DF-023',
  DRAFT_COMPLETENESS: 'DF-024',
  OUTLINE_STRUCTURE: 'DF-025',
  CHECKLIST_GAGNE: 'DF-026',
  RESEARCH_STRUCTURE: 'DF-027',
  AGENT_CONTRIBUTIONS: 'DF-028',
  FLAT_PUBLISH: 'DF-029',

  // Cognitive load
  PARAGRAPH_LENGTH: 'DF-030',
  LIST_LENGTH_MAX: 'DF-031',
  LIST_LENGTH_MIN: 'DF-032',
  SECTION_DENSITY: 'DF-033',
  CODE_COMMENTS: 'DF-034',
  WORKED_EXAMPLE: 'DF-035',
  CODE_PROXIMITY: 'DF-036',

  // Engagement
  OPENING_HOOK: 'DF-040',
  QUESTION_BEFORE_ANSWER: 'DF-041',
  EXAMPLE_PRESENCE: 'DF-042',
  PLACEHOLDER_NAMES: 'DF-043',
  STEP_NUMBERING: 'DF-044',
  NEXT_STEPS: 'DF-045',
  TRANSITIONS: 'DF-046',
  NARRATIVE_ARC: 'DF-047',

  // Readability
  FLESCH_KINCAID: 'DF-050',
  SENTENCE_LENGTH: 'DF-051',
  PASSIVE_VOICE: 'DF-052',
  READER_FOCUS: 'DF-053',
  HEADING_DESCRIPTIVENESS: 'DF-054',
  TOPIC_SENTENCE: 'DF-055',

  // Visual support
  VISUAL_DENSITY: 'DF-056',
  DIAGRAM_SUGGESTION: 'DF-057',
  IMAGE_ALT_TEXT: 'DF-058',
  IMAGE_PATH: 'DF-059',

  // LLM artifact detection
  LLM_ARTIFACTS: 'DF-091',
} as const;

// Common rules shared across all profiles
function commonRules(): ProfileRule[] {
  return [
    { ruleId: RULE_IDS.FRONT_MATTER, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.CROSS_REFS, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.DRAFT_COMPLETENESS, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.AGENT_CONTRIBUTIONS, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.FLAT_PUBLISH, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.PARAGRAPH_LENGTH, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.LIST_LENGTH_MAX, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.LIST_LENGTH_MIN, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.SECTION_DENSITY, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.PLACEHOLDER_NAMES, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.SENTENCE_LENGTH, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.HEADING_DESCRIPTIVENESS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.IMAGE_ALT_TEXT, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.IMAGE_PATH, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.LLM_ARTIFACTS, severity: 'WARN', rule: () => [] },
  ];
}

export const tutorialProfile: ValidationProfile = {
  name: 'tutorial',
  fleschKincaidTarget: 8,
  passiveVoiceThreshold: 0.2,
  rules: [
    ...commonRules(),
    { ruleId: RULE_IDS.OUTLINE_STRUCTURE, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.CHECKLIST_GAGNE, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.RESEARCH_STRUCTURE, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.CODE_COMMENTS, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.WORKED_EXAMPLE, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.CODE_PROXIMITY, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.OPENING_HOOK, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.QUESTION_BEFORE_ANSWER, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.EXAMPLE_PRESENCE, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.STEP_NUMBERING, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.NEXT_STEPS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.TRANSITIONS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.NARRATIVE_ARC, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.FLESCH_KINCAID, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.PASSIVE_VOICE, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.READER_FOCUS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.TOPIC_SENTENCE, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.VISUAL_DENSITY, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.DIAGRAM_SUGGESTION, severity: 'WARN', rule: () => [] },
  ],
};

export const referenceProfile: ValidationProfile = {
  name: 'reference',
  fleschKincaidTarget: 10,
  passiveVoiceThreshold: 0.2,
  rules: [
    ...commonRules(),
    // Reference skips: opening hooks, narrative arc, exercises, worked examples
    { ruleId: RULE_IDS.FLESCH_KINCAID, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.PASSIVE_VOICE, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.READER_FOCUS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.CODE_PROXIMITY, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.VISUAL_DENSITY, severity: 'WARN', rule: () => [] },
  ],
};

export const guideProfile: ValidationProfile = {
  name: 'guide',
  fleschKincaidTarget: 10,
  passiveVoiceThreshold: 0.2,
  rules: [
    ...commonRules(),
    { ruleId: RULE_IDS.OPENING_HOOK, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.EXAMPLE_PRESENCE, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.QUESTION_BEFORE_ANSWER, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.NEXT_STEPS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.TRANSITIONS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.FLESCH_KINCAID, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.PASSIVE_VOICE, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.READER_FOCUS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.VISUAL_DENSITY, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.DIAGRAM_SUGGESTION, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.CODE_PROXIMITY, severity: 'WARN', rule: () => [] },
  ],
};

export const whitepaperProfile: ValidationProfile = {
  name: 'whitepaper',
  fleschKincaidTarget: 12,
  passiveVoiceThreshold: 0.35, // Relaxed for whitepapers
  rules: [
    ...commonRules(),
    { ruleId: RULE_IDS.OPENING_HOOK, severity: 'FAIL', rule: () => [] },
    { ruleId: RULE_IDS.NEXT_STEPS, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.FLESCH_KINCAID, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.PASSIVE_VOICE, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.VISUAL_DENSITY, severity: 'WARN', rule: () => [] },
    { ruleId: RULE_IDS.DIAGRAM_SUGGESTION, severity: 'WARN', rule: () => [] },
  ],
};

const profiles: Record<ContentType, ValidationProfile> = {
  tutorial: tutorialProfile,
  reference: referenceProfile,
  guide: guideProfile,
  whitepaper: whitepaperProfile,
};

export function getProfile(contentType: ContentType): ValidationProfile {
  return profiles[contentType];
}

export { RULE_IDS };

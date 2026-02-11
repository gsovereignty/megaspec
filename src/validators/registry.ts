import type {
  ValidationRule,
  ValidationProfile,
  Diagnostic,
  ValidationContext,
  Severity,
} from './types.js';

const ruleRegistry = new Map<string, ValidationRule>();

export function registerRule(ruleId: string, rule: ValidationRule): void {
  ruleRegistry.set(ruleId, rule);
}

export function getRule(ruleId: string): ValidationRule | undefined {
  return ruleRegistry.get(ruleId);
}

/**
 * Execute all rules in a profile against the given context.
 * Each rule's severity is overridden by the profile's configured severity.
 */
export function executeProfile(
  profile: ValidationProfile,
  ctx: ValidationContext,
  strict: boolean = false,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const profileRule of profile.rules) {
    const rule = ruleRegistry.get(profileRule.ruleId);
    if (!rule) continue;

    const ruleDiagnostics = rule(ctx);

    for (const diag of ruleDiagnostics) {
      // Override severity with profile-configured severity
      let severity: Severity = profileRule.severity;
      // In strict mode, WARN becomes FAIL
      if (strict && severity === 'WARN') {
        severity = 'FAIL';
      }
      diagnostics.push({
        ...diag,
        severity,
        ruleId: profileRule.ruleId,
      });
    }
  }

  return diagnostics;
}

export function getAllRuleIds(): string[] {
  return Array.from(ruleRegistry.keys());
}

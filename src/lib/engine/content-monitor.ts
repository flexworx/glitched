// Content Monitor: scans agent outputs for policy violations
export interface ContentCheckResult {
  safe: boolean;
  violations: string[];
  severity: 'none' | 'low' | 'medium' | 'high';
}

const BLOCKED_PATTERNS = [
  /(kill|murder|suicide|self-harm)/gi,
  /(hate speech|slur)/gi,
];

export function checkContent(text: string): ContentCheckResult {
  const violations: string[] = [];

  for (const pattern of BLOCKED_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) violations.push(...matches.map(m => `Blocked term: "${m}"`));
  }

  const severity = violations.length === 0 ? 'none' : violations.length < 2 ? 'low' : violations.length < 5 ? 'medium' : 'high';

  return { safe: violations.length === 0, violations, severity };
}

export function sanitizeOutput(text: string): string {
  let sanitized = text;
  for (const pattern of BLOCKED_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  return sanitized;
}

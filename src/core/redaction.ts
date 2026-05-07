import type { RedactionFinding, RedactionSummary } from '../api/types';

type Rule = { kind: string; replacement: string; pattern: RegExp };
const RULES: Rule[] = [
  { kind: 'openrouter_api_key', replacement: '[REDACTED_OPENROUTER_KEY]', pattern: /sk-or-v1-[A-Za-z0-9_-]{12,}/g },
  { kind: 'openai_api_key', replacement: '[REDACTED_OPENAI_KEY]', pattern: /sk-[A-Za-z0-9]{20,}/g },
  { kind: 'github_token', replacement: '[REDACTED_GITHUB_TOKEN]', pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
  { kind: 'aws_access_key', replacement: '[REDACTED_AWS_KEY]', pattern: /AKIA[0-9A-Z]{16}/g },
  { kind: 'jwt', replacement: '[REDACTED_JWT]', pattern: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  { kind: 'bearer_token', replacement: 'Bearer [REDACTED_TOKEN]', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{12,}/gi },
  { kind: 'private_key', replacement: '[REDACTED_PRIVATE_KEY]', pattern: /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/g },
  { kind: 'password_assignment', replacement: '$1=[REDACTED_SECRET]', pattern: /\b(password|passwd|pwd|api[_-]?key|token|secret)\s*=\s*[^\s\n]+/gi },
  { kind: 'database_url', replacement: '[REDACTED_DATABASE_URL]', pattern: /(?:postgres|mysql|mongodb|redis):\/\/[^\s)]+/gi },
  { kind: 'home_path', replacement: '[USER_HOME]', pattern: /(?:C:\\Users\\[^\\\s]+|\/Users\/[^\/\s]+|\/home\/[^\/\s]+)/g }
];

export function redactText(input: string): { text: string; summary: RedactionSummary } {
  let text = input;
  const findings: RedactionFinding[] = [];
  for (const rule of RULES) {
    let count = 0;
    text = text.replace(rule.pattern, (...args: string[]) => {
      count += 1;
      if (rule.kind === 'password_assignment' && args[1]) return `${args[1]}=[REDACTED_SECRET]`;
      return rule.replacement;
    });
    if (count) findings.push({ kind: rule.kind, count, replacement: rule.replacement });
  }
  return { text, summary: { blocked: false, total_redactions: findings.reduce((a, f) => a + f.count, 0), findings } };
}

export function assertNoKnownSecrets(text: string): void {
  const secretSignals = [
    /sk-or-v1-[A-Za-z0-9_-]{12,}/,
    /sk-[A-Za-z0-9]{20,}/,
    /gh[pousr]_[A-Za-z0-9_]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/,
    /Bearer\s+(?!\[REDACTED_TOKEN\])[A-Za-z0-9._~+/=-]{12,}/i,
    /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/,
    /(?:postgres|mysql|mongodb|redis):\/\/[^\s)]+/i
  ];
  if (secretSignals.some(pattern => pattern.test(text))) throw new Error('Unredacted secret-like content detected');
}

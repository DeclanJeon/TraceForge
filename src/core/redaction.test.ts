import { describe, expect, it } from 'vitest';
import { redactText, assertNoKnownSecrets } from './redaction';

describe('redaction engine', () => {
  it('masks OpenRouter, bearer, GitHub, password, database url and home path secrets', () => {
    const openRouterKey = 'sk-or-v1-' + 'abcdefghijklmnopqrstuvwxyz';
    const githubToken = 'ghp_' + 'abcdefghijklmnopqrstuvwxyz123456';
    const input = `key=${openRouterKey}\nAuthorization: Bearer verysecretbearertoken123\n${githubToken}\npassword=hunter2\npostgres://user:pass@localhost/db\n/home/declan/project`;
    const { text, summary } = redactText(input);
    expect(summary.total_redactions).toBeGreaterThanOrEqual(6);
    expect(text).not.toContain(openRouterKey);
    expect(text).not.toContain('hunter2');
    expect(text).not.toContain('/home/declan');
    expect(() => assertNoKnownSecrets(text)).not.toThrow();
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { addWatchPath } from './watch';
import { generateReportNow, previewRedaction } from './report';
import { repository, resetRepository } from './repository';

describe('snapshot and report flow', () => {
  beforeEach(() => resetRepository());
  it('generates raw snapshot metadata and markdown report', async () => {
    addWatchPath({ path: '/tmp/traceforge-demo', mode: 'project' });
    const result = await generateReportNow();
    expect(result.job.status).toBe('success');
    expect(result.report?.content).toContain('## Evidence Source');
    expect(repository.listSnapshots()[0].hash).toBeTruthy();
    expect(repository.listReports()).toHaveLength(1);
  });
  it('privacy preview returns sanitized payload and counts redactions', () => {
    const key = 'sk-or-v1-' + 'abcdefghijklmnopqrstuvwxyz';
    const preview = previewRedaction(`token=${key}`);
    expect(preview.redaction_summary.total_redactions).toBeGreaterThan(0);
    expect(preview.sanitized_payload).not.toContain(key);
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { addWatchPath, validateWatchPath } from './watch';
import { repository, resetRepository } from './repository';

describe('watch path management', () => {
  beforeEach(() => resetRepository());
  it('rejects relative paths and accepts absolute project paths', () => {
    expect(validateWatchPath('relative/path', 'project').valid).toBe(false);
    expect(validateWatchPath('/tmp/project', 'project').valid).toBe(true);
  });
  it('adds a watch path and marks app configured', () => {
    const wp = addWatchPath({ path: '/tmp/project', mode: 'project' });
    expect(wp.enabled).toBe(true);
    expect(repository.getStatus().configured).toBe(true);
  });
});

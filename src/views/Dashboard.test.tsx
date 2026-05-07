import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { Dashboard } from './Dashboard';
import { repository, resetRepository } from '../core/repository';
import { addWatchPath } from '../core/watch';

describe('Dashboard', () => {
  beforeEach(() => resetRepository());
  it('shows configured monitoring context', () => {
    addWatchPath({ path: '/tmp/demo', mode: 'project' });
    render(<Dashboard status={repository.getStatus()} onNavigate={() => undefined} onChanged={() => undefined} />);
    expect(screen.getByText('작업 evidence 기록 중')).toBeInTheDocument();
    expect(screen.getAllByText('/tmp/demo').length).toBeGreaterThan(0);
  });
});

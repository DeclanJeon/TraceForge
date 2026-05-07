import type { WatchMode, WatchPath } from '../api/types';
import { DEFAULT_EXCLUDES } from './defaults';
import { repository } from './repository';

export function validateWatchPath(path: string, mode: WatchMode): { valid: boolean; warnings: string[]; errors: string[] } {
  const errors: string[] = []; const warnings: string[] = [];
  if (!path.trim()) errors.push('감시 경로를 입력해야 합니다.');
  if (!path.startsWith('/') && !/^[A-Za-z]:\\/.test(path) && !path.startsWith('~')) errors.push('절대 경로 또는 홈 경로를 입력해야 합니다.');
  if (DEFAULT_EXCLUDES.some(ex => path.split(/[\\/]/).includes(ex))) warnings.push('기본 제외 경로 내부를 감시하려고 합니다.');
  if (mode === 'system') warnings.push('System Mode는 지정 경로 외 개인정보 수집 위험이 있어 2단계 확인이 필요합니다.');
  return { valid: errors.length === 0, warnings, errors };
}
export function addWatchPath(input: { path: string; mode: WatchMode; max_depth?: number; follow_symlinks?: boolean }): WatchPath {
  const validation = validateWatchPath(input.path, input.mode); if (!validation.valid) throw new Error(validation.errors.join('\n'));
  const now = new Date().toISOString();
  const item: WatchPath = { id: `wp_${crypto.randomUUID?.() ?? Date.now()}`, mode: input.mode, path: input.path, enabled: true, max_depth: input.max_depth ?? 5, follow_symlinks: input.follow_symlinks ?? false, created_at: now, updated_at: now };
  repository.saveWatchPaths([item, ...repository.listWatchPaths()]); repository.updateSettings({ configured: true }); return item;
}
export function updateWatchPath(id: string, patch: Partial<WatchPath>): WatchPath {
  let updated: WatchPath | undefined;
  const next = repository.listWatchPaths().map(p => p.id === id ? (updated = { ...p, ...patch, id, updated_at: new Date().toISOString() }) : p);
  if (!updated) throw new Error('Watch path not found'); repository.saveWatchPaths(next); return updated;
}
export function removeWatchPath(id: string): void { repository.saveWatchPaths(repository.listWatchPaths().filter(p => p.id !== id)); }

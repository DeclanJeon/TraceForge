import { repository } from '../core/repository';
import { addWatchPath, removeWatchPath, updateWatchPath, validateWatchPath } from '../core/watch';
import { collectSnapshotNow, getSnapshot } from '../core/snapshot';
import { generateReportNow, previewRedaction } from '../core/report';
import type { Settings, WatchMode, WatchPath } from './types';

export const commands = {
  appGetStatus: () => repository.getStatus(),
  settingsGet: () => repository.getSettings(),
  settingsUpdate: (patch: Partial<Settings>) => repository.updateSettings(patch),
  watchListPaths: () => repository.listWatchPaths(),
  watchValidatePath: (path: string, mode: WatchMode) => validateWatchPath(path, mode),
  watchAddPath: (input: { path: string; mode: WatchMode; max_depth?: number; follow_symlinks?: boolean }) => addWatchPath(input),
  watchUpdatePath: (id: string, patch: Partial<WatchPath>) => updateWatchPath(id, patch),
  watchRemovePath: (id: string) => removeWatchPath(id),
  snapshotCollectNow: () => collectSnapshotNow(),
  snapshotGet: (id: string) => getSnapshot(id),
  reportGenerate: () => generateReportNow(),
  reportList: () => repository.listReports(),
  reportOpen: (id: string) => repository.getReport(id),
  reportLatest: () => repository.latestReport(),
  redactionPreview: (text: string) => previewRedaction(text),
  secretSetOpenRouterKey: (key: string) => repository.updateSettings({ configured: true }) && ({ stored: true, fingerprint: key ? `****${key.slice(-4)}` : '' }),
  secretTestOpenRouterKey: (key: string) => ({ ok: key.startsWith('sk-') || key.startsWith('sk-or-v1-'), message: key ? 'Key shape accepted for MVP local validation.' : 'Key is empty.' }),
  trayStartMonitoring: () => repository.updateSettings({ configured: true }),
  trayPauseMonitoring: () => ({ monitoring_state: 'paused' as const }),
  trayGenerateReportNow: () => generateReportNow(),
  trayOpenLatestReport: () => repository.latestReport()
};
export type CommandRegistry = typeof commands;

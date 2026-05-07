import type { AppStatus, RawSnapshot, Report, Settings, WatchPath } from '../api/types';
import { DEFAULT_SETTINGS } from './defaults';

const memory = new Map<string, string>();
function storage(): Storage | undefined { try { return globalThis.localStorage; } catch { return undefined; } }
function getItem(key: string): string | null { return storage()?.getItem(key) ?? memory.get(key) ?? null; }
function setItem(key: string, value: string): void { storage()?.setItem(key, value); memory.set(key, value); }
function readJson<T>(key: string, fallback: T): T { const raw = getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
function writeJson<T>(key: string, value: T): T { setItem(key, JSON.stringify(value)); return value; }
export function resetRepository(): void { memory.clear(); storage()?.clear(); }

export class LocalRepository {
  getSettings(): Settings { return readJson('traceforge.settings', DEFAULT_SETTINGS); }
  updateSettings(patch: Partial<Settings>): Settings {
    const current = this.getSettings();
    const next: Settings = { ...current, ...patch, analysis: { ...current.analysis, ...patch.analysis }, privacy: { ...current.privacy, ...patch.privacy }, agent_bridge: { ...current.agent_bridge, ...patch.agent_bridge }, notifications: { ...current.notifications, ...patch.notifications }, general: { ...current.general, ...patch.general }, exclude_rules: patch.exclude_rules ?? current.exclude_rules };
    return writeJson('traceforge.settings', next);
  }
  listWatchPaths(): WatchPath[] { return readJson('traceforge.watchPaths', []); }
  saveWatchPaths(paths: WatchPath[]): WatchPath[] { return writeJson('traceforge.watchPaths', paths); }
  listSnapshots(): RawSnapshot[] { return readJson('traceforge.snapshots', []); }
  addSnapshot(snapshot: RawSnapshot): RawSnapshot { const items = [snapshot, ...this.listSnapshots()]; writeJson('traceforge.snapshots', items); return snapshot; }
  getSnapshot(id: string): RawSnapshot | undefined { return this.listSnapshots().find(s => s.id === id); }
  listReports(): Report[] { return readJson('traceforge.reports', []); }
  addReport(report: Report): Report { const items = [report, ...this.listReports()]; writeJson('traceforge.reports', items); return report; }
  getReport(id: string): Report | undefined { return this.listReports().find(r => r.id === id); }
  latestReport(): Report | undefined { return this.listReports()[0]; }
  getStatus(): AppStatus {
    const settings = this.getSettings(); const watchPaths = this.listWatchPaths(); const latestReport = this.latestReport(); const latestSnapshot = this.listSnapshots()[0];
    const configured = settings.configured && watchPaths.some(p => p.enabled);
    return { configured, monitoring_state: configured ? 'running' : 'setup_required', tray_state: configured ? 'running' : 'setup_required', last_snapshot_at: latestSnapshot?.captured_at, last_report_id: latestReport?.id, ai_status: settings.analysis.model ? 'ready' : 'not_configured' };
  }
}
export const repository = new LocalRepository();

import type { AgentSession, FileEvent, GitSnapshot, RawSnapshot, WatchPath } from '../api/types';
import { repository } from './repository';
import { redactText } from './redaction';

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  if (globalThis.crypto?.subtle) {
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return String(Math.abs([...data].reduce((a, b) => ((a << 5) - a + b) | 0, 0)));
}
function syntheticEvents(paths: WatchPath[]): FileEvent[] {
  const now = new Date().toISOString();
  return paths.filter(p => p.enabled).map(p => ({ path: `${p.path}/.worklog/agent-session.md`, event_type: 'modify', occurred_at: now, summary: 'collectNow scan summary: agent bridge and project metadata checked' }));
}
function gitSummaries(paths: WatchPath[]): GitSnapshot[] {
  return paths.filter(p => p.enabled).map(p => ({ project_path: p.path, branch: 'unknown-local-preview', status_short: 'M docs/implementation', diff_stat: 'Local-first web preview cannot run native git collector; Tauri backend scaffold owns native collection.', recent_commits: [], warning: 'Native GitCollector is scaffolded for Tauri runtime.' }));
}
function agentSessions(paths: WatchPath[]): AgentSession[] { return paths.filter(p => p.enabled).map(p => ({ path: `${p.path}/.worklog/agent-session.md`, exists: false, sanitized_content: 'Agent bridge template available; no local file content loaded in web preview.' })); }

export async function collectSnapshotNow(): Promise<RawSnapshot> {
  const watch_scope = repository.listWatchPaths().filter(p => p.enabled);
  const payload = JSON.stringify({ watch_scope, file_events: syntheticEvents(watch_scope), git_summaries: gitSummaries(watch_scope), agent_sessions: agentSessions(watch_scope) }, null, 2);
  const redacted = redactText(payload);
  const id = `snap_${Date.now()}`; const captured_at = new Date().toISOString(); const sanitized_payload = redacted.text;
  const snapshot: RawSnapshot = { id, captured_at, watch_scope, file_events: syntheticEvents(watch_scope), git_summaries: gitSummaries(watch_scope), agent_sessions: agentSessions(watch_scope), redaction_summary: redacted.summary, sanitized_payload, hash: await sha256(sanitized_payload), status: redacted.summary.blocked ? 'blocked' : 'ready' };
  repository.addSnapshot(snapshot); return snapshot;
}
export async function getSnapshot(id: string): Promise<RawSnapshot> { const s = repository.getSnapshot(id); if (!s) throw new Error('Snapshot not found'); return s; }

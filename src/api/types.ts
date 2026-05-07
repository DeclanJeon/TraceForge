export type MonitoringState = 'running' | 'paused' | 'error' | 'setup_required';
export type TrayState = MonitoringState | 'ai_offline';
export type WatchMode = 'project' | 'workspace' | 'home' | 'system';
export type JobStatus = 'pending' | 'running' | 'success' | 'failed' | 'blocked';

export interface AppStatus {
  configured: boolean;
  monitoring_state: MonitoringState;
  tray_state: TrayState;
  last_snapshot_at?: string;
  last_report_id?: string;
  ai_status: 'not_configured' | 'ready' | 'offline' | 'invalid_key';
}
export interface WatchPath {
  id: string;
  mode: WatchMode;
  path: string;
  enabled: boolean;
  max_depth: number;
  follow_symlinks: boolean;
  created_at: string;
  updated_at: string;
}
export interface ExcludeRule { id: string; pattern: string; enabled: boolean; source: 'default' | 'custom'; }
export interface Settings {
  configured: boolean;
  analysis: { interval_minutes: number; provider: 'openrouter'; model: string; };
  privacy: { redact_secrets: boolean; send_raw_diff_to_ai: boolean; shell_history_opt_in: boolean; };
  agent_bridge: { enabled: boolean; create_template: boolean; };
  notifications: { enabled: boolean; report_generated: boolean; errors: boolean; };
  general: { close_to_tray: boolean; start_on_login: boolean; };
  exclude_rules: ExcludeRule[];
}
export interface FileEvent { path: string; event_type: 'create' | 'modify' | 'delete' | 'rename'; occurred_at: string; summary: string; }
export interface GitSnapshot { project_path: string; branch: string; status_short: string; diff_stat: string; recent_commits: string[]; warning?: string; }
export interface AgentSession { path: string; exists: boolean; content?: string; sanitized_content?: string; }
export interface RedactionFinding { kind: string; count: number; replacement: string; }
export interface RedactionSummary { blocked: boolean; total_redactions: number; findings: RedactionFinding[]; }
export interface RawSnapshot { id: string; captured_at: string; watch_scope: WatchPath[]; file_events: FileEvent[]; git_summaries: GitSnapshot[]; agent_sessions: AgentSession[]; redaction_summary: RedactionSummary; sanitized_payload: string; hash: string; status: 'ready' | 'blocked'; }
export interface AnalysisJob { id: string; raw_snapshot_id: string; provider: 'openrouter'; model: string; status: JobStatus; created_at: string; completed_at?: string; error?: string; }
export interface Report { id: string; raw_snapshot_id: string; title: string; project_name: string; report_type: 'hourly' | 'daily' | 'case_study' | 'client'; file_path: string; content: string; created_at: string; ai_summary: string; }
export interface PrivacyPreview { sanitized_payload: string; redaction_summary: RedactionSummary; safe_to_send: boolean; }
export interface GenerateResult { job: AnalysisJob; report?: Report; }

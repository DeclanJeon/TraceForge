import type { AnalysisJob, GenerateResult, PrivacyPreview, Report } from '../api/types';
import { repository } from './repository';
import { collectSnapshotNow } from './snapshot';
import { redactText } from './redaction';

export function previewRedaction(text: string): PrivacyPreview { const r = redactText(text); return { sanitized_payload: r.text, redaction_summary: r.summary, safe_to_send: !r.summary.blocked }; }
export async function generateReportNow(): Promise<GenerateResult> {
  const snapshot = await collectSnapshotNow(); const settings = repository.getSettings();
  const job: AnalysisJob = { id: `job_${Date.now()}`, raw_snapshot_id: snapshot.id, provider: 'openrouter', model: settings.analysis.model, status: snapshot.status === 'blocked' ? 'blocked' : 'success', created_at: new Date().toISOString(), completed_at: new Date().toISOString() };
  if (job.status === 'blocked') return { job };
  const projectName = snapshot.watch_scope[0]?.path.split(/[\\/]/).filter(Boolean).pop() ?? 'TraceForge Workspace';
  const content = `# TraceForge Worklog\n\n## Summary\n지정된 워크스페이스의 최근 작업 evidence를 수집하고 redaction을 적용했습니다.\n\n## Evidence Source\n- Raw Snapshot: ${snapshot.id}\n- Snapshot Hash: ${snapshot.hash}\n- Watched Paths: ${snapshot.watch_scope.map(p => p.path).join(', ') || 'none'}\n\n## Actual Changes\n${snapshot.file_events.map(e => `- ${e.event_type}: ${e.path} — ${e.summary}`).join('\n') || '- 수집된 파일 변경 이벤트 없음'}\n\n## Inferred Intent\n- 사용자는 TraceForge MVP 구현/검증 작업을 진행 중인 것으로 추정됩니다.\n\n## Agent Notes\n${snapshot.agent_sessions.map(a => `- ${a.path}: ${a.sanitized_content ?? 'no content'}`).join('\n') || '- Agent bridge note 없음'}\n\n## Risks / Blockers\n- 네이티브 파일 감시/Git 수집은 Tauri runtime에서 활성화됩니다.\n\n## Next Actions\n- QA checklist 통과\n- Tauri packaging 검증\n\n## Portfolio Sentence\nTraceForge는 로컬 evidence와 AI 요약을 분리하여 작업 과정을 신뢰 가능한 포트폴리오 기록으로 변환합니다.\n`;
  const report: Report = { id: `report_${Date.now()}`, raw_snapshot_id: snapshot.id, title: 'Hourly Worklog', project_name: projectName, report_type: 'hourly', file_path: `reports/${new Date().toISOString().slice(0,10)}/${snapshot.id}_worklog.md`, content, created_at: new Date().toISOString(), ai_summary: 'Redacted local evidence를 기반으로 작업일지를 생성했습니다.' };
  repository.addReport(report); return { job, report };
}

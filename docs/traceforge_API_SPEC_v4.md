# TraceForge v4 Documentation Set

제품명: **TraceForge**  
서브타이틀: **AI Work Evidence Recorder**  
문서 기준일: 2026-05-08  
핵심 변경: CLI/스크립트 실행형에서 **설치형 크로스플랫폼 데스크톱 앱 + 트레이 백그라운드 에이전트**로 전환

---

# API Spec v4

## 1. 개요

TraceForge v4의 API는 외부 HTTP API가 아니라 데스크톱 앱 내부 API, Tauri/Electron IPC Command, Tray Command, Local File API, OpenRouter 연동 규격을 포함한다.

## 2. Internal Command API

Tauri 기준 command 이름을 정의한다. Electron 구현 시 IPC channel로 매핑한다.

## 3. App Lifecycle Commands

### `app.getStatus`

Returns current monitoring and setup status.

Response:

```json
{
  "configured": true,
  "monitoring_state": "running",
  "tray_state": "running",
  "last_snapshot_at": "2026-05-08T15:00:00+09:00",
  "last_report_id": "report_123"
}
```

### `app.quit`

Fully quits the application.

### `app.openDashboard`

Opens the main dashboard window.

## 4. Tray Commands

### `tray.startMonitoring`

Starts monitoring.

### `tray.pauseMonitoring`

Pauses monitoring without quitting app.

### `tray.generateReportNow`

Immediately collects snapshot and starts analysis job.

Response:

```json
{
  "job_id": "job_123",
  "status": "pending"
}
```

### `tray.openLatestReport`

Opens the latest generated report in the default viewer or internal report view.

## 5. Watch Path API

### `watch.listPaths`

Response:

```json
[
  {
    "id": "wp_001",
    "mode": "workspace",
    "path": "/Users/declan/Projects",
    "enabled": true,
    "max_depth": 5,
    "follow_symlinks": false
  }
]
```

### `watch.addPath`

Request:

```json
{
  "mode": "project",
  "path": "/Users/declan/Projects/PonsLink",
  "max_depth": 5,
  "follow_symlinks": false
}
```

Validation:
- path exists
- path readable
- if mode = system, advanced confirmation required

### `watch.removePath`

Request:

```json
{
  "id": "wp_001"
}
```

### `watch.updatePath`

Request:

```json
{
  "id": "wp_001",
  "enabled": false,
  "max_depth": 3
}
```

### `watch.validatePath`

Request:

```json
{
  "path": "/Users/declan/Projects",
  "mode": "workspace"
}
```

Response:

```json
{
  "valid": true,
  "warnings": [],
  "detected_projects": 4,
  "recommended_excludes": ["node_modules", ".git", ".env"]
}
```

## 6. Exclude Rule API

### `exclude.listRules`

### `exclude.addRule`

Request:

```json
{
  "watch_path_id": "wp_001",
  "pattern": "node_modules",
  "rule_type": "path"
}
```

### `exclude.removeRule`

## 7. Agent Bridge API

### `agentBridge.check`

Checks whether `.worklog/agent-session.md` exists for a project.

Request:

```json
{
  "project_id": "project_001"
}
```

Response:

```json
{
  "exists": true,
  "path": "/Users/declan/Projects/PonsLink/.worklog/agent-session.md",
  "last_modified_at": "2026-05-08T14:58:00+09:00"
}
```

### `agentBridge.createTemplate`

Creates `.worklog/agent-session.md`.

Request:

```json
{
  "project_id": "project_001",
  "overwrite": false
}
```

### `agentBridge.read`

Returns sanitized agent session content.

Response:

```json
{
  "project_id": "project_001",
  "content": "# Agent Session\n...",
  "redaction_summary": {
    "redacted_count": 2
  }
}
```

## 8. Snapshot API

### `snapshot.collectNow`

Collects current evidence snapshot.

Request:

```json
{
  "watch_path_ids": ["wp_001"],
  "include_shell_history": true,
  "include_agent_bridge": true
}
```

Response:

```json
{
  "snapshot_id": "snap_001",
  "file_path": "raw/2026/05/08/150000_snapshot.json",
  "status": "sanitized",
  "hash": "sha256:..."
}
```

### `snapshot.get`

Returns metadata and optionally content.

## 9. Report API

### `report.generate`

Request:

```json
{
  "type": "hourly",
  "snapshot_id": "snap_001",
  "model": "openai/gpt-4o-mini"
}
```

Response:

```json
{
  "job_id": "job_001",
  "status": "pending"
}
```

### `report.list`

Request:

```json
{
  "type": "daily",
  "from": "2026-05-08T00:00:00+09:00",
  "to": "2026-05-09T00:00:00+09:00"
}
```

### `report.open`

Opens report in internal viewer or OS default editor.

### `report.export`

Future:
- markdown
- pdf
- html
- notion

## 10. Settings API

### `settings.get`

### `settings.update`

Request:

```json
{
  "analysis": {
    "interval_minutes": 60,
    "model": "openai/gpt-4o-mini"
  },
  "privacy": {
    "redact_secrets": true,
    "send_raw_diff_to_ai": false
  },
  "app": {
    "auto_launch": true,
    "close_to_tray": true
  }
}
```

## 11. Secret API

### `secret.setOpenRouterKey`

Stores key in OS secure storage.

Request:

```json
{
  "api_key": "sk-or-v1-..."
}
```

### `secret.testOpenRouterKey`

Calls a lightweight OpenRouter validation request.

## 12. Redaction API

### `redaction.preview`

Shows what would be sent to AI, sanitized.

Request:

```json
{
  "snapshot_id": "snap_001"
}
```

Response:

```json
{
  "payload_preview": "...",
  "redaction_summary": {
    "api_keys": 1,
    "tokens": 2,
    "private_paths": 3
  }
}
```

## 13. OpenRouter API Contract

Endpoint:

```txt
POST https://openrouter.ai/api/v1/chat/completions
```

Headers:

```http
Authorization: Bearer <OPENROUTER_API_KEY>
Content-Type: application/json
HTTP-Referer: https://traceforge.local
X-Title: TraceForge
```

Request:

```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "...sanitized snapshot..."}
  ],
  "temperature": 0.2
}
```

Response handling:
- success: save markdown report
- 401: invalid key state
- 429: retry later
- 5xx: pending queue
- invalid content: mark job failed

## 14. Local File API

### Raw Snapshot File

Path:

```txt
raw/YYYY/MM/DD/HH-mm-ss_snapshot.json
```

### Report File

Path:

```txt
reports/YYYY/MM/DD/HH-mm-ss_worklog.md
```

### Project Agent Bridge

Path:

```txt
<project-root>/.worklog/agent-session.md
```

## 15. CLI Compatibility Layer Optional

v4는 설치형 앱이 기본이나, 고급 사용자를 위해 CLI bridge를 제공할 수 있다.

Commands:

```bash
traceforge status
traceforge report now
traceforge watch list
traceforge watch add <path>
traceforge open dashboard
```

CLI는 standalone script가 아니라 설치된 desktop app/core service와 통신하는 보조 인터페이스다.

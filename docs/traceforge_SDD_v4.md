# TraceForge v4 Documentation Set

제품명: **TraceForge**  
서브타이틀: **AI Work Evidence Recorder**  
문서 기준일: 2026-05-08  
핵심 변경: CLI/스크립트 실행형에서 **설치형 크로스플랫폼 데스크톱 앱 + 트레이 백그라운드 에이전트**로 전환

---

# SDD v4: Software Design Document

## 1. 설계 개요

TraceForge v4는 크로스플랫폼 설치형 데스크톱 앱이다. UI는 사용자가 설정과 리포트를 제어하는 역할을 하며, Core Engine은 백그라운드에서 감시, 수집, 분석, 리포트 생성을 수행한다.

## 2. 아키텍처

```txt
┌────────────────────────────────────────────┐
│ Desktop UI                                 │
│ React Views: Dashboard, Settings, Reports  │
└─────────────────────┬──────────────────────┘
                      │ Tauri Commands / IPC
┌─────────────────────▼──────────────────────┐
│ Tray Controller                             │
│ Start/Pause/Status/Notifications            │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│ Core Engine                                  │
│ Watch / Collect / Redact / Analyze / Write  │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│ Local Storage                                │
│ SQLite + Markdown + JSON + Secure Secrets   │
└────────────────────────────────────────────┘
```

## 3. 주요 모듈

### 3.1 AppShell

역할:
- 앱 창 lifecycle 관리
- tray와 dashboard 연결
- OS별 window behavior 처리

Responsibilities:
- close to tray
- quit handling
- open dashboard
- show onboarding

### 3.2 TrayController

역할:
- 트레이 아이콘 상태 표시
- 트레이 메뉴 명령 처리
- OS notification 발송

Tray states:
- running
- paused
- error
- setup_required

Tray menu:

```txt
Open Dashboard
Start Monitoring
Pause Monitoring
Generate Report Now
Open Latest Report
Watch Paths
Settings
Quit
```

### 3.3 OnboardingManager

역할:
- 최초 설정 진행
- Watch mode/path 설정
- OpenRouter API Key 설정
- Redaction policy 확인
- Agent Bridge 생성 여부 확인

### 3.4 SettingsStore

역할:
- config.yaml 읽기/쓰기
- SQLite config sync
- OS secure storage 연동

Config sample:

```yaml
watch:
  mode: workspace
  paths:
    - /Users/declan/Projects
  exclude_paths:
    - node_modules
    - .git
    - .env
  max_depth: 5
  follow_symlinks: false
analysis:
  interval_minutes: 60
  provider: openrouter
  model: openai/gpt-4o-mini
privacy:
  redact_secrets: true
  send_raw_diff_to_ai: false
agent_bridge:
  enabled: true
  create_template: true
```

### 3.5 WatchScopeManager

역할:
- 사용자가 설정한 감시 범위를 검증
- watch mode 적용
- exclude rule 적용
- scan plan 생성

Key methods:

```txt
load_watch_config()
validate_paths()
apply_default_excludes()
build_scan_plan()
check_system_mode_risk()
```

### 3.6 FileWatcher

역할:
- OS별 파일 이벤트 감시

Implementation:
- Windows: ReadDirectoryChangesW or notify wrapper
- macOS: FSEvents
- Linux: inotify
- Rust crate 후보: notify

Features:
- debounce
- ignore rules
- event batching
- symlink policy

### 3.7 GitCollector

역할:
- 감시 경로 내 Git repository 탐색 및 상태 수집

Collected:
- repo path
- branch
- status short
- diff stat
- changed files
- recent commits

### 3.8 ShellHistoryCollector

역할:
- 사용자 동의 시 shell history tail 수집

Supported:
- bash
- zsh
- fish
- PowerShell optional

Design note:
- history file 전체 수집 금지
- tail N개만 수집
- redaction 필수

### 3.9 AgentBridgeReader

역할:
- 프로젝트 내 `.worklog/agent-session.md` 읽기
- 없을 경우 생성 제안
- AI Agent 작업 의도 보완

Methods:

```txt
find_agent_session(project_root)
create_agent_template(project_root)
read_agent_session(project_root)
sanitize_agent_notes(content)
```

### 3.10 AgentConnector Interface

향후 확장용 인터페이스.

```ts
interface AgentConnector {
  id: string;
  displayName: string;
  isAvailable(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  collectSessions(range: TimeRange): Promise<AgentSession[]>;
}
```

Candidate connectors:
- Cursor
- Claude Code
- Codex CLI
- OpenCode
- Aider
- Cline/Roo Code

### 3.11 RedactionEngine

역할:
- 민감정보 마스킹
- AI 전송 payload 검열
- raw store 전 sanitize

Pipeline:

```txt
Input Event
→ Pattern Redaction
→ Path Redaction
→ Command Redaction
→ Payload Size Limit
→ Sanitized Output
```

### 3.12 SnapshotBuilder

역할:
- 여러 collector 결과를 하나의 snapshot으로 조립

Snapshot fields:
- timestamp
- watch scope
- file events
- recent files
- git summaries
- shell commands
- process summary
- agent bridge notes
- redaction summary

### 3.13 AIAnalyzer

역할:
- OpenRouter 호출
- 프롬프트 구성
- AI 응답 검증
- 실패 시 pending queue 등록

Prompt rules:
- 사실/추정 분리
- 로그 밖 내용 단정 금지
- 작업 유형 태깅
- 포트폴리오 문장 생성

### 3.14 ReportWriter

역할:
- Markdown 파일 저장
- report metadata DB 저장
- OS notification 발송

Report types:
- hourly
- daily
- weekly
- project_case_study
- client_report

## 4. 데이터 흐름

### 4.1 Monitoring Flow

```txt
User selects watch path
→ WatchScopeManager validates
→ FileWatcher starts
→ Events buffered
→ Collectors run periodically
→ RedactionEngine sanitizes
→ SnapshotBuilder creates snapshot
→ Snapshot stored locally
→ AIAnalyzer generates worklog
→ ReportWriter saves Markdown
→ Tray notification
```

### 4.2 Manual Report Flow

```txt
Tray: Generate Report Now
→ Collect current snapshot
→ Analyze immediately
→ Save report
→ Open report or notify user
```

### 4.3 Agent Bridge Flow

```txt
Project root detected
→ .worklog/agent-session.md exists?
  → yes: read and sanitize
  → no: if enabled, create template
→ include sanitized content in snapshot
```

## 5. UI 설계 구조

Routes/Views:

```txt
/onboarding
/dashboard
/reports
/report/:id
/watch-paths
/settings/general
/settings/ai
/settings/privacy
/settings/advanced
/about
```

## 6. 파일 저장 설계

```txt
TraceForgeData/
├── traceforge.db
├── config.yaml
├── raw/YYYY/MM/DD/*.json
├── reports/YYYY/MM/DD/*.md
├── pending/*.json
└── logs/app.log
```

## 7. 오류 처리 설계

| Error | Handling |
|---|---|
| API key missing | setup_required state |
| API failed | pending queue |
| watch path missing | warning and disabled path |
| permission denied | skip path and notify |
| redaction failed | block AI send, save local error |
| git missing | degrade gracefully |

## 8. 보안 설계

- API Key는 OS secure storage 사용
- config에는 secret reference만 저장
- redaction 실패 시 AI 호출 차단
- system mode는 two-step confirmation
- agent connector는 connector별 opt-in

## 9. 빌드/패키징 설계

Tauri 기준:

```txt
src-tauri/
  src/
    main.rs
    tray.rs
    watchers.rs
    collectors/
    redaction.rs
    analyzer.rs
    storage.rs
src/
  React UI
```

Package targets:
- Windows: nsis/msi
- macOS: dmg/app
- Linux: AppImage/deb/rpm

## 10. 확장 포인트

- AI Provider abstraction
- Agent Connector plugin
- Report template system
- Export adapter: Notion, GitHub, Google Drive
- Team dashboard future architecture

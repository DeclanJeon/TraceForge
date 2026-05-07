# TraceForge v4 Documentation Set

제품명: **TraceForge**  
서브타이틀: **AI Work Evidence Recorder**  
문서 기준일: 2026-05-08  
핵심 변경: CLI/스크립트 실행형에서 **설치형 크로스플랫폼 데스크톱 앱 + 트레이 백그라운드 에이전트**로 전환

---

# SRD v4: System Requirements Document

## 1. 시스템 개요

TraceForge v4는 Windows/macOS/Linux 설치형 데스크톱 앱이며, 설치 후 트레이에서 백그라운드 에이전트로 동작한다. 시스템은 지정 디렉토리의 작업 증거를 수집하고 AI 분석을 통해 Markdown 작업일지를 생성한다.

## 2. 배포 형태

| Platform | Package | Auto Update | Auto Launch | Tray |
|---|---|---|---|---|
| Windows 10/11 | `.exe`, `.msi` | 지원 예정 | Registry/Startup Task | System Tray |
| macOS 13+ | `.dmg`, `.pkg` | 지원 예정 | LaunchAgent/Login Item | Menu Bar |
| Linux | `.AppImage`, `.deb`, `.rpm` | 제한적 | XDG autostart/systemd user optional | AppIndicator |

## 3. 권장 기술 구조

### 3.1 Desktop Shell

권장: Tauri v2

구성:
- Frontend: React + TypeScript
- Backend: Rust commands/plugins
- Tray: Tauri tray API
- Packaging: Tauri bundler

대안: Electron

### 3.2 Core Engine

Core Engine은 UI와 독립적으로 동작하는 background service 형태여야 한다.

Components:
- WatchScopeManager
- FileWatcher
- GitCollector
- ShellHistoryCollector
- AgentBridgeReader
- RedactionEngine
- SnapshotBuilder
- AIAnalyzer
- ReportWriter
- TrayController
- SettingsStore

## 4. OS별 시스템 요구사항

### 4.1 Windows

Minimum:
- Windows 10 21H2+
- WebView2 Runtime
- Git optional
- PowerShell optional

Requirements:
- System Tray integration
- Credential Manager API
- File watching via native filesystem events
- AppData storage

Default data path:

```txt
%APPDATA%\TraceForge
```

### 4.2 macOS

Minimum:
- macOS 13 Ventura+

Requirements:
- Menu Bar integration
- Keychain storage
- FSEvents file watching
- Application Support storage

Default data path:

```txt
~/Library/Application Support/TraceForge
```

### 4.3 Linux

Minimum:
- Ubuntu 22.04+ 또는 동급 배포판
- AppIndicator compatible desktop environment 권장

Requirements:
- AppIndicator/System Tray fallback
- libsecret optional
- inotify file watching
- XDG config/data path

Default data path:

```txt
~/.local/share/traceforge
~/.config/traceforge
```

## 5. 설치 요구사항

### SRD-INSTALL-001: OS별 설치 패키지

각 OS에 맞는 설치 패키지를 제공해야 한다.

### SRD-INSTALL-002: 앱 등록

설치 후 앱은 OS 앱 런처에 등록되어야 한다.

### SRD-INSTALL-003: 제거 정책

제거 시 사용자는 다음 중 선택할 수 있어야 한다.

- 앱만 제거하고 데이터 보존
- 앱과 로컬 데이터 모두 제거

## 6. 백그라운드 실행 요구사항

### SRD-BG-001: Tray resident process

앱은 창이 닫혀도 트레이에서 상주해야 한다.

### SRD-BG-002: Monitoring lifecycle

Monitoring states:
- Not Configured
- Running
- Paused
- Error
- Offline AI

### SRD-BG-003: Shutdown

완전 종료는 Quit 명령으로만 수행한다.

## 7. 데이터 저장소 요구사항

### 7.1 Local Storage

TraceForge는 SQLite DB와 Markdown/JSON 파일을 함께 사용한다.

Data categories:
- app config
- watch paths
- snapshots metadata
- raw evidence JSON
- generated reports
- AI analysis jobs
- redaction logs

### 7.2 Storage Layout

```txt
TraceForgeData/
├── traceforge.db
├── config.yaml
├── raw/
│   └── YYYY/MM/DD/*.json
├── reports/
│   └── YYYY/MM/DD/*.md
├── projects/
│   └── <project-id>/
├── logs/
│   └── app.log
└── pending/
    └── *.json
```

## 8. 보안 요구사항

### 8.1 Secret Storage

OpenRouter API Key는 config 파일에 평문 저장하지 않는다.

- Windows: Credential Manager
- macOS: Keychain
- Linux: Secret Service/libsecret, fallback encrypted local store

### 8.2 Redaction Pipeline

Data collection pipeline:

```txt
Collector
→ Raw Event Buffer
→ RedactionEngine
→ Sanitized Snapshot
→ Local Store
→ AI Analyzer
```

### 8.3 Permission Policy

- 지정 감시 경로 외 접근 금지
- 전체 시스템 감시는 명시적 동의 필요
- Agent connector는 connector별 opt-in 필요

## 9. 네트워크 요구사항

External network access is only required for AI analysis.

Endpoint:

```txt
https://openrouter.ai/api/v1/chat/completions
```

Network failure behavior:
- Raw snapshot 저장
- Analysis job pending queue 등록
- 사용자에게 tray notification 또는 status 표시

## 10. 성능 요구사항

- 파일 이벤트 debounce 적용
- Git collector는 일정 주기 또는 변경 감지 후 실행
- 대형 디렉토리 제외 규칙 적용
- AI 분석 payload size 제한
- 메모리 누수 방지

Targets:

| Metric | Target |
|---|---:|
| Idle CPU | < 2% |
| Background memory | < 200MB 권장 |
| Report generation latency | < 120 sec |
| Snapshot collection | < 30 sec 일반 프로젝트 기준 |

## 11. 장애 대응 요구사항

Failure cases:
- API key invalid
- network offline
- git command missing
- permission denied
- file watcher overflow
- redaction failure
- AI response invalid

Required behavior:
- 사용자에게 상태 표시
- app.log 기록
- raw evidence 보존
- pending queue 재시도
- report 생성 실패해도 앱 중단 금지

## 12. 업데이트 요구사항

MVP에서는 수동 업데이트를 허용한다. Pro 버전 또는 v1.2 이후 자동 업데이트를 고려한다.

Auto-update policy:
- 업데이트 전 release note 표시
- background agent 안전 종료 후 업데이트
- config/data migration 지원

## 13. 시스템 통합 요구사항

Optional integrations:
- Open file in default editor
- Open folder in file manager
- Git command detection
- Editor detection: Cursor, VSCode, JetBrains optional
- Agent connector plugin interface

## 14. 운영 정책

TraceForge는 개인 사용자의 로컬 환경에서 동작하는 도구를 기본으로 한다. 팀 기능은 향후 별도 동의 기반으로 설계한다.

# TraceForge v4 Documentation Set

제품명: **TraceForge**  
서브타이틀: **AI Work Evidence Recorder**  
문서 기준일: 2026-05-08  
핵심 변경: CLI/스크립트 실행형에서 **설치형 크로스플랫폼 데스크톱 앱 + 트레이 백그라운드 에이전트**로 전환

---

# SRS v4: Software Requirements Specification

## 1. 목적

본 문서는 TraceForge v4의 소프트웨어 요구사항을 정의한다. v4는 스크립트 실행형이 아닌 Windows/macOS/Linux 설치형 데스크톱 애플리케이션이며, 설치 후 트레이에서 백그라운드 감시와 제어를 제공한다.

## 2. 범위

TraceForge는 사용자가 지정한 디렉토리에서 작업 증거를 수집하고, OpenRouter 기반 AI 분석을 통해 Markdown 작업일지를 생성한다. 기본 감시 범위는 특정 프로젝트 또는 워크스페이스 디렉토리이며, 전체 시스템 감시는 고급 모드로 제한한다.

## 3. 사용자 유형

| 사용자 | 설명 |
|---|---|
| 개인 개발자 | 본인의 개발 작업 과정을 기록 |
| AI Agent 사용자 | Cursor, Claude Code, Codex CLI 등과 협업 |
| 프리랜서 | 클라이언트에게 작업 리포트 제공 |
| 취업 준비자 | 포트폴리오 제작 과정 증명 |
| 1인 제품 개발자 | 회고 및 진행 기록 자동화 |

## 4. 기능 요구사항

### SRS-FR-APP-001: 설치형 앱 제공

시스템은 Windows, macOS, Linux에 설치 가능한 데스크톱 애플리케이션으로 제공되어야 한다.

Acceptance Criteria:
- Windows `.exe` 또는 `.msi` 설치 파일 제공
- macOS `.dmg` 또는 `.pkg` 제공
- Linux `.AppImage`, `.deb`, `.rpm` 중 하나 이상 제공
- 설치 후 앱 런처에 등록

Priority: Must

### SRS-FR-APP-002: 트레이 등록

시스템은 실행 중 OS 트레이, 메뉴바, 또는 AppIndicator에 아이콘을 표시해야 한다.

Acceptance Criteria:
- Windows System Tray 지원
- macOS Menu Bar 지원
- Linux AppIndicator/System Tray 지원
- 트레이 메뉴에서 주요 기능 제어 가능

Priority: Must

### SRS-FR-APP-003: 백그라운드 동작

사용자가 메인 창을 닫아도 앱은 트레이에서 백그라운드로 동작해야 한다.

Acceptance Criteria:
- 창 닫기 시 앱 종료가 아니라 트레이 최소화
- Quit 메뉴 선택 시에만 완전 종료
- 백그라운드 감시 유지

Priority: Must

### SRS-FR-APP-004: 자동 시작 옵션

시스템은 OS 로그인 시 자동 시작 옵션을 제공해야 한다.

Acceptance Criteria:
- Onboarding 또는 Settings에서 enable/disable 가능
- OS별 자동 시작 방식 적용
- 기본값은 사용자 선택

Priority: Should

### SRS-FR-ONBOARD-001: 최초 설정 마법사

시스템은 최초 실행 시 Onboarding Wizard를 표시해야 한다.

Steps:
1. 제품 소개
2. Watch Mode 선택
3. 감시 디렉토리 선택
4. 제외 경로 확인
5. OpenRouter API Key 입력
6. 분석 주기 선택
7. `.worklog` Agent Bridge 활성화 선택
8. Privacy/Redaction 확인
9. 완료

Priority: Must

### SRS-FR-WATCH-001: 감시 범위 선택

시스템은 사용자가 감시 범위를 선택할 수 있도록 해야 한다.

Supported Modes:
- project
- workspace
- home
- system advanced

Default:
- project 또는 workspace

Priority: Must

### SRS-FR-WATCH-002: 특정 디렉토리 기본 감시

시스템의 기본 동작은 사용자가 지정한 특정 디렉토리만 감시하는 것이다.

Acceptance Criteria:
- 지정 경로 밖 파일 수집 금지
- 사용자 승인 없이 전체 시스템 스캔 금지
- 경로별 enabled/disabled 설정 가능

Priority: Must

### SRS-FR-WATCH-003: 다중 감시 경로

시스템은 여러 감시 경로를 지원해야 한다.

Acceptance Criteria:
- 경로 추가/삭제 가능
- 경로별 mode/tag 설정 가능
- 중복 경로 탐지

Priority: Should

### SRS-FR-WATCH-004: 제외 경로 관리

시스템은 기본 제외 경로와 사용자 정의 제외 경로를 지원해야 한다.

Default Excludes:
- node_modules
- .git
- .next
- dist
- build
- .venv
- venv
- .cache
- .ssh
- .gnupg
- .env

Priority: Must

### SRS-FR-WATCH-005: System Mode 경고

사용자가 전체 시스템 감시를 선택할 경우 시스템은 위험 경고와 명시적 확인 절차를 제공해야 한다.

Acceptance Criteria:
- 2단계 확인
- 강한 exclude rule 자동 적용
- 권장하지 않는 모드임을 표시

Priority: Must

### SRS-FR-COLLECT-001: 파일 변경 수집

시스템은 감시 경로 내 파일 변경 이벤트를 수집해야 한다.

Events:
- create
- modify
- delete
- rename

Priority: Must

### SRS-FR-COLLECT-002: Git 정보 수집

시스템은 감시 경로 내 Git repository를 탐색하고 Git 상태를 수집해야 한다.

Data:
- branch
- status short
- diff stat
- recent commits
- changed files

Priority: Must

### SRS-FR-COLLECT-003: Shell History 수집

시스템은 사용자가 동의한 경우 shell history tail을 수집해야 한다.

Supported:
- bash
- zsh
- fish
- PowerShell optional

Priority: Should

### SRS-FR-COLLECT-004: `.worklog/agent-session.md` 수집

시스템은 프로젝트 루트의 `.worklog/agent-session.md` 파일을 수집하여 AI 분석에 포함해야 한다.

Acceptance Criteria:
- 파일이 있으면 읽기
- 없으면 생성 제안
- 사용자 동의 시 템플릿 생성
- AI 전송 전 redaction 적용

Priority: Must

### SRS-FR-AGENT-001: Agent Bridge 템플릿 생성

시스템은 사용자의 선택에 따라 `.worklog/agent-session.md` 템플릿을 생성해야 한다.

Priority: Must

### SRS-FR-AGENT-002: Agent Connector 확장 포인트

시스템은 향후 Cursor, Claude Code, Codex CLI, OpenCode 등의 Agent Connector를 추가할 수 있는 인터페이스를 가져야 한다.

Priority: Should

### SRS-FR-PRIVACY-001: Redaction Engine

시스템은 Raw Snapshot 저장 전 및 AI API 전송 전 민감정보를 마스킹해야 한다.

Targets:
- API Key
- Bearer Token
- JWT
- Password
- Private Key
- DB URL
- SSH Key Path

Priority: Must

### SRS-FR-PRIVACY-002: Privacy Preview

시스템은 AI로 전송될 데이터의 요약 preview를 사용자가 확인할 수 있어야 한다.

Priority: Should

### SRS-FR-AI-001: OpenRouter 연동

시스템은 OpenRouter Chat Completions API를 사용하여 작업일지를 생성해야 한다.

Priority: Must

### SRS-FR-AI-002: AI 출력 품질 제한

AI 분석 결과는 로그 기반 사실과 추정을 분리해야 한다.

Rules:
- 로그에 없는 사실 단정 금지
- 추정은 명시적으로 표시
- 포트폴리오 문구는 과장 금지

Priority: Must

### SRS-FR-REPORT-001: Markdown 작업일지 생성

시스템은 AI 분석 결과를 Markdown 파일로 저장해야 한다.

Priority: Must

### SRS-FR-REPORT-002: Report 열기

트레이 및 Dashboard에서 최근 작업일지를 열 수 있어야 한다.

Priority: Must

### SRS-FR-UI-001: Dashboard 제공

시스템은 기본 Dashboard 화면을 제공해야 한다.

Sections:
- Monitoring Status
- Watched Projects
- Latest Reports
- Evidence Summary
- AI Status
- Privacy Status

Priority: Must

### SRS-FR-UI-002: Settings 제공

시스템은 설정 화면을 제공해야 한다.

Sections:
- General
- Watch Paths
- AI Provider
- Privacy
- Reports
- Notifications
- Advanced

Priority: Must

## 5. 비기능 요구사항

### SRS-NFR-001: Cross-platform

Windows/macOS/Linux에서 동일한 핵심 기능을 제공해야 한다.

Priority: Must

### SRS-NFR-002: Local-first

Raw data와 generated reports는 기본적으로 로컬에 저장되어야 한다.

Priority: Must

### SRS-NFR-003: Low resource usage

백그라운드 상태에서 CPU와 메모리 사용량이 과도하지 않아야 한다.

Target:
- Idle CPU 평균 2% 이하
- 메모리 200MB 이하 권장

Priority: Should

### SRS-NFR-004: Security

API Key는 OS secure storage에 저장해야 한다.

Candidates:
- Windows Credential Manager
- macOS Keychain
- Linux Secret Service / libsecret

Priority: Must

### SRS-NFR-005: Reliability

OpenRouter API 실패 시 Raw Snapshot은 보존되고 pending analysis queue에 저장되어야 한다.

Priority: Must

### SRS-NFR-006: Accessibility

기본 UI는 키보드 네비게이션과 명확한 대비를 지원해야 한다.

Priority: Should

## 6. 제약사항

- 키로깅 금지
- 화면 녹화 기본 비활성화
- 전체 시스템 감시 기본 금지
- 사용자 동의 없는 Agent 내부 로그 수집 금지
- 감시 대상은 사용자 설정으로 명확히 표시

# TraceForge v4 Documentation Set

제품명: **TraceForge**  
서브타이틀: **AI Work Evidence Recorder**  
문서 기준일: 2026-05-08  
핵심 변경: CLI/스크립트 실행형에서 **설치형 크로스플랫폼 데스크톱 앱 + 트레이 백그라운드 에이전트**로 전환

---

# PRD v4: Product Requirements Document

## 1. 제품 개요

TraceForge는 사용자가 지정한 프로젝트 디렉토리에서 발생하는 파일 변경, Git 활동, 명령어 기록, 빌드/테스트 로그, `.worklog/agent-session.md`를 수집하고 AI로 분석하여 신뢰 가능한 작업일지와 포트폴리오용 제작 과정 문서를 생성하는 **로컬 우선 데스크톱 앱**이다.

v4부터 제품은 단순 Python 스크립트나 CLI 데몬이 아니라, Windows, macOS, Linux에 설치되는 **데스크톱 설치형 앱**으로 정의한다. 설치 후 앱은 OS 트레이/메뉴바/시스템 인디케이터에 등록되어 백그라운드에서 동작하며, 사용자는 트레이 메뉴와 설정 창을 통해 감시 범위, AI 모델, 작업일지 생성 주기, 개인정보 보호 정책을 제어할 수 있다.

## 2. 제품 포지셔닝

### 2.1 핵심 포지션

> TraceForge는 AI 시대의 작업 과정 증명 도구다.

### 2.2 피해야 할 포지션

- 직원 감시 도구
- 키로거
- 화면 녹화 감시 앱
- 근태 관리 앱
- 전체 시스템 무단 수집 앱

### 2.3 지향하는 포지션

- 개인 개발자의 작업 증명 블랙박스
- 프리랜서용 클라이언트 리포트 생성기
- AI Agent 협업 과정 기록 도구
- 포트폴리오 제작 과정 자동 문서화 앱
- 로컬 우선 개인 생산성 앱

## 3. 문제 정의

AI Agent와 바이브코딩의 확산으로 누구나 빠르게 결과물을 만들 수 있게 되었다. 그러나 채용자, 클라이언트, 협업자는 이제 단순 결과물보다 다음을 확인하고 싶어 한다.

- 어떤 문제를 풀었는가?
- 어떤 방식으로 AI를 활용했는가?
- 어떤 파일을 어떻게 수정했는가?
- 사용자는 AI가 만든 코드를 검토하고 구조화했는가?
- 결과물 뒤에 실제 설계와 판단 과정이 존재하는가?

기존 포트폴리오는 완성된 결과물만 보여준다. TraceForge는 결과물의 뒤편에 있는 작업 흐름, 시행착오, 설계 판단, AI 협업 흔적을 작업일지와 케이스 스터디로 변환한다.

## 4. 제품 목표

## 4.1 사용자 목표

- 직접 일지를 쓰지 않아도 작업 과정이 자동으로 남는다.
- 프로젝트별 작업 흐름을 시간순으로 확인한다.
- AI Agent와 협업한 흔적을 안전하게 기록한다.
- 포트폴리오, 클라이언트 보고, 회고 문서에 활용한다.
- 감시당하는 느낌 없이 사용자가 직접 수집 범위를 제어한다.

## 4.2 제품 목표

- 설치 후 트레이에서 항상 제어 가능한 백그라운드 에이전트 제공
- Windows, macOS, Linux 전부 지원
- 기본값은 특정 디렉토리 또는 워크스페이스 감시
- 전체 시스템 감시는 Advanced Mode로만 제공하며 명시적 경고 필요
- `.worklog/agent-session.md`를 통해 AI Agent 작업 의도를 보완
- OpenRouter 기반 AI 분석으로 Markdown 작업일지 생성
- Raw Evidence와 AI Summary를 분리 저장

## 5. 플랫폼 요구사항

TraceForge는 다음 운영체제를 지원해야 한다.

| OS | 지원 방식 | 트레이 위치 | 설치 패키지 |
|---|---|---|---|
| Windows 10/11 | Native desktop app | System Tray | `.exe`, `.msi` |
| macOS 13+ | Native desktop app | Menu Bar | `.dmg`, `.pkg` |
| Linux Ubuntu/Debian/Fedora 계열 | Desktop app | AppIndicator/System Tray | `.AppImage`, `.deb`, `.rpm` |

### 5.1 권장 기술 스택

초기 MVP는 다음 중 하나를 선택한다.

#### 후보 A: Tauri v2

- Rust backend + WebView frontend
- 낮은 메모리 사용량
- Windows/macOS/Linux 패키징 지원
- Tray/menu 지원
- 파일시스템 감시를 Rust 레이어에서 안정적으로 처리 가능

#### 후보 B: Electron

- Node.js 기반 구현 속도 빠름
- Tray, auto-launch, auto-update 생태계 풍부
- 메모리 사용량 높음

### 5.2 추천

v4 기준 추천은 **Tauri v2**다. TraceForge는 백그라운드 에이전트 성격이 강하므로 가볍고 OS 통합이 좋은 구조가 적합하다. 다만 빠른 MVP만 고려하면 Electron도 가능하다.

## 6. 핵심 사용자 플로우

### 6.1 최초 설치 플로우

1. 사용자가 OS별 설치 파일을 다운로드한다.
2. 설치를 완료한다.
3. TraceForge가 실행되고 트레이에 아이콘이 등록된다.
4. Onboarding Wizard가 열린다.
5. 사용자는 감시할 디렉토리를 선택한다.
6. 앱이 기본 제외 경로를 제안한다.
7. 사용자는 OpenRouter API Key와 모델을 입력한다.
8. Redaction 정책을 확인한다.
9. `.worklog/agent-session.md` 생성 여부를 선택한다.
10. 백그라운드 감시가 시작된다.

### 6.2 일반 사용 플로우

1. 사용자는 평소처럼 Cursor, VSCode, Claude Code, Codex CLI 등으로 작업한다.
2. TraceForge는 지정된 디렉토리만 감시한다.
3. 파일 변경, Git 상태, 명령어 기록, `.worklog` 내용을 수집한다.
4. 설정된 주기마다 AI가 작업일지를 생성한다.
5. 트레이 알림으로 작업일지 생성 완료를 알려준다.
6. 사용자는 트레이 메뉴에서 최신 작업일지를 열 수 있다.

### 6.3 트레이 컨트롤 플로우

트레이 메뉴는 다음을 제공한다.

- Start Monitoring
- Pause Monitoring
- Generate Report Now
- Open Today’s Worklog
- Open Dashboard
- Settings
- Privacy & Redaction
- Watch Paths
- Quit

## 7. Watch Scope Policy

### 7.1 기본 정책

기본값은 **Project Mode** 또는 **Workspace Mode**다. 사용자가 선택한 디렉토리 밖은 수집하지 않는다.

### 7.2 Watch Modes

| Mode | 설명 | 기본 노출 | 권장도 |
|---|---|---:|---:|
| project | 단일 프로젝트 디렉토리 감시 | Yes | High |
| workspace | 여러 프로젝트가 있는 상위 디렉토리 감시 | Yes | High |
| home | 홈 디렉토리 일부 감시 | Yes | Medium |
| system | 전체 시스템 감시 | Advanced | Low |

### 7.3 System Mode 정책

System Mode는 기본 UI에서 숨기거나 고급 설정에 배치한다. 활성화 시 다음 경고를 표시한다.

> 전체 시스템 감시는 시스템 파일, 민감정보, 캐시 파일, 권한 오류를 포함할 수 있습니다. 개인 작업 증명 목적이라면 Project 또는 Workspace Mode를 권장합니다.

## 8. `.worklog` Agent Bridge

TraceForge는 AI Agent 내부 로그를 기본적으로 직접 수집하지 않는다. 대신 프로젝트 루트에 `.worklog/agent-session.md`를 생성하여 AI Agent가 스스로 작업 의도, 계획, 변경 사항을 기록할 수 있게 한다.

### 8.1 기본 구조

```txt
.project-root/
├── .worklog/
│   ├── agent-session.md
│   ├── commands.log
│   ├── build.log
│   ├── notes.md
│   └── snapshots/
```

### 8.2 Agent Session 템플릿

```md
# Agent Session

## Goal

## User Request Summary

## Agent Plan

## Modified Files

## Commands

## Errors / Blockers

## Completed Work

## Remaining Work

## Portfolio Summary
```

### 8.3 정책

- `.worklog` 생성은 사용자 동의 기반
- 프롬프트 전문 수집은 기본 비활성화
- Agent 내부 로그는 Connector 기능에서만 명시적 동의 후 연동

## 9. 핵심 기능 요구사항

### 9.1 Desktop Installer

- OS별 설치 패키지 제공
- 설치 후 앱 런처 등록
- 트레이/메뉴바 아이콘 등록
- 자동 시작 옵션 제공
- 제거 시 로컬 데이터 보존/삭제 선택

### 9.2 Tray Background Agent

- 앱 창을 닫아도 트레이에서 계속 동작
- 감시 시작/중지/일시정지 가능
- 최근 생성 작업일지 열기 가능
- 상태 아이콘 표시: Running, Paused, Error, Needs Setup
- OS 알림 제공

### 9.3 Dashboard

- 오늘의 작업 요약
- 감시 중인 프로젝트
- 최근 작업일지
- AI 분석 상태
- 개인정보 마스킹 상태
- 수집 로그 상태

### 9.4 Settings

- Watch Paths 관리
- Watch Mode 설정
- 제외 경로 설정
- AI Provider/OpenRouter 설정
- 분석 주기 설정
- Redaction 설정
- Auto Launch 설정
- Notification 설정
- 데이터 보존 기간 설정

### 9.5 Evidence Collection

- 파일 변경 이벤트
- 최근 수정 파일
- Git status
- Git diff stat
- 최근 commit
- Shell history tail
- Process summary
- `.worklog/agent-session.md`
- build/test logs optional

### 9.6 AI Analysis

- OpenRouter API 사용
- 추정과 사실 분리
- 로그에 없는 사실 단정 금지
- 작업 유형 분류
- 다음 액션 생성
- 포트폴리오용 요약 생성

### 9.7 Report Generation

- Hourly Worklog
- Daily Report
- Weekly Report
- Project Case Study
- Client Report
- Portfolio Bullet Points

## 10. 개인정보 보호 정책

### 10.1 원칙

- Local-first
- User-controlled scope
- No keylogging
- No screen recording by default
- No hidden monitoring
- AI 전송 전 Redaction 필수

### 10.2 기본 제외 경로

```txt
node_modules
.git
.next
dist
build
.venv
venv
.cache
.ssh
.gnupg
.env
.local/share/Trash
Downloads
Pictures
Videos
```

### 10.3 마스킹 대상

- API Key
- Bearer Token
- JWT
- Password
- Private Key
- DB URL
- SSH URL
- 이메일/전화번호 optional

## 11. 수익화 전략

| 플랜 | 타겟 | 가격 | 기능 |
|---|---|---:|---|
| Free Local | 개인 개발자 | 무료 | 로컬 감시, 시간별 작업일지 |
| Pro | 프리랜서/취준생 | 월 $5~9 | 포트폴리오 생성, Daily/Weekly Report |
| Freelancer | 클라이언트 업무 | 월 $9~19 | Client Report, export templates |
| Team | 소규모 팀 | 유저당 $10~20 | 동의 기반 팀 대시보드 |

## 12. 성공 지표

- 설치 후 Onboarding 완료율 70% 이상
- 첫 작업일지 생성 성공률 90% 이상
- 7일 유지율 35% 이상
- 사용자가 직접 수정 없이 활용 가능한 작업일지 비율 70% 이상
- Redaction 실패 신고 0건 목표

## 13. MVP 범위

### 포함

- Tauri/Electron 기반 설치형 앱
- Windows/macOS/Linux 설치 패키지
- Tray background agent
- Onboarding Wizard
- Watch Path 설정
- Project/Workspace Mode
- `.worklog/agent-session.md` 생성/읽기
- Git/File/Shell 수집
- OpenRouter 분석
- Markdown 저장
- Dashboard 기본 화면
- Settings 기본 화면

### 제외

- 팀 모니터링
- 화면 녹화
- 키로깅
- Agent 내부 로그 자동 수집
- 클라우드 동기화
- 모바일 앱

## 14. 로드맵

### v1.0 Desktop MVP

설치형 앱, 트레이, 지정 디렉토리 감시, 작업일지 생성.

### v1.1 Privacy Hardening

Redaction 테스트, exclude rule 강화, privacy preview.

### v1.2 Portfolio Generator

프로젝트별 Case Study, README 섹션, Upwork/Fiverr 문장 생성.

### v1.3 Agent Connectors

Cursor, Claude Code, Codex CLI, OpenCode 로그 연동.

### v2.0 Dashboard Pro

작업 타임라인, 통계, 프로젝트별 활동량, export 기능.

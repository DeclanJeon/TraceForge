# TraceForge v4 Documentation Set

제품명: **TraceForge**  
서브타이틀: **AI Work Evidence Recorder**  
문서 기준일: 2026-05-08  
핵심 변경: CLI/스크립트 실행형에서 **설치형 크로스플랫폼 데스크톱 앱 + 트레이 백그라운드 에이전트**로 전환

---

# Wireframe Specification v1

## 1. 목적

본 문서는 TraceForge 데스크톱 앱의 주요 화면, 트레이 메뉴, 사용자 흐름을 와이어프레임 수준에서 정의한다. 실제 UI 디자인 전 정보 구조와 인터랙션을 고정하는 것이 목적이다.

## 2. 주요 화면 목록

| 화면 | 목적 |
|---|---|
| Tray Menu | 백그라운드 상태 확인 및 빠른 제어 |
| Onboarding Wizard | 최초 설정 |
| Dashboard | 현재 상태와 최근 작업일지 확인 |
| Watch Paths | 감시 경로 관리 |
| Reports | 작업일지 목록 |
| Report Detail | 개별 작업일지 읽기 |
| Settings | 앱/AI/보안/알림 설정 |
| Privacy Preview | AI 전송 데이터 확인 |
| Error/Needs Setup | 오류와 설정 필요 상태 안내 |

## 3. Tray Menu Wireframe

```txt
┌──────────────────────────────────┐
│ TraceForge              ● Running│
├──────────────────────────────────┤
│ Open Dashboard                   │
│ Open Latest Worklog              │
│ Generate Report Now              │
├──────────────────────────────────┤
│ Pause Monitoring                 │
│ Watch Paths                      │
│ Privacy Preview                  │
├──────────────────────────────────┤
│ Settings                         │
│ About TraceForge                 │
│ Quit                             │
└──────────────────────────────────┘
```

### 상태별 아이콘

| 상태 | 표시 |
|---|---|
| Running | 초록 점 |
| Paused | 노란 점 |
| Error | 빨간 점 |
| Needs Setup | 회색 점 |
| AI Offline | 보라/파란 경고 점 |

## 4. Onboarding Wizard

### 4.1 Step 1: Welcome

```txt
┌──────────────────────────────────────────────┐
│ TraceForge                                   │
│ AI Work Evidence Recorder                    │
│                                              │
│ 결과물이 아니라, 만들어진 과정을 기록합니다. │
│                                              │
│ [Get Started]                                │
└──────────────────────────────────────────────┘
```

### 4.2 Step 2: Watch Mode 선택

```txt
┌──────────────────────────────────────────────┐
│ 감시 범위를 선택하세요                       │
│                                              │
│ ○ Project Mode                               │
│   단일 프로젝트만 감시합니다. 가장 안전합니다.│
│                                              │
│ ● Workspace Mode                             │
│   여러 프로젝트가 있는 폴더를 감시합니다.     │
│                                              │
│ ○ Home Mode                                  │
│   홈 디렉토리 일부를 감시합니다.              │
│                                              │
│ Advanced                                     │
│ ○ System Mode                                │
│   권장하지 않음. 명시적 확인 필요.            │
│                                              │
│ [Back]                              [Next]   │
└──────────────────────────────────────────────┘
```

### 4.3 Step 3: 경로 선택

```txt
┌──────────────────────────────────────────────┐
│ 감시할 디렉토리를 선택하세요                 │
│                                              │
│ Path                                         │
│ ┌──────────────────────────────────────────┐ │
│ │ /Users/declan/Projects                  │ │
│ └──────────────────────────────────────────┘ │
│ [Browse...]                                  │
│                                              │
│ Detected Projects                            │
│ - PonsLink                                   │
│ - WorklogBlackbox                            │
│ - Mirror                                     │
│                                              │
│ [Back]                              [Next]   │
└──────────────────────────────────────────────┘
```

### 4.4 Step 4: 제외 경로 확인

```txt
┌──────────────────────────────────────────────┐
│ 기본 제외 경로                               │
│                                              │
│ ☑ node_modules    ☑ .git       ☑ .env        │
│ ☑ .cache          ☑ dist       ☑ build       │
│ ☑ .ssh            ☑ .gnupg     ☑ .venv       │
│                                              │
│ Custom Exclude                               │
│ ┌──────────────────────┐ [Add]               │
│ │                      │                     │
│                                              │
│ [Back]                              [Next]   │
└──────────────────────────────────────────────┘
```

### 4.5 Step 5: AI Provider

```txt
┌──────────────────────────────────────────────┐
│ AI 분석 설정                                 │
│                                              │
│ Provider                                     │
│ [OpenRouter ▼]                               │
│                                              │
│ API Key                                      │
│ ┌──────────────────────────────────────────┐ │
│ │ sk-or-v1-••••••••••••••                 │ │
│ └──────────────────────────────────────────┘ │
│ [Test Connection]                            │
│                                              │
│ Model                                        │
│ [openai/gpt-4o-mini ▼]                       │
│                                              │
│ [Back]                              [Next]   │
└──────────────────────────────────────────────┘
```

### 4.6 Step 6: Agent Bridge

```txt
┌──────────────────────────────────────────────┐
│ AI Agent 작업 수첩                           │
│                                              │
│ ☑ 프로젝트에 .worklog/agent-session.md 생성  │
│                                              │
│ AI Agent가 작업 목표, 계획, 수정 파일,       │
│ 막힌 점을 기록할 수 있는 공통 작업 수첩입니다.│
│                                              │
│ 기본적으로 Cursor/Claude/Codex 내부 대화는   │
│ 수집하지 않습니다.                           │
│                                              │
│ [Back]                              [Next]   │
└──────────────────────────────────────────────┘
```

### 4.7 Step 7: Privacy 확인

```txt
┌──────────────────────────────────────────────┐
│ Privacy & Redaction                          │
│                                              │
│ TraceForge는 다음을 하지 않습니다.           │
│                                              │
│ ✓ 키 입력 기록 안 함                         │
│ ✓ 화면 녹화 안 함                            │
│ ✓ 지정 디렉토리 밖 수집 안 함                │
│ ✓ API Key/Token 마스킹                       │
│                                              │
│ [View Redaction Rules]                       │
│                                              │
│ [Back]                         [Start]       │
└──────────────────────────────────────────────┘
```

## 5. Dashboard Wireframe

```txt
┌────────────────────────────────────────────────────────────┐
│ TraceForge                                      ● Running   │
├────────────────────────────────────────────────────────────┤
│ Today                                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│ │ 3 Reports    │ │ 4 Projects   │ │ Last Analysis 14:00  │ │
│ └──────────────┘ └──────────────┘ └──────────────────────┘ │
│                                                            │
│ Monitoring                                                 │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Workspace: /Users/declan/Projects                     │ │
│ │ PonsLink            Active  12 files changed           │ │
│ │ TraceForge          Active   8 files changed           │ │
│ │ Mirror              Idle     0 files changed           │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Latest Worklogs                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 14:00  PonsLink       WebRTC transport updates         │ │
│ │ 13:00  TraceForge     Tray app architecture design     │ │
│ │ 12:00  TraceForge     PRD/SRS/SDD update               │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Generate Report Now] [Open Reports] [Settings]            │
└────────────────────────────────────────────────────────────┘
```

## 6. Watch Paths 화면

```txt
┌────────────────────────────────────────────────────────────┐
│ Watch Paths                                                │
├────────────────────────────────────────────────────────────┤
│ Mode: [Workspace ▼]                                        │
│                                                            │
│ Watched Paths                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ ☑ /Users/declan/Projects                [Edit] [Remove]│ │
│ │ ☑ /Users/declan/ClientWork              [Edit] [Remove]│ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Add Path]                                                 │
│                                                            │
│ Exclude Rules                                              │
│ node_modules, .git, .env, .cache, dist, build              │
│ [Edit Exclude Rules]                                       │
└────────────────────────────────────────────────────────────┘
```

## 7. Reports 화면

```txt
┌────────────────────────────────────────────────────────────┐
│ Reports                                                    │
├────────────────────────────────────────────────────────────┤
│ Filter: [Today ▼] Type: [All ▼] Project: [All ▼]           │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 2026-05-08 14:00  Hourly  PonsLink      Open  Export   │ │
│ │ 2026-05-08 13:00  Hourly  TraceForge    Open  Export   │ │
│ │ 2026-05-08 Daily  Daily   All Projects  Open  Export   │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Generate Daily Report] [Generate Case Study]              │
└────────────────────────────────────────────────────────────┘
```

## 8. Report Detail 화면

```txt
┌────────────────────────────────────────────────────────────┐
│ Worklog: 2026-05-08 14:00                    [Export]      │
├────────────────────────────────────────────────────────────┤
│ Project: PonsLink                                          │
│ Evidence: snapshot_2026-05-08_14-00.json                   │
│                                                            │
│ # 작업일지                                                 │
│                                                            │
│ ## 작업 요약                                               │
│ ...                                                        │
│                                                            │
│ ## 개발 의도 추정                                          │
│ ...                                                        │
│                                                            │
│ ## 다음 액션                                               │
│ ...                                                        │
│                                                            │
│ [Open Raw Evidence] [Open Markdown File]                   │
└────────────────────────────────────────────────────────────┘
```

## 9. Settings 화면

```txt
┌────────────────────────────────────────────────────────────┐
│ Settings                                                   │
├──────────────┬─────────────────────────────────────────────┤
│ General      │ Start on login          [toggle]            │
│ Watch Paths  │ Close to tray           [toggle]            │
│ AI Provider  │ Analysis interval       [60 min ▼]          │
│ Privacy      │ Notifications           [toggle]            │
│ Reports      │                                             │
│ Advanced     │                                             │
└──────────────┴─────────────────────────────────────────────┘
```

## 10. Privacy Preview 화면

```txt
┌────────────────────────────────────────────────────────────┐
│ Privacy Preview                                            │
├────────────────────────────────────────────────────────────┤
│ AI로 전송될 데이터 미리보기                               │
│                                                            │
│ Redacted Items                                             │
│ - API keys: 1                                              │
│ - Tokens: 2                                                │
│ - Private paths: 3                                         │
│                                                            │
│ Payload Preview                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ { sanitized snapshot preview... }                      │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Cancel] [Send to AI]                                      │
└────────────────────────────────────────────────────────────┘
```

## 11. 알림 UX

### Report Generated

```txt
TraceForge
새 작업일지가 생성되었습니다.
PonsLink · 14:00
[Open]
```

### Error

```txt
TraceForge needs attention
OpenRouter API 연결에 실패했습니다.
[Open Settings]
```

## 12. Empty States

### No Watch Path

```txt
아직 감시 중인 작업 공간이 없습니다.
작업 과정을 기록할 프로젝트 폴더를 선택하세요.
[Add Watch Path]
```

### No Reports

```txt
아직 생성된 작업일지가 없습니다.
작업을 시작하면 TraceForge가 자동으로 기록합니다.
[Generate Report Now]
```

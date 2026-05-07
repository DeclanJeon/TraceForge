# TraceForge v4 Documentation Set

제품명: **TraceForge**  
서브타이틀: **AI Work Evidence Recorder**  
문서 기준일: 2026-05-08  
핵심 변경: CLI/스크립트 실행형에서 **설치형 크로스플랫폼 데스크톱 앱 + 트레이 백그라운드 에이전트**로 전환

---

# Design Specification v1

## 1. 디자인 목표

TraceForge의 디자인은 “감시 앱”이 아니라 “작업 증명 도구”라는 인상을 줘야 한다. 사용자가 불안하지 않고, 자신이 통제하고 있다는 느낌을 받아야 한다.

핵심 디자인 키워드:

- Calm Control
- Evidence, not Surveillance
- Local-first Trust
- Builder's Workshop
- Quiet Background Companion

## 2. 디자인 원칙

### 2.1 사용자가 통제한다

- 감시 경로를 항상 명확히 보여준다.
- 현재 수집 상태를 숨기지 않는다.
- Pause/Stop이 쉽게 보여야 한다.
- 전체 시스템 감시는 강하게 경고한다.

### 2.2 결과보다 근거를 보여준다

- 작업일지에는 Raw Evidence 링크를 제공한다.
- AI가 추정한 내용과 실제 로그 기반 사실을 분리한다.
- “증거” 섹션을 시각적으로 구분한다.

### 2.3 조용하지만 존재감 있게

- 트레이 앱이므로 과도한 알림 금지
- 기본 알림은 report generated/error 중심
- Dashboard는 차분한 상태판처럼 구성

## 3. 브랜드 톤

### 3.1 제품명

TraceForge

### 3.2 영문 태그라인

```txt
Forge proof from your work traces.
```

### 3.3 한국어 태그라인

```txt
작업의 흔적을 증명 가능한 기록으로.
```

### 3.4 톤

- 신뢰감 있음
- 개발자 친화적
- 차분함
- 과장 없음
- 약간의 공방/대장간 은유 허용

## 4. Visual Identity

### 4.1 메타포

TraceForge의 시각적 메타포는 다음을 조합한다.

- Trace: 선, 발자국, 타임라인
- Forge: 금속, 공방, 정제, 단단함
- Evidence: 문서, 봉인, 해시, 체크마크
- Background Agent: 작은 불씨, 조용한 등대

### 4.2 로고 아이디어

- `T`와 `F`를 합친 모노그램
- 타임라인 선 위에 작은 forge spark
- 문서 + 체크마크 + 점선 흔적
- 블랙박스 형태의 사각형 안에 빛나는 선

### 4.3 아이콘 상태

| 상태 | 아이콘 컨셉 |
|---|---|
| Running | 작은 녹색 불씨/점 |
| Paused | 노란 일시정지 점 |
| Error | 빨간 경고 삼각형 |
| Needs Setup | 회색 빈 원 |
| AI Offline | 파란 연결 끊김 표시 |

## 5. Color System

컬러는 구현 단계에서 브랜드 키트로 확정한다. 아래는 권장 토큰이다.

### 5.1 Semantic Colors

| Token | 용도 |
|---|---|
| `bg.primary` | 기본 배경 |
| `bg.elevated` | 카드/패널 |
| `text.primary` | 주요 텍스트 |
| `text.secondary` | 보조 텍스트 |
| `border.subtle` | 경계선 |
| `accent.primary` | 주요 액션 |
| `status.running` | 실행 중 |
| `status.paused` | 일시정지 |
| `status.error` | 오류 |
| `status.warning` | 경고 |

### 5.2 Theme

- Light mode 지원
- Dark mode 지원
- OS theme follow 지원

## 6. Typography

### 6.1 권장 폰트

OS 기본 시스템 폰트 사용.

- Windows: Segoe UI
- macOS: SF Pro
- Linux: Inter, Noto Sans, system sans
- Monospace: JetBrains Mono, SF Mono, Consolas, system monospace

### 6.2 Type Scale

| Token | Size | 용도 |
|---|---:|---|
| display | 28-32 | Welcome title |
| h1 | 24 | page title |
| h2 | 18-20 | section title |
| body | 14-16 | main content |
| caption | 12-13 | metadata |
| code | 13-14 | paths/logs |

## 7. Layout System

### 7.1 Window Size

Minimum:

```txt
900 x 640
```

Recommended:

```txt
1080 x 720
```

### 7.2 Grid

- 8px spacing system
- Card padding: 16-24px
- Sidebar width: 220px
- Content max width: 960px

### 7.3 Navigation

Settings는 좌측 사이드바 구조를 사용한다.

Main views는 top area + card grid + list structure.

## 8. Component Specification

### 8.1 Status Pill

용도: Running, Paused, Error 상태 표시

Fields:
- dot icon
- label
- optional detail

### 8.2 Watch Path Card

Fields:
- path
- mode
- enabled toggle
- detected projects count
- latest activity
- edit/remove actions

### 8.3 Project Activity Row

Fields:
- project name
- status
- changed files count
- last active time
- quick open report

### 8.4 Report List Item

Fields:
- report time
- report type
- project name
- AI summary one-liner
- evidence link
- open/export actions

### 8.5 Evidence Badge

Purpose:
- AI summary가 어떤 raw snapshot에 기반했는지 표시

States:
- verified local snapshot
- redacted
- pending
- blocked

### 8.6 Privacy Warning Box

System Mode, raw diff 전송, prompt capture 같은 고위험 옵션에서 사용.

Tone:
- 명확함
- 겁주기보다 선택권 강조

## 9. Screen Design Requirements

### 9.1 Dashboard

Hierarchy:
1. Monitoring Status
2. Today Summary
3. Active Projects
4. Latest Reports
5. Quick Actions

Dashboard에서 사용자가 5초 안에 알아야 하는 것:

- 현재 기록 중인가?
- 어떤 폴더를 보고 있는가?
- 마지막 작업일지는 언제 생성됐는가?
- 문제가 있는가?

### 9.2 Watch Paths

가장 중요한 정보:

- 현재 감시 대상
- 제외 대상
- System Mode 여부
- 경로별 활성 상태

### 9.3 Privacy

사용자가 확인해야 하는 것:

- 무엇을 수집하는가
- 무엇을 수집하지 않는가
- AI로 무엇이 전송되는가
- 어떤 항목이 마스킹되는가

### 9.4 Report Detail

Report Detail은 포트폴리오 문서로 바로 옮길 수 있을 만큼 읽기 좋아야 한다.

Sections:
- Summary
- Evidence Source
- Actual Changes
- Inferred Intent
- Agent Notes
- Risks/Blockers
- Next Actions
- Portfolio Sentence

## 10. Interaction Design

### 10.1 Close Behavior

- 창의 X 버튼 클릭: 창 닫힘, 트레이에서 계속 실행
- Quit 메뉴: 앱 완전 종료
- 최초 close 시 안내 toast 표시

```txt
TraceForge는 트레이에서 계속 기록 중입니다.
완전히 종료하려면 트레이 메뉴에서 Quit을 선택하세요.
```

### 10.2 Pause Monitoring

Pause를 누르면 즉시 감시가 중단되어야 한다.

Paused 상태에서:
- 파일 이벤트 수집 중지
- 예약 분석 중지
- 수동 report generation은 가능하되 경고 표시

### 10.3 Generate Now

Manual report generation flow:

```txt
Generate Report Now
→ Snapshot collecting
→ Redaction applied
→ AI analyzing
→ Report generated
→ Notification
```

### 10.4 System Mode Confirmation

2단계 confirm.

Step 1:
- 위험 설명

Step 2:
- 사용자가 직접 문구 입력

```txt
I understand the risk
```

한국어 UI에서는:

```txt
위험을 이해했습니다
```

## 11. Content Design

### 11.1 좋은 문구

```txt
이 폴더만 기록합니다.
```

```txt
AI로 전송되기 전에 민감정보를 마스킹합니다.
```

```txt
이 내용은 로그 기반 추정입니다.
```

### 11.2 피해야 할 문구

```txt
사용자의 모든 활동을 추적합니다.
```

```txt
완벽하게 증명합니다.
```

```txt
당신의 생산성을 감시합니다.
```

## 12. Accessibility

- 키보드로 모든 설정 접근 가능
- status는 색상만으로 구분하지 않음
- 스크린리더용 label 제공
- path/code 영역은 복사 버튼 제공
- 경고 문구는 아이콘 + 텍스트 함께 사용

## 13. Responsive Behavior

Desktop app이지만 작은 창을 고려한다.

- 900px 이하: card grid를 1열로 전환
- sidebar는 collapse 가능
- report detail은 readable width 유지

## 14. Motion

- 과한 애니메이션 금지
- 상태 전환은 150-200ms
- report generation progress는 subtle spinner
- background monitoring은 살아있는 작은 pulse 정도 허용

## 15. Design QA Checklist

- 현재 감시 경로가 명확히 보이는가?
- Pause/Stop이 쉽게 접근 가능한가?
- System Mode가 충분히 위험하게 보이는가?
- AI 추정과 실제 evidence가 구분되는가?
- 비개발자도 report를 읽을 수 있는가?
- 트레이 앱답게 조용한가?

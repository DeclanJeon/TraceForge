# TraceForge Implementation Team Board

작성일: 2026-05-08
기준 문서: docs/traceforge_* v4/v1

## 운영 원칙
- 문서-first: PRD/SRS/SRD/SDD/API/ERD/Wireframe/Design 문서를 구현 기준으로 고정한다.
- 로컬 우선: 사용자 지정 경로, 로컬 evidence, redaction 후 AI 전송을 기본 원칙으로 한다.
- 개인정보 우선: 키로깅/화면녹화/무단 Agent 내부 로그 수집은 구현하지 않는다.
- 작업 완료 시 docs/implementation/logs/에 lane별 로그를 남긴다.

## 팀 구성 및 작업 할당
| Lane | 담당 범위 | 산출물 | 완료 기준 |
|---|---|---|---|
| Orchestrator/Integrator | 요구사항 분해, 작업 로그, 통합, QA 산정 | team-board, implementation logs, QA report | 테스트/빌드 통과 및 완성률 >=95% |
| PO/PM | MVP 범위, P0/P1/P2, 릴리즈 blocker | acceptance criteria | P0 요구사항 코드/테스트 매핑 |
| Architecture | 모듈 구조, API boundary, storage contract | src/core, src/api, src-tauri skeleton | API spec 주요 command wrapper 구현 |
| Core Engine | settings/watch/redaction/snapshot/report/AI adapter | TypeScript local-first core | unit tests 통과 |
| Frontend UX | onboarding/dashboard/watch/reports/settings/privacy UI | React screens/components | build 통과, wireframe checklist 충족 |
| Desktop Shell | Tauri v2 package/tray/IPC scaffold | src-tauri | desktop migration path와 command 이름 정렬 |
| QA | test suite, QA 문서, 완성률 계산 | QA_REPORT.md | 자동 테스트/빌드 결과 기록 |

## 구현 Sprint
1. Foundation: Vite/React/TS/Vitest, core type contracts.
2. Core Engine: local storage repository, redaction, snapshot/report generation.
3. UI: app shell, onboarding, dashboard, watch paths, reports, settings, privacy preview.
4. Desktop Shell: Tauri v2 scaffold, tray menu, command names.
5. QA: unit tests, build, QA completion scoring.

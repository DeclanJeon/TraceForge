# Implementation Log 002 — Core/Frontend/Desktop MVP 구현

시간: 2026-05-08T02:02:21.358741

## Core Engine Lane
- TypeScript command registry(`src/api/commands.ts`) 구현.
- Settings repository/local persistence(`src/core/repository.ts`) 구현.
- Watch path validation/CRUD(`src/core/watch.ts`) 구현.
- Redaction engine(`src/core/redaction.ts`) 구현: OpenRouter/OpenAI/GitHub/Bearer/JWT/AWS/password/DB URL/private key/home path 마스킹.
- Snapshot builder(`src/core/snapshot.ts`) 구현: watch scope, synthetic file events, Git summary placeholder, agent bridge summary, SHA-256 hash.
- Report writer(`src/core/report.ts`) 구현: API spec의 Markdown 섹션 구조 생성.

## Frontend UX Lane
- AppShell/sidebar/topbar/status pill 구현.
- Onboarding wizard 구현: welcome, watch path, OpenRouter key, privacy 확인.
- Dashboard 구현: monitoring status, watch path, reports, AI/privacy 상태.
- Watch Paths 화면 구현: add/update/remove, system mode warning.
- Reports 화면 구현: generate/list/detail markdown preview.
- Settings 화면 구현: interval/model/privacy/notification/default excludes.
- Privacy Preview 화면 구현: sanitized payload와 redaction count 확인.

## Desktop Shell Lane
- Tauri v2 scaffold 생성: src-tauri/Cargo.toml, tauri.conf.json, capabilities, Rust entrypoints.
- Tray menu skeleton 구현: Open Dashboard, Start/Pause, Generate, Settings, Quit.
- app_get_status/tray_start_monitoring/tray_pause_monitoring command skeleton 구현.
- SQLite migration skeleton 생성.

## 다음 작업
- npm dependency install.
- Vitest unit/component tests 실행.
- production build 실행.
- QA 보고서 작성 및 완성률 산정.

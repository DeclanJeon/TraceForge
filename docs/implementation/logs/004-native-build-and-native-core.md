# Implementation Log 004 — Native Build & Native Core 후속 구현

시간: 2026-05-08T02:33:17.162183

## 요청 범위
사용자가 이전 보고서의 남은 항목 1,2번 진행을 요청했다.

## 1번 처리: Rust/Cargo + Tauri build
- WSL cargo는 없었으나 Windows cargo.exe 확인: cargo 1.94.1.
- Windows PowerShell에서 npm install/test/build/cargo check 수행: PASS.
- `npm run tauri -- build --debug` 수행: PASS.
- 생성 artifact:
  - src-tauri/target/debug/traceforge.exe
  - src-tauri/target/debug/bundle/msi/TraceForge_0.1.0_x64_en-US.msi
  - src-tauri/target/debug/bundle/nsis/TraceForge_0.1.0_x64-setup.exe

## 2번 처리: Native 기능 구현
- Rust native persistence/settings/watch path/snapshot/reporting 구현.
- GitCollector를 `git` CLI 기반으로 구현.
- Agent Bridge check/create/read 구현.
- Redaction/native privacy preview 구현.
- OpenRouter actual call path 구현: `TRACEFORGE_OPENROUTER_KEY` 환경변수 존재 시 호출.
- plaintext secret 저장은 피하고 secure-storage scaffold 정책으로 기록.
- Tauri icon/identifier/bundle 설정 수정.

## 검증
- npm test: PASS, 4 files / 6 tests.
- npm run build: PASS.
- cargo check: PASS.
- tauri debug build + MSI/NSIS bundle: PASS.

## 남은 권장 작업
- release build 정식 검증.
- 설치 후 GUI/tray manual smoke QA.
- macOS/Linux packaging matrix 추가.

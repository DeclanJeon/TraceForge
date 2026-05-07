# TraceForge

**TraceForge**는 AI 시대의 작업 과정 증명 도구입니다. 사용자가 지정한 프로젝트 디렉토리에서 파일 변경, Git 활동, `.worklog/agent-session.md`, 작업 evidence를 로컬 우선 방식으로 수집하고, 민감정보를 마스킹한 뒤 AI 기반 Markdown 작업일지로 변환합니다.

> 결과물만 보여주는 포트폴리오가 아니라, 결과물이 만들어진 과정을 신뢰 가능한 기록으로 남깁니다.

## 핵심 특징

- **설치형 데스크톱 앱**: Tauri v2 + React + TypeScript 기반 Windows/macOS/Linux 지원
- **트레이 백그라운드 에이전트**: 앱을 닫아도 트레이에서 기록 상태 제어
- **로컬 우선 Evidence 저장**: Raw Snapshot과 AI Summary를 분리 저장
- **Watch Path 기반 수집**: 사용자가 지정한 프로젝트/워크스페이스만 감시
- **Privacy-first Redaction**: OpenRouter/OpenAI 키, GitHub 토큰, Bearer 토큰, JWT, DB URL, 홈 경로 등 마스킹
- **Agent Bridge**: `.worklog/agent-session.md` 템플릿을 통해 AI Agent 작업 의도와 결과를 보완
- **Markdown Worklog 생성**: 작업 요약, evidence source, actual changes, inferred intent, blocker, next action 포함
- **크로스플랫폼 CI/CD**: GitHub Actions로 Windows/macOS/Linux 설치 파일을 Release에 자동 업로드

## 제품이 하지 않는 것

TraceForge는 작업 증명을 위한 개인 생산성 앱이며, 감시 도구가 아닙니다.

- 키로깅을 하지 않습니다.
- 화면 녹화를 하지 않습니다.
- 지정 경로 밖을 무단 수집하지 않습니다.
- API key/token을 평문 파일에 저장하지 않습니다.
- AI Agent 내부 대화 로그를 무단 수집하지 않습니다.

## 기술 스택

- Frontend: React, TypeScript, Vite
- Desktop: Tauri v2, Rust
- Tests: Vitest, React Testing Library
- Native packaging: Tauri bundler
- CI/CD: GitHub Actions matrix builds

## 로컬 개발

### 사전 준비

- Node.js 20+
- Rust stable
- OS별 Tauri prerequisite

Windows에서는 PowerShell에서 실행하는 것을 권장합니다.

```bash
npm install
npm test
npm run build
npm run tauri -- build --debug
```

WSL에서 Windows Rust toolchain을 사용할 경우:

```bash
powershell.exe -NoProfile -Command 'Set-Location C:\Users\Administrator\Develop\Worktrace; npm install; npm test; npm run build; cargo check --manifest-path src-tauri\Cargo.toml; npm run tauri -- build --debug'
```

## OpenRouter 사용

Native runtime에서 실제 OpenRouter 호출을 사용하려면 실행 환경에 다음 값을 설정합니다.

```bash
TRACEFORGE_OPENROUTER_KEY=sk-or-v1-...
```

키가 없으면 TraceForge는 local fallback summary로 Markdown report를 생성합니다.

## 주요 명령

```bash
npm test          # unit/component tests
npm run build     # TypeScript + Vite production build
npm run tauri -- build --debug
```

## Release 빌드

태그를 push하면 GitHub Actions가 OS별 설치 파일을 빌드하고 GitHub Release에 업로드합니다.

```bash
git tag v0.1.0
git push origin v0.1.0
```

빌드 산출물 예시:

- Windows: `.msi`, `-setup.exe`
- macOS: `.dmg`, `.app.tar.gz`
- Linux: `.AppImage`, `.deb`, `.rpm` 또는 Tauri runner 환경의 지원 bundle

## 문서

설계 문서는 `docs/` 아래에 있습니다.

- PRD: `docs/traceforge_PRD_v4.md`
- SRS: `docs/traceforge_SRS_v4.md`
- SRD: `docs/traceforge_SRD_v4.md`
- SDD: `docs/traceforge_SDD_v4.md`
- API Spec: `docs/traceforge_API_SPEC_v4.md`
- ERD: `docs/traceforge_ERD_v4.md`
- Wireframe: `docs/traceforge_WIREFRAME_SPEC_v1.md`
- Design: `docs/traceforge_DESIGN_SPEC_v1.md`

구현/QA 기록:

- `docs/implementation/team-board.md`
- `docs/implementation/QA_REPORT.md`
- `docs/implementation/logs/`

## 현재 상태

- Web/React build: 통과
- Unit/component tests: 통과
- Windows debug native bundle: 통과
- Windows MSI/NSIS installer 생성: 통과
- macOS/Linux installer는 GitHub Actions release matrix에서 빌드

## 라이선스

MIT License

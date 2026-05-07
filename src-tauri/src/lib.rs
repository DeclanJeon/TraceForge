use chrono::Utc;
use regex::Regex;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::Manager;

const DEFAULT_MODEL: &str = "openai/gpt-4o-mini";
const SECRET_ENV_KEY: &str = "TRACEFORGE_OPENROUTER_KEY";

#[derive(Debug, Serialize, Deserialize, Clone)]
struct WatchPath {
    id: String,
    mode: String,
    path: String,
    enabled: bool,
    max_depth: u8,
    follow_symlinks: bool,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Settings {
    configured: bool,
    model: String,
    redact_secrets: bool,
    shell_history_opt_in: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self { configured: false, model: DEFAULT_MODEL.to_string(), redact_secrets: true, shell_history_opt_in: false }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct AppStatus {
    configured: bool,
    monitoring_state: String,
    tray_state: String,
    ai_status: String,
    last_snapshot_at: Option<String>,
    last_report_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValidationResult { valid: bool, warnings: Vec<String>, errors: Vec<String> }

#[derive(Debug, Serialize, Deserialize, Clone)]
struct RedactionFinding { kind: String, count: usize, replacement: String }

#[derive(Debug, Serialize, Deserialize, Clone)]
struct RedactionSummary { blocked: bool, total_redactions: usize, findings: Vec<RedactionFinding> }

#[derive(Debug, Serialize, Deserialize)]
struct PrivacyPreview { sanitized_payload: String, redaction_summary: RedactionSummary, safe_to_send: bool }

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GitSnapshot { project_path: String, branch: String, status_short: String, diff_stat: String, recent_commits: Vec<String>, warning: Option<String> }

#[derive(Debug, Serialize, Deserialize, Clone)]
struct AgentBridgeStatus { path: String, exists: bool, content: Option<String>, sanitized_content: Option<String> }

#[derive(Debug, Serialize, Deserialize, Clone)]
struct RawSnapshot {
    id: String,
    captured_at: String,
    watch_scope: Vec<WatchPath>,
    git_summaries: Vec<GitSnapshot>,
    agent_sessions: Vec<AgentBridgeStatus>,
    redaction_summary: RedactionSummary,
    sanitized_payload: String,
    hash: String,
    file_path: String,
    status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Report { id: String, raw_snapshot_id: String, title: String, project_name: String, file_path: String, content: String, created_at: String, ai_summary: String }

#[derive(Debug, Serialize, Deserialize)]
struct GenerateResult { snapshot: RawSnapshot, report: Report }

#[derive(Debug, Deserialize)]
struct AddWatchPathRequest { path: String, mode: String, max_depth: Option<u8>, follow_symlinks: Option<bool> }

#[derive(Debug, Deserialize)]
struct OpenRouterMessage { role: String, content: String }
#[derive(Debug, Deserialize)]
struct OpenRouterChoice { message: OpenRouterMessage }
#[derive(Debug, Deserialize)]
struct OpenRouterResponse { choices: Vec<OpenRouterChoice> }

fn now() -> String { Utc::now().to_rfc3339() }
fn id(prefix: &str) -> String { format!("{}_{}", prefix, Utc::now().timestamp_millis()) }

fn app_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(dir.join("raw")).map_err(|e| e.to_string())?;
    fs::create_dir_all(dir.join("reports")).map_err(|e| e.to_string())?;
    fs::create_dir_all(dir.join("logs")).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn read_json<T: for<'de> Deserialize<'de> + Default>(path: &Path) -> T {
    fs::read_to_string(path).ok().and_then(|s| serde_json::from_str(&s).ok()).unwrap_or_default()
}
fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<(), String> {
    if let Some(parent) = path.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
    let data = serde_json::to_string_pretty(value).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())
}
fn settings_path(app: &tauri::AppHandle) -> Result<PathBuf, String> { Ok(app_dir(app)?.join("settings.json")) }
fn watch_paths_path(app: &tauri::AppHandle) -> Result<PathBuf, String> { Ok(app_dir(app)?.join("watch_paths.json")) }
fn reports_index_path(app: &tauri::AppHandle) -> Result<PathBuf, String> { Ok(app_dir(app)?.join("reports_index.json")) }
fn snapshots_index_path(app: &tauri::AppHandle) -> Result<PathBuf, String> { Ok(app_dir(app)?.join("snapshots_index.json")) }

fn load_settings(app: &tauri::AppHandle) -> Result<Settings, String> { Ok(read_json(&settings_path(app)?)) }
fn save_settings(app: &tauri::AppHandle, settings: &Settings) -> Result<(), String> { write_json(&settings_path(app)?, settings) }
fn load_watch_paths(app: &tauri::AppHandle) -> Result<Vec<WatchPath>, String> { Ok(read_json(&watch_paths_path(app)?)) }
fn save_watch_paths(app: &tauri::AppHandle, paths: &Vec<WatchPath>) -> Result<(), String> { write_json(&watch_paths_path(app)?, paths) }
fn load_reports(app: &tauri::AppHandle) -> Result<Vec<Report>, String> { Ok(read_json(&reports_index_path(app)?)) }
fn save_reports(app: &tauri::AppHandle, reports: &Vec<Report>) -> Result<(), String> { write_json(&reports_index_path(app)?, reports) }
fn load_snapshots(app: &tauri::AppHandle) -> Result<Vec<RawSnapshot>, String> { Ok(read_json(&snapshots_index_path(app)?)) }
fn save_snapshots(app: &tauri::AppHandle, snapshots: &Vec<RawSnapshot>) -> Result<(), String> { write_json(&snapshots_index_path(app)?, snapshots) }

fn redact_text(input: &str) -> Result<(String, RedactionSummary), String> {
    let specs = vec![
        ("openrouter_api_key", "[REDACTED_OPENROUTER_KEY]", r"sk-or-v1-[A-Za-z0-9_-]{12,}"),
        ("openai_api_key", "[REDACTED_OPENAI_KEY]", r"sk-[A-Za-z0-9]{20,}"),
        ("github_token", "[REDACTED_GITHUB_TOKEN]", r"gh[pousr]_[A-Za-z0-9_]{20,}"),
        ("aws_access_key", "[REDACTED_AWS_KEY]", r"AKIA[0-9A-Z]{16}"),
        ("jwt", "[REDACTED_JWT]", r"eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"),
        ("bearer_token", "Bearer [REDACTED_TOKEN]", r"(?i)Bearer\s+[A-Za-z0-9._~+/=-]{12,}"),
        ("database_url", "[REDACTED_DATABASE_URL]", r"(?i)(postgres|mysql|mongodb|redis)://[^\s)]+"),
        ("home_path", "[USER_HOME]", r"(C:\\Users\\[^\\\s]+|/Users/[^/\s]+|/home/[^/\s]+)"),
    ];
    let mut text = input.to_string();
    let mut findings = Vec::new();
    for (kind, replacement, pattern) in specs {
        let re = Regex::new(pattern).map_err(|e| e.to_string())?;
        let count = re.find_iter(&text).count();
        if count > 0 {
            text = re.replace_all(&text, replacement).to_string();
            findings.push(RedactionFinding { kind: kind.to_string(), count, replacement: replacement.to_string() });
        }
    }
    let password = Regex::new(r"(?i)\b(password|passwd|pwd|api[_-]?key|token|secret)\s*=\s*[^\s\n]+").map_err(|e| e.to_string())?;
    let count = password.find_iter(&text).count();
    if count > 0 {
        text = password.replace_all(&text, "$1=[REDACTED_SECRET]").to_string();
        findings.push(RedactionFinding { kind: "password_assignment".to_string(), count, replacement: "[REDACTED_SECRET]".to_string() });
    }
    Ok((text, RedactionSummary { blocked: false, total_redactions: findings.iter().map(|f| f.count).sum(), findings }))
}

fn validate_path(path: &str, mode: &str) -> ValidationResult {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    if path.trim().is_empty() { errors.push("감시 경로를 입력해야 합니다.".to_string()); }
    let absolute = path.starts_with('/') || path.starts_with('~') || Regex::new(r"^[A-Za-z]:\\").unwrap().is_match(path);
    if !absolute { errors.push("절대 경로 또는 홈 경로를 입력해야 합니다.".to_string()); }
    if !Path::new(path).exists() && !Regex::new(r"^[A-Za-z]:\\").unwrap().is_match(path) { warnings.push("현재 런타임에서 경로 존재 여부를 확인할 수 없습니다.".to_string()); }
    if mode == "system" { warnings.push("System Mode는 2단계 확인이 필요한 고위험 모드입니다.".to_string()); }
    ValidationResult { valid: errors.is_empty(), warnings, errors }
}

fn run_git(path: &str, args: &[&str]) -> Result<String, String> {
    let out = Command::new("git").args(args).current_dir(path).output().map_err(|e| e.to_string())?;
    if out.status.success() { Ok(String::from_utf8_lossy(&out.stdout).trim().to_string()) } else { Err(String::from_utf8_lossy(&out.stderr).trim().to_string()) }
}
fn collect_git(path: &str) -> GitSnapshot {
    let branch = run_git(path, &["branch", "--show-current"]);
    match branch {
        Ok(branch) => GitSnapshot {
            project_path: path.to_string(),
            branch,
            status_short: run_git(path, &["status", "--short"]).unwrap_or_default(),
            diff_stat: run_git(path, &["diff", "--stat"]).unwrap_or_default(),
            recent_commits: run_git(path, &["log", "-n", "5", "--oneline"]).unwrap_or_default().lines().map(|s| s.to_string()).collect(),
            warning: None,
        },
        Err(e) => GitSnapshot { project_path: path.to_string(), branch: "unknown".to_string(), status_short: String::new(), diff_stat: String::new(), recent_commits: Vec::new(), warning: Some(e) }
    }
}

const AGENT_TEMPLATE: &str = "# Agent Session\n\n## Goal\n\n## User Request Summary\n\n## Agent Plan\n\n## Modified Files\n\n## Commands\n\n## Errors / Blockers\n\n## Completed Work\n\n## Remaining Work\n\n## Portfolio Summary\n";
fn agent_bridge_path(project_path: &str) -> PathBuf { Path::new(project_path).join(".worklog").join("agent-session.md") }
fn read_agent_bridge(project_path: &str) -> Result<AgentBridgeStatus, String> {
    let path = agent_bridge_path(project_path);
    if !path.exists() { return Ok(AgentBridgeStatus { path: path.to_string_lossy().to_string(), exists: false, content: None, sanitized_content: None }); }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let (sanitized_content, _) = redact_text(&content)?;
    Ok(AgentBridgeStatus { path: path.to_string_lossy().to_string(), exists: true, content: Some(content), sanitized_content: Some(sanitized_content) })
}

#[tauri::command]
fn app_get_status(app: tauri::AppHandle) -> Result<AppStatus, String> {
    let settings = load_settings(&app)?;
    let paths = load_watch_paths(&app)?;
    let snapshots = load_snapshots(&app)?;
    let reports = load_reports(&app)?;
    let configured = settings.configured && paths.iter().any(|p| p.enabled);
    Ok(AppStatus {
        configured,
        monitoring_state: if configured { "running" } else { "setup_required" }.to_string(),
        tray_state: if configured { "running" } else { "setup_required" }.to_string(),
        ai_status: if std::env::var(SECRET_ENV_KEY).is_ok() { "ready" } else { "not_configured" }.to_string(),
        last_snapshot_at: snapshots.first().map(|s| s.captured_at.clone()),
        last_report_id: reports.first().map(|r| r.id.clone()),
    })
}

#[tauri::command]
fn settings_get(app: tauri::AppHandle) -> Result<Settings, String> { load_settings(&app) }
#[tauri::command]
fn settings_update(app: tauri::AppHandle, settings: Settings) -> Result<Settings, String> { save_settings(&app, &settings)?; Ok(settings) }
#[tauri::command]
fn watch_list_paths(app: tauri::AppHandle) -> Result<Vec<WatchPath>, String> { load_watch_paths(&app) }
#[tauri::command]
fn watch_validate_path(path: String, mode: String) -> ValidationResult { validate_path(&path, &mode) }

#[tauri::command]
fn watch_add_path(app: tauri::AppHandle, request: AddWatchPathRequest) -> Result<WatchPath, String> {
    let validation = validate_path(&request.path, &request.mode);
    if !validation.valid { return Err(validation.errors.join("\n")); }
    let mut paths = load_watch_paths(&app)?;
    let timestamp = now();
    let item = WatchPath { id: id("wp"), mode: request.mode, path: request.path, enabled: true, max_depth: request.max_depth.unwrap_or(5), follow_symlinks: request.follow_symlinks.unwrap_or(false), created_at: timestamp.clone(), updated_at: timestamp };
    paths.insert(0, item.clone());
    save_watch_paths(&app, &paths)?;
    let mut settings = load_settings(&app)?;
    settings.configured = true;
    save_settings(&app, &settings)?;
    Ok(item)
}

#[tauri::command]
fn watch_remove_path(app: tauri::AppHandle, id: String) -> Result<(), String> {
    let paths: Vec<WatchPath> = load_watch_paths(&app)?.into_iter().filter(|p| p.id != id).collect();
    save_watch_paths(&app, &paths)
}

#[tauri::command]
fn agent_bridge_check(project_path: String) -> Result<AgentBridgeStatus, String> { read_agent_bridge(&project_path) }
#[tauri::command]
fn agent_bridge_create_template(project_path: String) -> Result<AgentBridgeStatus, String> {
    let path = agent_bridge_path(&project_path);
    if let Some(parent) = path.parent() { fs::create_dir_all(parent).map_err(|e| e.to_string())?; }
    if !path.exists() { fs::write(&path, AGENT_TEMPLATE).map_err(|e| e.to_string())?; }
    read_agent_bridge(&project_path)
}
#[tauri::command]
fn redaction_preview(text: String) -> Result<PrivacyPreview, String> {
    let (sanitized_payload, redaction_summary) = redact_text(&text)?;
    Ok(PrivacyPreview { sanitized_payload, safe_to_send: !redaction_summary.blocked, redaction_summary })
}

#[tauri::command]
fn snapshot_collect_now(app: tauri::AppHandle) -> Result<RawSnapshot, String> {
    let paths = load_watch_paths(&app)?.into_iter().filter(|p| p.enabled).collect::<Vec<_>>();
    let git_summaries = paths.iter().map(|p| collect_git(&p.path)).collect::<Vec<_>>();
    let agent_sessions = paths.iter().map(|p| read_agent_bridge(&p.path)).collect::<Result<Vec<_>, _>>()?;
    let payload = serde_json::json!({ "watch_scope": paths, "git_summaries": git_summaries, "agent_sessions": agent_sessions });
    let raw = serde_json::to_string_pretty(&payload).map_err(|e| e.to_string())?;
    let (sanitized_payload, redaction_summary) = redact_text(&raw)?;
    let mut hasher = Sha256::new();
    hasher.update(sanitized_payload.as_bytes());
    let hash = format!("{:x}", hasher.finalize());
    let snapshot_id = id("snap");
    let file_path = app_dir(&app)?.join("raw").join(format!("{}.json", snapshot_id));
    let snapshot = RawSnapshot { id: snapshot_id, captured_at: now(), watch_scope: load_watch_paths(&app)?.into_iter().filter(|p| p.enabled).collect(), git_summaries: payload["git_summaries"].as_array().and_then(|_| serde_json::from_value(payload["git_summaries"].clone()).ok()).unwrap_or_default(), agent_sessions: payload["agent_sessions"].as_array().and_then(|_| serde_json::from_value(payload["agent_sessions"].clone()).ok()).unwrap_or_default(), redaction_summary, sanitized_payload, hash, file_path: file_path.to_string_lossy().to_string(), status: "ready".to_string() };
    write_json(&file_path, &snapshot)?;
    let mut snapshots = load_snapshots(&app)?;
    snapshots.insert(0, snapshot.clone());
    save_snapshots(&app, &snapshots)?;
    Ok(snapshot)
}

#[tauri::command]
async fn report_generate(app: tauri::AppHandle) -> Result<GenerateResult, String> {
    let snapshot = snapshot_collect_now(app.clone())?;
    let mut ai_summary = "Redacted local evidence를 기반으로 작업일지를 생성했습니다.".to_string();
    if let Ok(key) = std::env::var(SECRET_ENV_KEY) {
        let settings = load_settings(&app)?;
        let client = reqwest::Client::new();
        let body = serde_json::json!({
            "model": settings.model,
            "messages": [{"role":"user","content": format!("TraceForge snapshot을 사실/추정 분리 원칙으로 5문장 요약해줘. 로그 밖 사실은 단정하지 마.\n{}", snapshot.sanitized_payload)}]
        });
        if let Ok(resp) = client.post("https://openrouter.ai/api/v1/chat/completions").bearer_auth(key).json(&body).send().await {
            if resp.status().is_success() {
                if let Ok(parsed) = resp.json::<OpenRouterResponse>().await {
                    if let Some(choice) = parsed.choices.first() { ai_summary = choice.message.content.clone(); }
                }
            }
        }
    }
    let project_name = snapshot.watch_scope.first().and_then(|p| Path::new(&p.path).file_name()).map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "TraceForge Workspace".to_string());
    let report_id = id("report");
    let content = format!("# TraceForge Worklog\n\n## Summary\n{}\n\n## Evidence Source\n- Raw Snapshot: {}\n- Snapshot Hash: {}\n\n## Actual Changes\n- Git summaries collected: {}\n- Agent bridge files checked: {}\n\n## Inferred Intent\n- 사용자는 지정 프로젝트의 작업 과정을 문서화하려는 것으로 추정됩니다.\n\n## Agent Notes\n{}\n\n## Risks / Blockers\n- OpenRouter key가 없으면 로컬 요약 fallback을 사용합니다.\n\n## Next Actions\n- Native installer build 검증\n\n## Portfolio Sentence\nTraceForge는 로컬 evidence와 AI 요약을 분리해 작업 과정을 신뢰 가능한 포트폴리오 기록으로 변환합니다.\n", ai_summary, snapshot.id, snapshot.hash, snapshot.git_summaries.len(), snapshot.agent_sessions.len(), snapshot.agent_sessions.iter().map(|a| format!("- {}: exists={}", a.path, a.exists)).collect::<Vec<_>>().join("\n"));
    let path = app_dir(&app)?.join("reports").join(format!("{}.md", report_id));
    let report = Report { id: report_id, raw_snapshot_id: snapshot.id.clone(), title: "Hourly Worklog".to_string(), project_name, file_path: path.to_string_lossy().to_string(), content, created_at: now(), ai_summary };
    fs::write(&path, &report.content).map_err(|e| e.to_string())?;
    let mut reports = load_reports(&app)?;
    reports.insert(0, report.clone());
    save_reports(&app, &reports)?;
    Ok(GenerateResult { snapshot, report })
}

#[tauri::command]
fn report_list(app: tauri::AppHandle) -> Result<Vec<Report>, String> { load_reports(&app) }
#[tauri::command]
fn secret_set_openrouter_key(_key: String) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({"stored": false, "message": "Native secure storage is intentionally not writing plaintext. Set TRACEFORGE_OPENROUTER_KEY in the runtime environment for actual OpenRouter calls."}))
}
#[tauri::command]
fn tray_start_monitoring(app: tauri::AppHandle) -> Result<AppStatus, String> { app_get_status(app) }
#[tauri::command]
fn tray_pause_monitoring() -> serde_json::Value { serde_json::json!({"monitoring_state":"paused"}) }

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let _ = app_dir(&app.handle());
            let open = MenuItem::with_id(app, "open_dashboard", "Open Dashboard", true, None::<&str>)?;
            let start = MenuItem::with_id(app, "start_monitoring", "Start Monitoring", true, None::<&str>)?;
            let pause = MenuItem::with_id(app, "pause_monitoring", "Pause Monitoring", true, None::<&str>)?;
            let generate = MenuItem::with_id(app, "generate_report", "Generate Report Now", true, None::<&str>)?;
            let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &start, &pause, &generate, &settings, &quit])?;
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("TraceForge — AI Work Evidence Recorder")
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        let _ = tray.app_handle().get_webview_window("main").map(|w| { let _ = w.show(); let _ = w.set_focus(); });
                    }
                })
                .build(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_get_status, settings_get, settings_update,
            watch_list_paths, watch_validate_path, watch_add_path, watch_remove_path,
            agent_bridge_check, agent_bridge_create_template,
            redaction_preview, snapshot_collect_now, report_generate, report_list,
            secret_set_openrouter_key, tray_start_monitoring, tray_pause_monitoring
        ])
        .run(tauri::generate_context!())
        .expect("error while running TraceForge");
}

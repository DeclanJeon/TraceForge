import type { ExcludeRule, Settings } from '../api/types';

export const DEFAULT_EXCLUDES = ['node_modules', '.git', '.env', '.cache', 'dist', 'build', '.ssh', '.gnupg', '.venv', 'venv', 'target', '.next'];
export const DEFAULT_EXCLUDE_RULES: ExcludeRule[] = DEFAULT_EXCLUDES.map((pattern, index) => ({ id: `default_${index + 1}`, pattern, enabled: true, source: 'default' }));
export const DEFAULT_SETTINGS: Settings = {
  configured: false,
  analysis: { interval_minutes: 60, provider: 'openrouter', model: 'openai/gpt-4o-mini' },
  privacy: { redact_secrets: true, send_raw_diff_to_ai: false, shell_history_opt_in: false },
  agent_bridge: { enabled: true, create_template: true },
  notifications: { enabled: true, report_generated: true, errors: true },
  general: { close_to_tray: true, start_on_login: false },
  exclude_rules: DEFAULT_EXCLUDE_RULES
};
export const AGENT_SESSION_TEMPLATE = `# Agent Session\n\n## Goal\n\n## User Request Summary\n\n## Agent Plan\n\n## Modified Files\n\n## Commands\n\n## Errors / Blockers\n\n## Completed Work\n\n## Remaining Work\n\n## Portfolio Summary\n`;

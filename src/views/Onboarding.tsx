import { useState } from 'react';
import { commands } from '../api/commands';
import type { WatchMode } from '../api/types';

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1); const [path, setPath] = useState('/mnt/c/Users/Administrator/Develop/Worktrace'); const [mode, setMode] = useState<WatchMode>('project'); const [apiKey, setApiKey] = useState(''); const [privacyOk, setPrivacyOk] = useState(false); const [error, setError] = useState('');
  function finish() { try { commands.watchAddPath({ path, mode }); commands.secretSetOpenRouterKey(apiKey); commands.settingsUpdate({ configured: true, agent_bridge: { enabled: true, create_template: true } }); onDone(); } catch (e) { setError(e instanceof Error ? e.message : String(e)); } }
  return <section className="panel onboarding">
    <div className="stepper">{[1,2,3,4].map(n => <span className={n===step?'current':''} key={n}>Step {n}</span>)}</div>
    {step===1 && <div><h2>결과물이 아니라, 만들어진 과정을 기록합니다.</h2><p>TraceForge는 지정한 프로젝트 evidence만 로컬에 수집하고 redaction 후 AI 작업일지를 생성합니다.</p><button onClick={() => setStep(2)}>Get Started</button></div>}
    {step===2 && <div><h2>Watch Mode & Path</h2><div className="grid two"><label>Mode<select value={mode} onChange={e=>setMode(e.target.value as WatchMode)}><option value="project">Project</option><option value="workspace">Workspace</option><option value="home">Home</option><option value="system">System (Advanced)</option></select></label><label>Path<input value={path} onChange={e=>setPath(e.target.value)} /></label></div>{mode==='system' && <p className="warning">System Mode는 2단계 확인이 필요한 고위험 모드입니다.</p>}<button onClick={()=>setStep(3)}>Next</button></div>}
    {step===3 && <div><h2>AI Provider</h2><p>OpenRouter key는 MVP preview에서 브라우저 local validation만 수행하며, Tauri runtime에서는 secure storage로 이전됩니다.</p><input type="password" placeholder="sk-or-v1-..." value={apiKey} onChange={e=>setApiKey(e.target.value)} /><button onClick={()=>setStep(4)}>Next</button></div>}
    {step===4 && <div><h2>Privacy 확인</h2><ul><li>키 입력 기록 안 함</li><li>화면 녹화 안 함</li><li>지정 디렉토리 밖 수집 안 함</li><li>API Key/Token 마스킹</li></ul><label className="check"><input type="checkbox" checked={privacyOk} onChange={e=>setPrivacyOk(e.target.checked)} /> 개인정보 보호 정책을 확인했습니다.</label><button disabled={!privacyOk} onClick={finish}>Start TraceForge</button></div>}
    {error && <p className="error">{error}</p>}
  </section>;
}

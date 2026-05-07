import { useEffect, useMemo, useState } from 'react';
import { Activity, Bell, FileText, Folder, LayoutDashboard, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { commands } from './api/commands';
import type { AppStatus } from './api/types';
import { Dashboard } from './views/Dashboard';
import { Onboarding } from './views/Onboarding';
import { WatchPaths } from './views/WatchPaths';
import { Reports } from './views/Reports';
import { Settings } from './views/Settings';
import { PrivacyPreview } from './views/PrivacyPreview';

type Route = 'dashboard' | 'onboarding' | 'watch' | 'reports' | 'settings' | 'privacy';
const nav = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'watch' as const, label: 'Watch Paths', icon: Folder },
  { id: 'reports' as const, label: 'Reports', icon: FileText },
  { id: 'privacy' as const, label: 'Privacy', icon: ShieldCheck },
  { id: 'settings' as const, label: 'Settings', icon: SettingsIcon }
];
export default function App() {
  const [route, setRoute] = useState<Route>('dashboard');
  const [status, setStatus] = useState<AppStatus>(commands.appGetStatus());
  const refresh = () => setStatus(commands.appGetStatus());
  useEffect(() => { if (!status.configured) setRoute('onboarding'); }, []);
  const title = useMemo(() => route === 'onboarding' ? 'Onboarding' : nav.find(n => n.id === route)?.label ?? 'Dashboard', [route]);
  const render = () => {
    if (route === 'onboarding') return <Onboarding onDone={() => { refresh(); setRoute('dashboard'); }} />;
    if (route === 'watch') return <WatchPaths onChanged={refresh} />;
    if (route === 'reports') return <Reports onChanged={refresh} />;
    if (route === 'settings') return <Settings onChanged={refresh} />;
    if (route === 'privacy') return <PrivacyPreview />;
    return <Dashboard status={status} onNavigate={setRoute} onChanged={refresh} />;
  };
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><Activity size={26}/><div><strong>TraceForge</strong><span>AI Work Evidence Recorder</span></div></div>
      <nav>{nav.map(item => <button key={item.id} className={route === item.id ? 'active' : ''} onClick={() => setRoute(item.id)}><item.icon size={18}/>{item.label}</button>)}</nav>
      <button className="onboarding-link" onClick={() => setRoute('onboarding')}>Run onboarding</button>
    </aside>
    <main>
      <header className="topbar"><div><p className="eyebrow">Local-first desktop MVP</p><h1>{title}</h1></div><StatusPill status={status}/></header>
      {render()}
    </main>
  </div>;
}
function StatusPill({status}:{status:AppStatus}) {
  const state = status.configured ? status.monitoring_state : 'setup_required';
  return <div className={`status-pill ${state}`}><Bell size={16}/><strong>{state.replace('_',' ')}</strong><span>{status.ai_status}</span></div>;
}

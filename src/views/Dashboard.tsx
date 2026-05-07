import { useState } from 'react';
import { FileText, Folder, Play, Settings, ShieldCheck } from 'lucide-react';
import { commands } from '../api/commands';
import type { AppStatus } from '../api/types';
export function Dashboard({ status, onNavigate, onChanged }: { status: AppStatus; onNavigate: (r: any) => void; onChanged: () => void }) {
  const [busy,setBusy]=useState(false); const paths=commands.watchListPaths(); const reports=commands.reportList();
  async function generate(){setBusy(true); await commands.reportGenerate(); setBusy(false); onChanged();}
  return <div className="stack"><section className="hero"><div><p className="eyebrow">Monitoring Status</p><h2>{status.configured?'작업 evidence 기록 중':'설정이 필요합니다'}</h2><p>{paths[0]?.path ?? '감시 경로가 없습니다.'}</p></div><button onClick={generate} disabled={busy}><Play size={16}/>{busy?'Generating...':'Generate Report Now'}</button></section>
  <div className="grid four"><Card icon={<FileText/>} label="Reports" value={reports.length}/><Card icon={<Folder/>} label="Watch Paths" value={paths.length}/><Card icon={<ShieldCheck/>} label="Redaction" value="On"/><Card icon={<Settings/>} label="AI" value={status.ai_status}/></div>
  <section className="panel"><h3>Active Projects</h3>{paths.length?paths.map(p=><div className="row" key={p.id}><span>{p.path}</span><strong>{p.mode}</strong></div>):<Empty text="아직 감시 중인 작업 공간이 없습니다." action={()=>onNavigate('watch')}/>}</section>
  <section className="panel"><h3>Latest Worklogs</h3>{reports.length?reports.slice(0,5).map(r=><div className="row" key={r.id}><span>{r.title} — {r.project_name}</span><small>{new Date(r.created_at).toLocaleString()}</small></div>):<Empty text="아직 생성된 작업일지가 없습니다." action={generate}/>}</section></div>;
}
function Card({icon,label,value}:{icon:React.ReactNode;label:string;value:React.ReactNode}){return <div className="card">{icon}<span>{label}</span><strong>{value}</strong></div>}
function Empty({text,action}:{text:string;action:()=>void}){return <div className="empty"><p>{text}</p><button onClick={action}>시작하기</button></div>}

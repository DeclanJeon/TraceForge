import { useState } from 'react';
import { commands } from '../api/commands';
export function PrivacyPreview(){const [input,setInput]=useState('OPENROUTER_API_KEY=<example key>\nAuthorization: Bearer abcdefghijklmnopqrstuvwxyz\npath=/home/declan/project'); const preview=commands.redactionPreview(input);
return <section className="panel"><h2>Privacy Preview</h2><p>AI로 전송될 데이터의 sanitized payload를 확인합니다.</p><textarea value={input} onChange={e=>setInput(e.target.value)} rows={6}/><div className="grid two"><div className="card"><span>Redacted items</span><strong>{preview.redaction_summary.total_redactions}</strong></div><div className="card"><span>Safe to send</span><strong>{preview.safe_to_send?'Yes':'Blocked'}</strong></div></div><pre>{preview.sanitized_payload}</pre></section>}

import React, { useMemo, useState } from 'react';
import { pickQuestions } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';

function useQuery(){ return useMemo(()=> new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),[]); }

export default function Survey(){
  const q = useQuery();
  const meta = {
    team: q.get('team') || 'Loading',
    shift: q.get('shift') || '12B',
    location: q.get('loc') || 'Dock',
    seed: Number(q.get('seed') || Date.now() % 100000)
  };
  const [seed] = useState(meta.seed);
  const questions = pickQuestions(seed, 6);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Morale Pulse';

  async function submit(){
    setError(null);
    try{
      const payload = { meta, answers: questions.map(q => ({ id: q.id, type: q.type, value: answers[q.id] ?? null })) };
      const res = await fetch('/api/submit', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(!res.ok) throw new Error(await res.text());
      setDone(true);
    }catch(e:any){
      setError(e.message || 'Submission failed');
    }
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="header">
          <div className="brand">📥 {appName}</div>
          <div className="badge">{meta.team} • {meta.shift} • {meta.location}</div>
        </div>

        {!done ? (<>
          {questions.map(q => (
            <QuestionCard key={q.id} q={q} value={answers[q.id]} onChange={(v:any)=>setAnswers(a=>({...a,[q.id]:v}))} />
          ))}
          {error && <div className="badge" style={{color:'#ffb4c0'}}>{error}</div>}
          <div className="row" style={{marginTop:8, alignItems:'center', justifyContent:'space-between'}}>
            <button onClick={submit} className="btn primary">Submit</button>
            <div className="footer">Anonymous, 30–60 seconds. Thanks for helping improve safety, training, and communication.</div>
          </div>
        </>) : (
          <div className="card" style={{textAlign:'center'}}>
            <div style={{fontSize:24, marginBottom:6}}>✅ Thanks!</div>
            <div className="badge" style={{marginBottom:10}}>Your anonymous feedback was recorded.</div>
            <a className="link" href={typeof window!=='undefined'?window.location.pathname+window.location.search:'#'}>Submit another</a>
          </div>
        )}
      </div>
    </div>
  );
}

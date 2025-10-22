import React, { useEffect, useState } from 'react';

export default function Admin(){
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState<'7d'|'30d'>('30d');
  const [team, setTeam] = useState('');
  const [shift, setShift] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  function qs(params: Record<string, string>){
    const search = new URLSearchParams(params);
    return search.toString();
  }

  async function load(){
    setLoading(true);
    const res = await fetch(`/api/admin/metrics?${qs({range, team, shift, location})}`);
    setLoading(false);
    if(!res.ok){ setData(null); return; }
    setData(await res.json());
  }

  function exportCsv(){
    const url = `/api/admin/export?${qs({range, team, shift, location})}`;
    window.open(url, '_blank');
  }

  useEffect(()=>{ load(); }, [range, team, shift, location]);

  return (
    <div className="container">
      <div className="panel">
        <div className="header">
          <div className="brand">📊 Dashboard</div>
          <div className="badge">Protected — Basic Auth required</div>
        </div>

        <div className="row" style={{marginBottom:12, alignItems:'center'}}>
          <span className="label">Range</span>
          <select className="select" value={range} onChange={e=>setRange(e.target.value as any)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>

          <span className="label">Team</span>
          <input className="text" placeholder="e.g., Loading" value={team} onChange={e=>setTeam(e.target.value)} />

          <span className="label">Shift</span>
          <input className="text" placeholder="e.g., 12B" value={shift} onChange={e=>setShift(e.target.value)} />

          <span className="label">Location</span>
          <input className="text" placeholder="e.g., Dock" value={location} onChange={e=>setLocation(e.target.value)} />

          <button className="btn" onClick={load}>Refresh</button>
          <button className="btn primary" onClick={exportCsv}>Export CSV</button>
        </div>

        {!data ? <div className={`badge ${loading?'loading':''}`}>Loading…</div> : (<>
          <div className="card">Responses: <b>{data.count}</b></div>

          <div className="row" style={{gap:16, flexWrap:'wrap'}}>
            <div className="card" style={{flex:'1 1 360px'}}>
              <div className="card-title">Likert Averages</div>
              <ul style={{margin:0, paddingLeft:18}}>
                {data.summary.likertAvg.map((r:any)=>(
                  <li key={r.id} className="kpis">{r.id}: <b>{Number(r.avg).toFixed(2)}</b> ({r.count})</li>
                ))}
              </ul>
            </div>
            <div className="card" style={{flex:'1 1 360px'}}>
              <div className="card-title">Yes/No Positive Rate</div>
              <ul style={{margin:0, paddingLeft:18}}>
                {data.summary.yesnoRate.map((r:any)=>(
                  <li key={r.id} className="kpis">{r.id}: <b>{Math.round(r.rate*100)}%</b> ({r.total})</li>
                ))}
              </ul>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

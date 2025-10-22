import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const SHIFT_OPTIONS = ['10A','10B','12A','12B'] as const;

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

  const likertBars = data?.summary?.likertAvg?.map((r:any)=>({ id:r.id, avg: Number(r.avg.toFixed(2)) })) || [];
  const yesnoBars = data?.summary?.yesnoRate?.map((r:any)=>({ id:r.id, rate: Math.round(r.rate*100) })) || [];

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
          <input className="text" placeholder="e.g., DC" value={team} onChange={e=>setTeam(e.target.value)} />

          <span className="label">Shift</span>
          <select className="select" value={shift} onChange={e=>setShift(e.target.value)}>
            <option value="">All</option>
            {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <span className="label">Location</span>
          <input className="text" placeholder="e.g., Dock" value={location} onChange={e=>setLocation(e.target.value)} />

          <button className="btn" onClick={load}>Refresh</button>
          <button className="btn primary" onClick={exportCsv}>Export CSV</button>
        </div>

        {!data ? <div className={`badge ${loading?'loading':''}`}>Loading…</div> : (<>
          <div className="card">Responses: <b>{data.count}</b></div>

          {/* Trend charts */}
          <div className="card" style={{height:320}}>
            <div className="card-title">Daily Trend — Likert Avg & Yes% </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend || []} margin={{ right: 20, left: 0, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" domain={[0,5]} />
                <YAxis yAxisId="right" orientation="right" domain={[0,100]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="likertAvg" name="Likert Avg (1-5)" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="yesRate" name="Yes %"
                      dot={false} strokeDasharray="4 4"
                      formatter={(v:any)=>Math.round((v||0)*100)} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current breakdowns */}
          <div className="row" style={{gap:16, flexWrap:'wrap'}}>
            <div className="card" style={{flex:'1 1 420px'}}>
              <div className="card-title">Likert Averages by Question</div>
              <div style={{height:280}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={likertBars}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" />
                    <YAxis domain={[0,5]} />
                    <Tooltip />
                    <Bar dataKey="avg" name="Avg (1-5)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card" style={{flex:'1 1 420px'}}>
              <div className="card-title">Yes/No Positive Rate by Question</div>
              <div style={{height:280}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yesnoBars}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="id" />
                    <YAxis domain={[0,100]} />
                    <Tooltip />
                    <Bar dataKey="rate" name="Yes %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}

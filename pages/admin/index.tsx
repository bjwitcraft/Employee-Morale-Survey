import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const SHIFT_OPTIONS = ['10A','10B','12A','12B'] as const;
const CATEGORIES = ['morale','direct_supervisor','other_supervisors','hr','training','senior_leadership','safety'] as const;

export default function Admin(){
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState<'7d'|'30d'>('30d');
  const [shift, setShift] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  function qs(params: Record<string, string>) {
    const search = new URLSearchParams(params);
    return search.toString();
  }

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/metrics?${qs({ range, shift, category })}`);
    setLoading(false);
    if (!res.ok) { setData(null); return; }
    setData(await res.json());
  }

  function exportCsv() {
    const url = `/api/admin/export?${qs({ range, shift })}`;
    window.open(url, '_blank');
  }

  useEffect(() => { load(); }, [range, shift, category]);

  const likertBars = useMemo(
    () => (data?.summary?.likertAvg || []).map((r: any) => ({ id: r.id, avg: Number((r.avg || 0).toFixed(2)) })),
    [data]
  );
  const yesnoBars = useMemo(
    () => (data?.summary?.yesnoRate || []).map((r: any) => ({ id: r.id, rate: Math.round((r.rate || 0) * 100) })),
    [data]
  );

  const trendData = useMemo(
    () => (data?.trend || []).map((d: any) => ({ ...d, yesRatePct: Math.round(((d.yesRate || 0) * 100)) })),
    [data]
  );

  const compareLikert = useMemo(() => {
    const m = (data?.mtd?.categories || []).map((c: any) => ({ cat: c.cat, MTD: Number((c.likertAvg || 0).toFixed(2)) }));
    const p = (data?.prior?.categories || []).reduce((acc: any, c: any) => {
      acc[c.cat] = Number((c.likertAvg || 0).toFixed(2));
      return acc;
    }, {} as Record<string, number>);
    return m.map((row: any) => ({ cat: row.cat, MTD: row.MTD, Prior: p[row.cat] ?? 0 }));
  }, [data]);

  const compareYes = useMemo(() => {
    const m = (data?.mtd?.categories || []).map((c: any) => ({ cat: c.cat, MTD: Math.round((c.yesRate || 0) * 100) }));
    const p = (data?.prior?.categories || []).reduce((acc: any, c: any) => {
      acc[c.cat] = Math.round((c.yesRate || 0) * 100);
      return acc;
    }, {} as Record<string, number>);
    return m.map((row: any) => ({ cat: row.cat, MTD: row.MTD, Prior: p[row.cat] ?? 0 }));
  }, [data]);

  async function logout() {
    await fetch('/api/admin/logout');
    window.location.href = '/admin/login';
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="header">
          <div className="brand">📊 Dashboard</div>
          <div className="row">
            <button className="btn" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="row" style={{ marginBottom: 12, alignItems: 'center' }}>
          <span className="label">Range</span>
          <select className="select" value={range} onChange={e => setRange(e.target.value as '7d' | '30d')}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>

          <span className="label">Shift</span>
          <select className="select" value={shift} onChange={e => setShift(e.target.value)}>
            <option value="">All</option>
            {SHIFT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <span className="label">Category</span>
          <select className="select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <button className="btn" onClick={load}>Refresh</button>
          <button className="btn primary" onClick={exportCsv}>Export CSV</button>
        </div>

        {!data ? (
          <div className={`badge ${loading ? 'loading' : ''}`}>Loading…</div>
        ) : (
          <>
            <div className="card">Responses in window: <b>{data.count}</b></div>

            {/* Daily Trend */}
            <div className="card" style={{ height: 320 }}>
              <div className="card-title">
                Daily Trend — Likert Avg & Yes% {category ? `(category: ${category})` : ''}
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ right: 20, left: 0, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" domain={[0, 5]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="likertAvg" name="Likert Avg (1-5)" dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="yesRatePct" name="Yes %" dot={false} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Current breakdowns */}
            <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div className="card" style={{ flex: '1 1 420px' }}>
                <div className="card-title">Likert Averages by Question {category ? `(category: ${category})` : ''}</div>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={likertBars}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="avg" name="Avg (1-5)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card" style={{ flex: '1 1 420px' }}>
                <div className="card-title">Yes/No Positive Rate by Question {category ? `(category: ${category})` : ''}</div>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yesnoBars}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="id" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="rate" name="Yes %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* MTD vs Prior-month by Category */}
            <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div className="card" style={{ flex: '1 1 420px' }}>
                <div className="card-title">MTD vs Prior — Likert Avg by Category</div>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compareLikert}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cat" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="MTD" />
                      <Bar dataKey="Prior" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card" style={{ flex: '1 1 420px' }}>
                <div className="card-title">MTD vs Prior — Yes % by Category</div>
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compareYes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cat" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="MTD" />
                      <Bar dataKey="Prior" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

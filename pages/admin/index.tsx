import React, { useEffect, useMemo, useState } from 'react';
import { pickQuestions } from '../data/questions';
import { QuestionCard } from '../components/QuestionCard';

type Meta = {
  team?: string;
  shift?: string;
  location?: string;
  seed: number;
};

export default function Survey() {
  const [mounted, setMounted] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Morale Pulse';

  // Only run on the client to avoid SSR/client mismatch
  useEffect(() => {
    setMounted(true);

    // Read query from the browser
    const search = new URLSearchParams(window.location.search);

    const seedFromQuery = Number(search.get('seed'));
    const seed = Number.isFinite(seedFromQuery)
      ? seedFromQuery
      : Math.floor((Date.now() % 100000)); // but used only on client after mount

    const m: Meta = {
      team: search.get('team') || 'DC',
      shift: search.get('shift') || '',
      location: search.get('loc') || '',
      seed,
    };

    setMeta(m);
    setQuestions(pickQuestions(seed, 4));
  }, []);

  async function submit() {
    if (!meta) return;
    setError(null);
    try {
      const payload = {
        meta,
        answers: questions.map((q) => ({
          id: q.id,
          type: q.type,
          value: answers[q.id] ?? null,
        })),
      };
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'Submission failed');
    }
  }

  // While we haven’t mounted or finished initializing, render a stable placeholder.
  if (!mounted || !meta || questions.length === 0) {
    return (
      <div className="container">
        <div className="panel">
          <div className="header">
            <div className="brand">📥 {appName}</div>
            <a className="btn" href="/admin" title="Admin dashboard">Admin</a>
          </div>
          <div className="badge">Loading…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="header">
          <div className="brand">📥 {appName}</div>
          <a className="btn" href="/admin" title="Admin dashboard">Admin</a>
        </div>

        {!done ? (
          <>
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                value={answers[q.id]}
                onChange={(v: any) =>
                  setAnswers((a) => ({ ...a, [q.id]: v }))
                }
              />
            ))}
            {error && <div className="badge" style={{ color: '#ffb4c0' }}>{error}</div>}
            <div className="row" style={{ marginTop: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={submit} className="btn primary">Submit</button>
              <div className="footer">Anonymous, ~30 seconds. Thank you!</div>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✅ Thanks!</div>
            <div className="badge" style={{ marginBottom: 10 }}>Your anonymous feedback was recorded.</div>
            <a className="link" href="/admin" style={{ marginRight: 12 }}>Admin</a>
            <a className="link" href={typeof window !== 'undefined' ? window.location.pathname + window.location.search : '#'}>Submit another</a>
          </div>
        )}
      </div>
    </div>
  );
}

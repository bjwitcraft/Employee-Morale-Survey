import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login(){
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string|undefined>();

  async function submit(e: React.FormEvent){
    e.preventDefault();
    setError(undefined);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ pin })
    });
    if (res.ok) {
      const next = (router.query.next as string) || '/admin';
      router.replace(next);
    } else {
      const j = await res.json().catch(()=>({}));
      setError(j?.error || 'Invalid PIN');
    }
  }

  return (
    <div className="container center">
      <form onSubmit={submit} className="panel stack">
        <div className="title">🔐 Admin Access</div>
        <div className="small">Enter your 4–6 digit PIN to view the dashboard.</div>
        <input className="input pin" inputMode="numeric" pattern="[0-9]*" autoFocus maxLength={6}
               placeholder="••••" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,''))} />
        {error && <div className="error">{error}</div>}
        <button className="btn primary" type="submit">Unlock</button>
      </form>
    </div>
  );
}

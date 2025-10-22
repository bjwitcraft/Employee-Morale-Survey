import React from 'react';
import { LIKERT } from '../data/questions';
import cx from 'classnames';

export function QuestionCard({ q, value, onChange }: any) {
  return (
    <div className="card">
      <div className="card-title">{q.text}</div>
      {q.type === 'likert' && (
        <div className="grid5">
          {LIKERT.map(v => (
            <button key={v} onClick={() => onChange(v)} className={cx('chip', { active: value===v })}>{v}</button>
          ))}
        </div>
      )}
      {q.type === 'yesno' && (
        <div className="row">
          {['yes','no'].map(v => (
            <button key={v} onClick={() => onChange(v==='yes')} className={cx('btn', { active: value===(v==='yes') })}>{v.toUpperCase()}</button>
          ))}
        </div>
      )}
      {q.type === 'text' && (
        <textarea rows={3} className="input" value={value||''} onChange={e => onChange(e.target.value)} placeholder="Type here (optional)…" />
      )}
    </div>
  );
}

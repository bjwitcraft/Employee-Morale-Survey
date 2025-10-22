import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebaseAdmin';
import { summarize } from '../../../utils/compute';

type Row = { createdAt: string; meta: any; answers: {id:string; type:'likert'|'yesno'|'text'; value:any}[] };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { range = '30d', team, shift, location } = req.query;
  const now = Date.now();
  const startMs = range === '7d' ? now - 7*864e5 : now - 30*864e5;

  const snap = await db.collection('responses').where('createdAt', '>=', new Date(startMs).toISOString()).get();
  const rows = snap.docs.map(d => d.data()) as Row[];

  const filtered = rows.filter(r => (
    (!team || r.meta?.team === team) &&
    (!shift || r.meta?.shift === shift) &&
    (!location || r.meta?.location === location)
  ));

  const summary = summarize(filtered);

  // Build simple daily time series
  const byDay: Record<string,{likertSum:number;likertCount:number;yes:number;yesTotal:number;count:number}> = {};
  for (const r of filtered) {
    const day = (r.createdAt || '').slice(0,10); // YYYY-MM-DD
    if (!byDay[day]) byDay[day] = { likertSum:0, likertCount:0, yes:0, yesTotal:0, count:0 };
    byDay[day].count += 1;
    for (const a of r.answers) {
      if (a.type === 'likert' && Number.isFinite(Number(a.value))) {
        byDay[day].likertSum += Number(a.value);
        byDay[day].likertCount += 1;
      } else if (a.type === 'yesno') {
        byDay[day].yes += (a.value === true || String(a.value).toLowerCase() === 'yes') ? 1 : 0;
        byDay[day].yesTotal += 1;
      }
    }
  }
  const trend = Object.keys(byDay).sort().map(d => ({
    date: d,
    likertAvg: byDay[d].likertCount ? byDay[d].likertSum / byDay[d].likertCount : 0,
    yesRate: byDay[d].yesTotal ? byDay[d].yes / byDay[d].yesTotal : 0,
    responses: byDay[d].count
  }));

  res.status(200).json({ count: filtered.length, summary, trend });
}

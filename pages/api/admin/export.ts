import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebaseAdmin';
import Papa from 'papaparse';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { range = '30d', team, shift, location } = req.query;
  const now = Date.now();
  const startMs = range === '7d' ? now - 7*864e5 : now - 30*864e5;

  const snap = await db.collection('responses').where('createdAt', '>=', new Date(startMs).toISOString()).get();
  const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const filtered = rows.filter(r => (
    (!team || r.meta?.team === team) &&
    (!shift || r.meta?.shift === shift) &&
    (!location || r.meta?.location === location)
  ));

  // Flatten for CSV: one row per answer
  const flat = filtered.flatMap(r => (r.answers || []).map((a: any) => ({
    response_id: r.id,
    createdAt: r.createdAt,
    team: r.meta?.team || '',
    shift: r.meta?.shift || '',
    location: r.meta?.location || '',
    question_id: a.id,
    type: a.type,
    value: a.value
  })));

  const csv = Papa.unparse(flat);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="morale-pulse-export-${Date.now()}.csv"`);
  res.status(200).send(csv);
}

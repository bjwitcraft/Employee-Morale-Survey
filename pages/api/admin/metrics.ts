import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/firebaseAdmin';
import { summarize } from '../../../utils/compute';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { range = '30d', team, shift, location } = req.query;
  const now = Date.now();
  const startMs = range === '7d' ? now - 7*864e5 : now - 30*864e5;

  const snap = await db.collection('responses').where('createdAt', '>=', new Date(startMs).toISOString()).get();
  const rows = snap.docs.map(d => d.data()) as any[];

  const filtered = rows.filter(r => (
    (!team || r.meta?.team === team) &&
    (!shift || r.meta?.shift === shift) &&
    (!location || r.meta?.location === location)
  ));

  const summary = summarize(filtered);
  res.status(200).json({ count: filtered.length, summary });
}

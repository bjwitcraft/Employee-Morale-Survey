import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { db } from '../../lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

const AnswerSchema = z.object({
  id: z.string(),
  type: z.enum(['likert','yesno','text']),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()])
});

const BodySchema = z.object({
  meta: z.object({ team: z.string().optional(), shift: z.string().optional(), location: z.string().optional(), seed: z.number().optional() }).passthrough(),
  answers: z.array(AnswerSchema).min(3).max(8)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });

  const ip = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0].trim();
  const ua = req.headers['user-agent'] || '';

  const doc = {
    createdAt: new Date().toISOString(),
    meta: { ...parsed.data.meta, ipHash: hash(`${ip}|${ua}`).toString(16) },
    answers: parsed.data.answers.map(a => ({ ...a, value: normalize(a) })),
    req: { ua }
  };
  const id = uuidv4();
  await db.collection('responses').doc(id).set(doc);
  return res.status(201).json({ ok: true, id });
}

function normalize(a: any) {
  if (a.type === 'likert') return Math.max(1, Math.min(5, Number(a.value)));
  if (a.type === 'yesno') return a.value === true || String(a.value).toLowerCase() === 'yes';
  if (a.type === 'text') return String(a.value || '').slice(0, 1000);
  return a.value;
}

function hash(s: string) {
  let h = 0; for (let i=0;i<s.length;i++) { h = Math.imul(31, h) + s.charCodeAt(i) | 0; } return h >>> 0;
}

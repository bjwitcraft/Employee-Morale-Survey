import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { pin } = req.body || {};
  const expected = process.env.ADMIN_PIN || '2808';

  if (!pin || String(pin) !== String(expected)) {
    return res.status(401).json({ ok:false, error: 'Invalid PIN' });
  }

  res.setHeader('Set-Cookie', `mp_admin=ok; HttpOnly; Path=/; Max-Age=${30*24*60*60}; SameSite=Lax; Secure`);
  return res.status(200).json({ ok:true });
}

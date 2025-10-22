import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', `mp_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`);
  res.status(200).json({ ok:true });
}

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};

export default function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const [scheme, encoded] = auth.split(' ');
  const expectedUser = process.env.ADMIN_USERNAME || '';
  const expectedPass = process.env.ADMIN_PASSWORD || '';

  if (scheme === 'Basic' && encoded) {
    const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':');
    if (user === expectedUser && pass === expectedPass) return NextResponse.next();
  }
  return new NextResponse('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Secure"' } });
}

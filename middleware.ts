import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: ['/admin/:path*','/api/admin/:path*'] };

export default function middleware(req: NextRequest) {
  const url = new URL(req.nextUrl);
  const cookie = req.cookies.get('mp_admin')?.value;
  const isLoginPage = url.pathname.startsWith('/admin/login');

  if (isLoginPage) return NextResponse.next();

  if (cookie === 'ok') {
    return NextResponse.next();
  }

  const login = new URL('/admin/login', req.url);
  login.searchParams.set('next', url.pathname + url.search);
  return NextResponse.redirect(login);
}

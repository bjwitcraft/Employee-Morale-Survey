// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export const config = { matcher: ['/admin/:path*','/api/admin/:path*'] };

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // ✅ Allow these without a cookie
  if (pathname === '/admin/login' ||
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout') {
    return NextResponse.next();
  }

  const hasCookie = req.cookies.get('mp_admin')?.value === 'ok';
  if (hasCookie) return NextResponse.next();

  // Redirect everything else in /admin/* or /api/admin/* to the login page
  const login = new URL('/admin/login', req.url);
  login.searchParams.set('next', pathname + search);
  return NextResponse.redirect(login);
}

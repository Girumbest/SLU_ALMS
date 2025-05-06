import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow requests to /api to bypass middleware
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Public routes
  if (pathname.startsWith('/login')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && token.role !== 'HRAdmin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (pathname.startsWith('/supervisor') && token.role !== 'Supervisor') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/supervisor/:path*', '/dashboard/:path*', '/api/:path*'],
};

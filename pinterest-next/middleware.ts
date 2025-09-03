import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt-actions';

const protectedPaths = ['/new-post'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (protectedPaths.some((path: string) => pathname.startsWith(path))) {
    const token = request.cookies.get('jwt')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const decoded = await verifyJWT(token);

    if (!decoded) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/new-post/:path*'],
};

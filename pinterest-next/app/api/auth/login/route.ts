import { NextRequest, NextResponse } from 'next/server';
import { checkPassword } from '@/lib/auth/password-actions';
import { signJWT } from '@/lib/auth/jwt-actions';
import { prismaClient } from '@/prisma/prisma-client';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = (await req.json()) as { email: string, password: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Email not found' }, { status: 401 });
    }

    const isValidPassword = await checkPassword(password, user.password!);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Password does not match' }, { status: 401 });
    }

    const token = signJWT({ email: user.email, id: user.id });
    const { password: _, ...safeUser } = user;
    const res = NextResponse.json({ message: 'Logged in', user: safeUser }, { status: 200 });

    res.cookies.set('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
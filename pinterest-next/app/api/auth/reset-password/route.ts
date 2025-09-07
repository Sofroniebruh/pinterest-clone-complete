import { NextRequest, NextResponse } from 'next/server';
import { signJWT, verifyJWT } from '@/lib/auth/jwt-actions';
import { prismaClient } from '@/prisma/prisma-client';
import { hashPassword } from '@/lib/auth/password-actions';

export async function POST(req: NextRequest) {
  try {
    const { password } = (await req.json()) as { password: string };
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resetToken = await prismaClient.resetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, id } = payload as { email: string; id: number };

    if (resetToken.user.email !== email || resetToken.user.id !== id) {
      return NextResponse.json({ error: 'Token mismatch' }, { status: 401 });
    }

    await prismaClient.resetToken.update({
      where: { token },
      data: { used: true },
    });

    const updatedUser = await prismaClient.user.update({
      where: {
        email,
      },
      data: {
        password: await hashPassword(password),
      },
    });

    const newToken = signJWT({ email: resetToken.user.email, id: resetToken.user.id });
    const { password: _, ...safeUser } = updatedUser;

    const res = NextResponse.json({ message: 'Password updated successfully', user: safeUser }, { status: 200 });
    res.cookies.set('jwt', newToken, {
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
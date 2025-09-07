import { NextRequest, NextResponse } from 'next/server';
import { generateResetJWT } from '@/lib/auth/jwt-actions';
import { prismaClient } from '@/prisma/prisma-client';

export async function POST(req: NextRequest) {
  try {
    const userEmail = await req.json() as { email: string };

    const user = await prismaClient.user.findUnique({
      where: {
        email: userEmail.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prismaClient.resetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    const token = generateResetJWT({ email: user.email, id: user.id });
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await prismaClient.resetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_ROUTE}/forgot-password?token=${token}`;

    const res = await fetch(`${process.env.AWS_API_GATEWAY_URL}/send-email-with-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.API_GATEWAY_KEY!,
      },
      body: JSON.stringify(
        {
          email: user.email,
          subject: 'Reset your password',
          messageBody: resetLink,
        },
      ),
    });

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return NextResponse.json({ message: 'Successfully sent' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
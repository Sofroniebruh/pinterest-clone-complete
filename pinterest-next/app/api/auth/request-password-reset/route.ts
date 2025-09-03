import { NextRequest, NextResponse } from 'next/server';
import { generateResetJWT } from '@/lib/auth/jwt-actions';
import { getUserByToken } from '@/lib/helpers/helper-functions';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserByToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = generateResetJWT({ email: user.email, id: user.id });
    const resetLink = `${process.env.NEXT_PUBLIC_ROUTE}/forgot-password?token=${token}`;

    console.log(resetLink);
    //TODO: ADD SENDING EMAILS WITH TWILLO

    return NextResponse.json({ message: 'Successfully sent' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
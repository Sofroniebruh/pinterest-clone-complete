import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

    res.cookies.set('jwt', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
    });

    return res;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
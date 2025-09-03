import { verifyJWT } from '@/lib/auth/jwt-actions';
import { NextRequest } from 'next/server';

export async function tokenCheck(req: NextRequest) {
  const token = req.cookies.get('jwt')?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    return null;
  }

  return payload.email as string;
}
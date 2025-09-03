import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

const SECRET = process.env.SECRET!;

export function signJWT(payload: object) {
  return jwt.sign(payload, SECRET, {
    expiresIn: '1d',
  });
}

export async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(SECRET);
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export function generateResetJWT(payload: object) {
  return jwt.sign(payload, SECRET, {
    expiresIn: '15m',
  });
}
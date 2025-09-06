import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { prismaClient } from '@/prisma/prisma-client';
import { signJWT } from '@/lib/auth/jwt-actions';
import { cookies } from 'next/headers';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      const existingUser = await prismaClient.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        await prismaClient.user.create({
          data: {
            email: user.email!,
            pfpUrl: user.image,
            username: user.email,
          },
        });
      }

      const customToken = signJWT({ email: user.email });
      (await cookies()).set('jwt', customToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

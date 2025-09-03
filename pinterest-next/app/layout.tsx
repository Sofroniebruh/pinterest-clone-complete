import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { AuthProvider } from '@/components/providers/providers';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prismaClient } from '@/prisma/prisma-client';
import { UserWithNoPassword } from '@/lib/helpers/helper-types-or-interfaces';

export const metadata: Metadata = {
  title: 'Cube',
  description: 'Cube app for portfolio',
};

export default async function RootLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

  let user: UserWithNoPassword | null = null;

  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;

  if (token) {
    try {
      const payload = await verifyJWT(token);
      const email = payload?.email as string;

      const dbUser = await prismaClient.user.findUnique({
        where: { email },
      });

      if (dbUser) {
        const { password: _, ...safeUser } = dbUser;
        user = {
          id: safeUser.id,
          email: safeUser.email,
          username: safeUser.username!,
          pfpUrl: safeUser.pfpUrl,
        };
      }
    } catch (err) {
      console.error('User fetch failed', err);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
    <body className="h-full" suppressHydrationWarning>
    <AuthProvider user={user}>
      {children}
    </AuthProvider>
    </body>
    </html>
  );
}

'use client';

import { SessionProvider } from 'next-auth/react';
import React, { ReactNode } from 'react';
import { Toaster } from '@/components/ui-components/ui/sonner';
import { AuthProviderUser } from '@/components/contexts/auth-context';
import { UserWithNoPassword } from '@/lib/helpers/helper-types-or-interfaces';

export function AuthProvider({ children, user }: { children: ReactNode, user: UserWithNoPassword | null }) {
  return (
    <SessionProvider>
      <AuthProviderUser initialUser={user}>
        {children}
      </AuthProviderUser>
      <Toaster />
    </SessionProvider>
  );
}

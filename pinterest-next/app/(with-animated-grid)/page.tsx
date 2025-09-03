'use client';

import { Button } from '@/components/ui-components/ui/button';
import { LogInIcon, UserIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { CommonCard } from '@/components/common';
import { useAuth } from '@/components/contexts/auth-context';
import { useStore } from 'zustand/react';
import { sheetStore } from '@/lib/store';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const setAllSheetsClosed = useStore(sheetStore, (state) => state.setAllSheetsClosed);

  return (
    <CommonCard>
      <h1 className={'text-3xl sm:text-4xl font-semibold'}>Welcome to <span
        className={'text-blue-600'}>Cube</span></h1>
      <div className={'z-50 flex flex-col items-center justify-center gap-5 w-full'}>
        {isAuthenticated && user ? (
          <Link href={`/profile/${user.id}`} className={'w-full flex items-center justify-center'}>
            <Button
              className={'w-2/3 shadow-sm bg-linear-to-r/decreasing from-gray-50 to-white text-black border text-base sm:text-lg py-5 rounded-lg'}>
              Profile <UserIcon></UserIcon>
            </Button>
          </Link>
        ) : (
          <Link href="/sign-in" className={'w-full flex items-center justify-center'}>
            <Button
              className={'w-2/3 shadow-sm bg-linear-to-r/decreasing from-gray-50 to-white text-black border text-base sm:text-lg py-5 rounded-lg'}>Sign
              in <LogInIcon></LogInIcon></Button>
          </Link>
        )}
        <Link onClick={setAllSheetsClosed} href="/posts" className={'w-full flex items-center justify-center'}>
          <Button
            className={'w-2/3 shadow-sm bg-linear-to-r/decreasing from-blue-50 to-white text-black border text-base sm:text-lg py-5 rounded-lg'}>Browse...</Button>
        </Link>
      </div>
    </CommonCard>
  );
}

'use client';

import { ImageIcon, LogInIcon, MenuIcon, PlusIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui-components/ui/button';
import { SheetComponent } from '@/components/common';
import { HeaderSearchSmall } from '@/components/header-section/header-search-small';
import { HeaderSearchBig } from '@/components/header-section/header-search-big';
import React from 'react';
import { useAuth } from '@/components/contexts/auth-context';
import { useStore } from 'zustand/react';
import { sheetStore } from '@/lib/store';
import { Sheet } from '@/lib/store/sheet-store';

export const HeaderComponent = () => {
  const pathname = usePathname();
  const isProfilePage = pathname.startsWith('/profile');
  const isEditPostPage = pathname.includes('/edit-post');
  const { isAuthenticated, user } = useAuth();
  const sheets = useStore(sheetStore, (state) => state.sheets);
  const isHeaderSheetOpen = sheets.some((s : Sheet) => s.key.name === 'header sheet');
  const setIsSheetOpen = useStore(sheetStore, (state) => state.setIsSheetOpen);

  return (
    <header
      className={'flex py-5 px-5 w-full justify-between items-center bg-white/70 backdrop-blur-md fixed top-0 z-50'}>
      <SheetComponent openState={isHeaderSheetOpen} triggerElement={<MenuIcon
        onClick={() => setIsSheetOpen(true, { key: { name: 'header sheet' }, value: true })} size={25}
        className={'cursor-pointer'}></MenuIcon>}
                      sheetTitle={'Menu'}
                      side={'left'}>
        <div className={'flex flex-col p-10 gap-5 max-w-[345px] sm:w-full'}>
          <h1 className={'text-3xl sm:text-5xl font-semibold'}>Cube</h1>
          <div className={'w-full h-0.5 bg-black'}></div>
          <ul>
            <Link onClick={() => setIsSheetOpen(false, { key: { name: 'header sheet' }, value: false })}
                  href={'/posts'}>
              <li
                className={cn('text-lg sm:text-2xl flex gap-2 items-center justify-start cursor-pointer', pathname.startsWith('/posts') && 'text-blue-600')}>
                <ImageIcon></ImageIcon> Posts
              </li>
            </Link>
            {isAuthenticated && user ? (
              <Link onClick={() => setIsSheetOpen(false, { key: { name: 'header sheet' }, value: false })}
                    href={`/profile/${user.id}`}>
                <li
                  className={cn('text-lg sm:text-2xl flex gap-2 items-center justify-start cursor-pointer', pathname.startsWith('/profile') && !pathname.includes('new-post') && 'text-blue-600')}>
                  <UserIcon></UserIcon> Profile
                </li>
              </Link>
            ) : (
              <Link href="/sign-in" className={'w-full flex items-center mt-4'}>
                <Button
                  className={'w-full shadow-sm bg-linear-to-r/decreasing from-gray-50 to-white text-black border text-base sm:text-lg py-5 rounded-lg'}>Sign
                  in <LogInIcon></LogInIcon></Button>
              </Link>
            )
            }
          </ul>
          {isAuthenticated && user && (
            <Link onClick={() => setIsSheetOpen(false, { key: { name: 'header sheet' }, value: false })}
                  href={`/profile/${user.id}/new-post`}>
              <Button size={'lg'}
                      className={'w-full bg-blue-600 mt-5 sm:mt-10 text-base hover:bg-blue-700 sm:text-xl sm:py-6 cursor-pointer text-center'}>Add
                new
                Post <PlusIcon /></Button>
            </Link>
          )}
        </div>
      </SheetComponent>
      {(!isEditPostPage && !isProfilePage) && (
        <>
          <HeaderSearchBig />
          <HeaderSearchSmall />
        </>
      )}
      <Link href={'/'}>
        <Image src={'/main_logo.png'} width={40} height={40} alt={'main logo'}></Image>
      </Link>
    </header>
  );
};
'use client';

import { Input } from '@/components/ui-components/ui/input';
import { SheetComponent } from '@/components/common';
import { SearchIcon } from 'lucide-react';
import Image from 'next/image';
import { CategoriesSection } from '@/components/header-section/categories-section';
import { useTags } from '@/components/contexts/tag-context';
import { Tags } from '@prisma/client';
import { useStore } from 'zustand/react';
import { sheetStore } from '@/lib/store';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export const HeaderSearchBig = () => {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [randomTags, setRandomTags] = useState<Tags[] | []>([]);
  const { tags } = useTags();
  const sheets = useStore(sheetStore, (state) => state.sheets);
  const setIsSheetOpen = useStore(sheetStore, (state) => state.setIsSheetOpen);
  const isOpenSearchSheet = sheets.some((sheet) => sheet.key.name === 'search sheet');

  const handleSubmit = (query: string) => {
    router.replace(`/posts?search=${query}`);
    router.refresh();
  };
  const handleKeyEnter = (key: React.KeyboardEvent<HTMLInputElement>, query: string) => {
    if (key.key === 'Enter') {
      setIsSheetOpen(false, { key: { name: 'search sheet' }, value: false });
      handleSubmit(query);
    }
  };

  const headerInput = (
    <div onClick={
      () => setIsSheetOpen(true, { key: { name: 'search sheet' }, value: true })
    } className={'relative w-full'}>
      <Input onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyEnter(e, value)}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
               setValue(e.target.value);
             }}
             className={'bg-white w-full pl-[34px]'}
             placeholder={'Search...'}></Input>
      <SearchIcon className={'text-blue-600 absolute top-[7px] left-[7px] opacity-50'}></SearchIcon>
    </div>
  );

  useEffect(() => {
    if (!isOpenSearchSheet) return;
    setRandomTags(getRandomElements(tags, 3));
  }, [isOpenSearchSheet]);

  return (
    <>
      <div className={'relative hidden sm:block sm:w-full mx-10'}>
        <SheetComponent openState={isOpenSearchSheet} className={'w-full'} triggerElement={
          headerInput
        } sheetTitle={
          <Image src={'/main_logo.png'} width={30} height={30} alt={'main logo'}></Image>
        } side={'top'}>
          <div className={'px-4 pb-4'}>
            {headerInput}
            <CategoriesSection setIsSheetOpen={setIsSheetOpen} className={'mt-4'} items={randomTags} />
          </div>
        </SheetComponent>
      </div>
    </>
  );
};
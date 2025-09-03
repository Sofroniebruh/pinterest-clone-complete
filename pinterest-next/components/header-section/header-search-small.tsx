'use client';

import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui-components/ui/input';
import { Button } from '@/components/ui-components/ui/button';
import { DialogComponent } from '@/components/common';
import { CategoriesSection } from '@/components/header-section/categories-section';
import { Tags } from '@prisma/client';
import { useTags } from '@/components/contexts/tag-context';
import { useStore } from 'zustand/react';
import { dialogStore } from '@/lib/store';
import { getRandomElements } from '@/components/header-section/header-search-big';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const HeaderSearchSmall = () => {
  const { tags } = useTags();
  const dialogs = useStore(dialogStore, (state) => state.dialogs);
  const isOpenSearchDialog = dialogs.some((d) => d.key.name === 'smallSearch');
  const setIsOpen = useStore(dialogStore, (state) => state.setIsOpen);
  const [value, setValue] = useState('');
  const [randomTags, setRandomTags] = useState<Tags[] | []>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isOpenSearchDialog) return;
    setRandomTags(getRandomElements(tags, 3));
  }, [isOpenSearchDialog]);

  const handleSubmit = (query: string) => {
    setIsOpen(false, { key: { name: 'smallSearch' }, value: false });
    router.replace(`/posts?search=${query}`);
    router.refresh();
  };

  return (
    <DialogComponent openState={isOpenSearchDialog}
                     triggerButton={
                       <div
                         onClick={
                           () => setIsOpen(true, { key: { name: 'smallSearch' }, value: true })
                         }
                         className={'sm:hidden relative pl-14 pr-7 bg-blue-600 text-center flex cursor-pointer text-base px-4 py-2 rounded-2xl text-white'}>
                         <SearchIcon className={'absolute top-2 left-2 '}></SearchIcon> Search...
                       </div>}
                     title={'Search'}>
      <div className={'flex flex-col gap-5'}>
        <div className={'relative w-full flex gap-2'}>
          <Input onChange={(e) => (setValue(e.target.value))} className={'w-full pl-[34px]'}
                 placeholder={'Search...'}></Input>
          <SearchIcon className={'text-blue-600 absolute top-[7px] left-[7px] opacity-50'}></SearchIcon>
          <Button onClick={() => handleSubmit(value)} className={'bg-blue-600 hover:bg-blue-700'}>Go</Button>
        </div>
        <CategoriesSection setIsDialogOpen={setIsOpen} items={randomTags} />
      </div>
    </DialogComponent>
  );
};
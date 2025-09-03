'use client';

import { Tags } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/lib/store/sheet-store';
import { Dialog } from '@/lib/store/dialog-store';

interface Props {
  items: Tags[],
  className?: string
  setIsSheetOpen?: (isOpen: boolean, sheet: Sheet) => void
  setIsDialogOpen?: (isOpen: boolean, dialog: Dialog) => void
}

export const CategoriesSection = ({ items, className, setIsSheetOpen, setIsDialogOpen }: Props) => {
  const router = useRouter();

  const handleClick = async (tagName: string) => {
    setIsSheetOpen && setIsSheetOpen(false, { key: { name: 'search sheet' }, value: false });
    setIsDialogOpen && setIsDialogOpen(false, { key: { name: 'smallSearch' }, value: false });
    router.replace(`/posts?tag=${tagName}`);
    router.refresh();
  };

  return (
    <div className={className}>
      <h1 className={'text-2xl text-blue-600'}>Tags you may like:</h1>
      <ul className={'text-xl mt-2.5'}>
        {
          items.map((tag, index) => (
            <li onClick={() => handleClick(tag.tagName)} className={'cursor-pointer hover:text-blue-600 w-fit'}
                key={index}>#{tag.tagName}</li>
          ))
        }
      </ul>
    </div>
  );
};
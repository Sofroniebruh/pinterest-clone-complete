import { Button } from '@/components/ui-components/ui/button';
import React from 'react';
import { Separator } from '@/components/ui/separator';

interface Props {
  deleteButton: React.ReactNode;
  setDialogOpen: () => void;
}

export const DeleteDialogComponent = ({ deleteButton, setDialogOpen }: Props) => {
  return (
    <div className={'w-full flex items-center justify-center flex-col gap-4'}>
      <Separator></Separator>
      <div className={'w-full flex items-center justify-center gap-5'}>
        {deleteButton}
        <Button onClick={setDialogOpen} size={'lg'} variant={'outline'}>Cancel</Button>
      </div>
    </div>
  );
};
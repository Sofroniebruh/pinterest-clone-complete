import React from 'react';
import { HeaderComponent } from '@/components/header-section';
import { cn } from '@/lib/utils';
import { TagProvider } from '@/components/contexts/tag-context';
import { API } from '@/lib/api-client/api';

interface Props {
  children: React.ReactNode;
}

export default async function ChildLayoutChildren({ children }: Props) {
  const tags = await API.tags.getAllTags();

  return (
    <>
      <TagProvider tags={tags.tags}>
        <HeaderComponent></HeaderComponent>
        <div className={cn('min-h-screen my-[80px]')}>
          <div id="modal-root"></div>
          {children}
        </div>
      </TagProvider>
    </>
  );
}



import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-components/ui/tabs';
import React from 'react';

interface Props {
  mainClassName?: string,
  tabs: TabsTrigger[],
  content: TabsContent[],
}

export type TabsTrigger = {
  value: string,
  name: string,
}

export type TabsContent = {
  value: string,
  content: React.ReactNode,
}

export const TabsComponent = ({ mainClassName, tabs, content }: Props) => {
  return (
    <Tabs defaultValue="created" className={mainClassName}>
      <TabsList className={'flex items-center justify-center w-full max-w-[320px]'}>
        {tabs.map((tab, i) => (
          <TabsTrigger className={'cursor-pointer'} key={i} value={tab.value}>{tab.name}</TabsTrigger>
        ))}
      </TabsList>
      {content.map((content, i) => (
        <TabsContent className={'w-full mt-[80px]'} key={i} value={content.value}>{content.content}</TabsContent>
      ))}
    </Tabs>
  );
};
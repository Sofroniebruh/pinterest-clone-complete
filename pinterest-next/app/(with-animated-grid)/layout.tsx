import React from 'react';
import { AnimatedGridPattern } from '@/components/ui-components/magicui/animated-grid-pattern';
import { cn } from '@/lib/utils';

export default function WithGridLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <main className={'overflow-hidden h-screen relative'}>
      <AnimatedGridPattern
        color={'#155dfc'}
        maxOpacity={0.1}
        className={cn(
          'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 z-0',
        )}
      />
      {children}
    </main>
  );
}
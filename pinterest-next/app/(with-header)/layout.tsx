import React from 'react';
import ChildLayoutChildren from '@/components/child-layout-children';

export default function ChildLayout(
  {
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {

  return (
    <main className={'relative min-h-screen'}>
      <ChildLayoutChildren>{children}</ChildLayoutChildren>
    </main>
  );
}
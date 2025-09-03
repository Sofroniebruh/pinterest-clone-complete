import * as React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  text: string;
}

export const NoPosts = ({ className, text }: Props) => {
  return (
    <div className={cn('flex justify-center items-center w-full min-h-[300px]', className)}>
      <h1 className={'text-lg sm:text-3xl text-gray-700'}>{text}</h1>
    </div>
  );
};
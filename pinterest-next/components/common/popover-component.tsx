import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  trigger: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export const PopoverComponent = ({ trigger, content, className }: Props) => {
  return (
    <Popover>
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent className={cn(className)}>{content}</PopoverContent>
    </Popover>
  );
};
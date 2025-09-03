import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui-components/ui/hover-card';
import React from 'react';

interface Props {
  trigger: React.ReactNode,
  content: string,
}

export const HoverCardComponent = ({ trigger, content }: Props) => {
  return (
    <HoverCard>
      <HoverCardTrigger>{trigger}</HoverCardTrigger>
      <HoverCardContent className={'w-full'}>
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};
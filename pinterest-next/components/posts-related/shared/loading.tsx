import * as React from 'react';
import { MasonryLayout } from '@/components/common/masonry-layout';
import { Skeleton } from '@/components/ui-components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export const Loading = ({ className }: Props) => {
  const skeletonArray = Array.from({ length: 10 });
  const aspectRatios = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[1/1]'];

  return (
    <MasonryLayout>
      {
        skeletonArray.map((_, index) => (
          <Skeleton key={index}
                    className={cn('w-full break-inside-avoid', aspectRatios[index % aspectRatios.length])}></Skeleton>
        ))
      }
    </MasonryLayout>
  );
};
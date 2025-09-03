'use client';

import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const MasonryLayout = ({ children, className }: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const breakpointColumnsObj = {
    default: 6,
    1400: 5,
    1321: 4,
    1024: 3,
    768: 2,
    640: 2,
    520: 1,
  };

  return (
    <Masonry
      className={cn('flex gap-4', !isMounted && 'invisible', className)}
      columnClassName="space-y-4"
      breakpointCols={breakpointColumnsObj}>
      {children}
    </Masonry>
  );
};
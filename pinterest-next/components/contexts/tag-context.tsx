'use client';

import React, { createContext, useContext } from 'react';
import { Tags } from '@prisma/client';

type TagContextType = {
  tags: Tags[]
}

export const TagContext = createContext<TagContextType | null>(null);

export const TagProvider = ({ children, tags }: { children: React.ReactNode, tags: Tags[] }) => {
  return (
    <TagContext.Provider value={{ tags }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTags = (): TagContextType => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};
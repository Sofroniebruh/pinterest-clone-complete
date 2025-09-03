'use client';

import { PostOwner, PostWithRelations } from '@/lib/helpers/helper-types-or-interfaces';
import React, { createContext, useContext } from 'react';

type PostContextType = {
  post: PostWithRelations;
  owner: PostOwner;
  isOwner: boolean;
  totalLikes: string;
}

export const PostContext = createContext<PostContextType | null>(null);

export const PostProvider = ({ children, post, owner, isOwner, totalLikes }: {
  children: React.ReactNode,
  post: PostWithRelations
  owner: PostOwner,
  isOwner: boolean,
  totalLikes: string,
}) => {
  return (
    <PostContext.Provider value={{ post, owner, isOwner, totalLikes }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
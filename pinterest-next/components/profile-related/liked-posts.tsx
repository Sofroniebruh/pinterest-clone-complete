'use client';

import { PostCardComponent } from '@/components/posts-related';
import * as React from 'react';
import { MasonryLayout } from '@/components/common/masonry-layout';
import { useTagPosts } from '@/lib/hooks/useTagPosts';
import { Loading, NoPosts } from '../posts-related/shared';

interface Props {
  id: number;
}

export const LikedPosts = ({ id }: Props) => {
  const { postsWithAction, loading } = useTagPosts('liked', id);

  if (loading) {
    return (
      <Loading></Loading>
    );
  }

  if (postsWithAction.length === 0 && !loading) {
    return (
      <NoPosts text={'Nothing is to your liking yet...'}></NoPosts>
    );
  }

  return (
    <MasonryLayout>
      {
        postsWithAction.length > 0 && (
          postsWithAction.map((post, index) => (
            <PostCardComponent isOwner={post.isOwner} id={post.id} key={index}
                               image={post.postImageUrl} />
          ))
        )
      }
    </MasonryLayout>
  );
};
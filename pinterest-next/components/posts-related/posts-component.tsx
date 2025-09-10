'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { API } from '@/lib/api-client/api';
import { MasonryLayout } from '@/components/common';
import { Loading, NoPosts } from '@/components/posts-related/shared';
import { PostCardComponent } from '@/components/posts-related/post-card-component';
import { PostsWithLikedByCurrentUser } from '@/lib/helpers/helper-types-or-interfaces';
import { useSearchParams } from 'next/navigation';

interface Props {
  isPostPage?: boolean;
  postId?: string;
}

export const PostsComponent = ({ isPostPage, postId }: Props) => {
  const [loadedPosts, setLoadedPosts] = useState<PostsWithLikedByCurrentUser[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const endPageDiv = useRef<HTMLDivElement>(null);
  const [lastPostId, setLastPostId] = useState<number | undefined>();

  const fetchPosts = useCallback(async (isInitialLoad = false) => {
    if (loadingMore && !isInitialLoad) return;
    
    if (!isInitialLoad) setLoadingMore(true);
    
    try {
      const { posts } = isPostPage ? await API.posts.getPostsWithoutOpenedPost(postId!, lastPostId) :
        tag ?
          await API.posts.getPosts(tag, false, lastPostId) :
          search ?
            await API.posts.getPosts(search, true, lastPostId) :
            await API.posts.getPosts('', false, lastPostId);
      
      if (posts && posts.length > 0) {
        setLoadedPosts(prev => isInitialLoad ? posts : [...prev, ...posts]);
        setLastPostId(posts[posts.length - 1].id);
        setHasMore(posts.length === 50);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [isPostPage, postId, lastPostId, tag, search, loadingMore]);

  useEffect(() => {
    setHasMounted(true);
    setLoadedPosts([]);
    setLastPostId(undefined);
    setHasMore(true);
    setLoading(true);
  }, [tag, search]);

  useEffect(() => {
    if (hasMounted && loading) {
      fetchPosts(true);
    }
  }, [hasMounted, loading, fetchPosts]);

  useEffect(() => {
    if (!endPageDiv.current || !hasMore || loadingMore) return;

    const observerTarget = endPageDiv.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          fetchPosts(false);
        }
      });
    }, {
      rootMargin: '100px',
    });

    observer.observe(observerTarget);

    return () => {
      observer.unobserve(observerTarget);
    };
  }, [lastPostId, hasMore, loadingMore]);

  if (!hasMounted) return null;

  if (loading) {
    return (
      <div className={'px-5'}>
        <Loading></Loading>
      </div>);
  }

  if (!loading && loadedPosts.length == 0) {
    return (
      <NoPosts text={'No posts here yet...'}></NoPosts>
    );
  }

  return (
    <>
      <div className={'px-5'}>
        <MasonryLayout>
          {
            loadedPosts.map((post, index) => (
              <PostCardComponent isLiked={post.isLikedByCurrentUser} isOwner={post.isOwner} key={index} id={post.id}
                                 image={post.postImageUrl}></PostCardComponent>
            ))
          }
        </MasonryLayout>
      </div>
      {loadingMore && (
        <div className="px-5 py-4">
          <Loading />
        </div>
      )}
      <div ref={endPageDiv} />
    </>
  );
};



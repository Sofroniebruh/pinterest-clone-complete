'use client';

import { useEffect, useState } from 'react';
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
  const [posts, setPosts] = useState<PostsWithLikedByCurrentUser[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');

  useEffect(() => {
    setHasMounted(true);
    const fetchPosts = async () => {
      const { posts } = isPostPage ? await API.posts.getPostsWithoutOpenedPost(postId!) :
        tag ?
          await API.posts.getPosts(tag, false) :
          search ?
            await API.posts.getPosts(search, true) :
            await API.posts.getPosts('', false);
      if (posts) {
        setPosts(posts);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [tag, search]);

  if (!hasMounted) return null;

  if (loading) {
    return (
      <div className={'px-5'}>
        <Loading></Loading>
      </div>);
  }

  if (!loading && posts.length == 0) {
    return (
      <NoPosts text={'No posts here yet...'}></NoPosts>
    );
  }

  return (
    <div className={'px-5'}>
      <MasonryLayout>
        {
          posts.map((post, index) => (
            <PostCardComponent isLiked={post.isLikedByCurrentUser} isOwner={post.isOwner} key={index} id={post.id}
                               image={post.postImageUrl}></PostCardComponent>
          ))
        }
      </MasonryLayout>
    </div>
  );
};



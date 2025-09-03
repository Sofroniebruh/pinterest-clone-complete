import useSWR, { mutate as globalMutate } from 'swr';
import { API } from '@/lib/api-client/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useLikes = (postId: number) => {
  const endpoint = `${process.env.NEXT_PUBLIC_API_ROUTE}/posts/${postId}`;

  const {
    data,
    isLoading,
    error,
    mutate,
  } = useSWR(endpoint, fetcher);

  const toggleLikes = async () => {
    if (!data || !data.post) return;

    const { post } = data;
    const hasLiked = post.isLikedByUser;
    const currentLikes = post.likes.length;

    const optimisticData = {
      ...data,
      post: {
        ...post,
        isLikedByUser: !hasLiked,
        likes: Array(hasLiked ? currentLikes - 1 : currentLikes + 1).fill({ userId: 0 }),
      },
    };

    try {
      await globalMutate(endpoint, optimisticData, false);
      await API.posts.likePost(postId);
      await mutate();
    } catch (err) {
      console.error(err);
      await globalMutate(endpoint, data, false);
    }
  };

  return {
    totalLikes: data?.post?.likes?.length || 0,
    hasLiked: data?.post?.isLikedByUser || false,
    toggleLikes,
    isLoading,
    error,
  };
};

import { useEffect, useState } from 'react';
import { API } from '@/lib/api-client/api';
import { PlainPostsWithIsOwner } from '@/lib/helpers/helper-types-or-interfaces';

export const useTagPosts = (tagType: 'created' | 'commented' | 'liked', id: number) => {
  const [posts, setPosts] = useState<PlainPostsWithIsOwner[] | []>([]);
  const [loading, setLoading] = useState(true);

  const fetchers = {
    created: API.getUserInfo.getAllPostsCreatedByUser,
    liked: API.getUserInfo.getAllPostsLikedByUser,
    commented: API.getUserInfo.getAllPostsCommentedByUser,
  };

  const fetchPosts = async () => {
    setLoading(true);
    if (!tagType || !fetchers[tagType]) return;
    const { posts } = await fetchers[tagType](id.toString());
    setPosts(posts);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    loading,
    postsWithAction: posts,
  };
};
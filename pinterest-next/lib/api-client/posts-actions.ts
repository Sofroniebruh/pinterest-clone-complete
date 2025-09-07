import { PostsWithLikedByCurrentUser } from '@/lib/helpers/helper-types-or-interfaces';
import { PostData } from '@/lib/api-client/change-user-info';

export async function getPosts(query: string, isSearch: boolean, lastId?: number | null) {
  const url = isSearch ? `${process.env.NEXT_PUBLIC_API_ROUTE}/posts?search=${query}&lastId=${lastId}` :
    `${process.env.NEXT_PUBLIC_API_ROUTE}/posts?tag=${query}&lastId=${lastId}`;
  const res = await fetch(url, {
    method: 'GET',
  });

  if (res.ok) {
    return (await res.json()) as { posts: PostsWithLikedByCurrentUser[] };
  }

  throw new Error(res.statusText);
}

export async function getPostsWithoutOpenedPost(id: string, lastId?: number | null) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/posts?excluding=${id}&lastId=${lastId}`, {
    method: 'GET',
  });

  if (res.ok) {
    return (await res.json()) as { posts: PostsWithLikedByCurrentUser[] };
  }

  throw new Error(res.statusText);
}

export async function likePost(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/posts/${id}`, {
    method: 'PATCH',
  });

  return res.ok;
}

export async function deletePost(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/posts/${id}`, {
    method: 'DELETE',
  });

  return res.ok;
}

export async function updatePost(data: PostData, id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(
      {
        postName: data.name,
        postImageUrl: data.imageUrl,
        description: data.description,
        selectedTags: data.selectedTags,
      },
    ),
  });

  return res.ok;
}


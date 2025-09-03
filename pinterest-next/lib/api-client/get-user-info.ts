import { PlainPostsWithIsOwner, UserWithNoPassword } from '@/lib/helpers/helper-types-or-interfaces';

export const getUserInfo = async (id: string, token?: string | undefined) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}`, {
    method: 'GET',
    headers: {
      Cookie: `jwt=${token}`,
    },
  });

  if (res.ok) {
    return (await res.json()) as { user: UserWithNoPassword, isOwner: boolean };
  }

  return new Error(res.statusText);
};

export const getAllPostsLikedByUser = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}/liked-posts`, {
    method: 'GET',
  });

  if (res.ok) {
    return (await res.json()) as { posts: PlainPostsWithIsOwner[] };
  }

  if (res.status === 401 || res.status === 403) {
    return { posts: [] };
  }

  throw new Error(res.statusText);
};

export const getAllPostsCreatedByUser = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}/created-posts`, {
    method: 'GET',
  });

  if (res.ok) {
    return (await res.json()) as { posts: PlainPostsWithIsOwner[] };
  }

  throw new Error(res.statusText);
};

export const getAllPostsCommentedByUser = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}/commented-posts`, {
    method: 'GET',
  });

  if (res.ok) {
    return (await res.json()) as { posts: PlainPostsWithIsOwner[] };
  }

  throw new Error(res.statusText);
};
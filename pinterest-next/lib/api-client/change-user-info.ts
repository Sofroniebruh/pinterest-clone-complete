import { PostSchemaType } from '@/components/auth/schema';
import { TagsWithIsCreated } from '@/lib/helpers/helper-types-or-interfaces';

export interface PostData extends PostSchemaType {
  imageUrl: string;
  selectedTags: TagsWithIsCreated[];
}

export const changeUsername = async (username: string, id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: username }),
  });

  return res.ok;
};

export async function deleteUser(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}`, {
    method: 'DELETE',
  });

  return res.ok;
}

export async function changeUserPfp(link: string, id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pfpUrl: link }),
  });

  return res.ok;
}

export async function createUserPost(data: PostData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      selectedTags: data.selectedTags,
    }),
  });

  return res.ok;
}
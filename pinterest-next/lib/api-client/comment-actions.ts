import { CommentStructure, EditCommentStructure } from '@/lib/helpers/helper-types-or-interfaces';
import { Comment } from '@/components/common/comments-component';

const route = `${process.env.NEXT_PUBLIC_API_ROUTE}/comments`;

export async function createComment(data: CommentStructure) {
  const res = await fetch(`${route}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: data.message,
      id: data.id,
    }),
  });

  if (res.ok) {
    return (await res.json()) as { comment: Comment };
  }

  throw new Error(res.statusText);
}

export async function updateComment(data: EditCommentStructure) {
  const res = await fetch(`${route}/${data.commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: data.message,
    }),
  });

  return res.ok;
}

export async function deleteComment(commentId: number) {
  const res = await fetch(`${route}/${commentId}`, {
    method: 'DELETE',
  });

  return res.ok;
}

export async function toggleLikeOnComment(commentId: number) {
  const res = await fetch(`${route}/${commentId}`, {
    method: 'PATCH',
  });

  return res.ok;
}
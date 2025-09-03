import { PostProvider } from '@/components/contexts/post-context';
import { PostOwner, PostWithRelations } from '@/lib/helpers/helper-types-or-interfaces';
import { cookies } from 'next/headers';
import { PostComponent } from '@/components/posts-related';
import { redirect } from 'next/navigation';

export default async function PostPage(
  { params }: {
    params: Promise<{ id: string }>;
  }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt')?.value;

  const totalLikesValidator = (likes: number): string => {
    if (likes >= 1_000_000) {
      return `${parseFloat((likes / 1_000_000).toFixed(2))}M`;
    } else if (likes >= 1_000) {
      return `${parseFloat((likes / 1_000).toFixed(2))}k`;
    }

    return likes.toString();
  };

  const postId = Number(id);
  if (!postId || !Number.isSafeInteger(postId) || postId > 2147483647) {
    redirect('/not-found');
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/posts/${postId}`, {
      method: 'GET',
      headers: {
        Cookie: `jwt=${token}`,
      },
    });

    if (!res.ok) {
      redirect('/not-found');
    }

    const data = (await res.json()) as { post: PostWithRelations, owner: PostOwner, isOwner: boolean };
    const { post, owner, isOwner } = data;

    if (data.post) {
      const likes = data.post.likes.length;
      const totalLikes = totalLikesValidator(likes);

      return (
        <PostProvider post={post} owner={owner} isOwner={isOwner} totalLikes={totalLikes}>
          <PostComponent />
        </PostProvider>
      );
    } else {
      return null;
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error('Failed to fetch post data:', e.message);
      redirect('/not-found');
    }
    console.error('Failed to fetch post data:', e);
    redirect('/not-found');
  }
}
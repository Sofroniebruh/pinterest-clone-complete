import { EditPostComponent } from '@/components/posts-related';
import { prismaClient } from '@/prisma/prisma-client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function EditPostPage(
  { params }: {
    params: Promise<{ id: string }>;
  }) {
  const { id } = await params;
  const cookiesStore = await cookies();
  const token = cookiesStore.get('jwt')?.value;

  if (!token) {
    redirect('/sign-in');
  }

  const postId = Number(id);
  if (!postId || !Number.isSafeInteger(postId) || postId > 2147483647) {
    redirect('/not-found');
  }

  const post = await prismaClient.post.findUnique({
    where: {
      id: postId,
    },
    include: {
      tagAndPosts: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!post) {
    redirect('/not-found');
  }

  return (
    <EditPostComponent post={post}></EditPostComponent>
  );
}
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/prisma-client';
import { Comment } from '@/components/common/comments-component';
import { deleteKeysWithPrefix, getUserByToken } from '@/lib/helpers/helper-functions';

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as { message: string, id: number };
    const user = await getUserByToken(req);

    if (typeof data.id !== 'number' || isNaN(data.id)) {
      return NextResponse.json({ error: 'Id was not provided or not a number' }, { status: 400 });
    }

    if (!data.message || !data.message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Un authorized' }, { status: 401 });
    }

    const existingPost = await prismaClient.post.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Provided id does not have corresponding post' }, { status: 400 });
    }

    await deleteKeysWithPrefix(`post:${data.id}:comments`);
    await deleteKeysWithPrefix(`user:${user.id}:commented_posts`);

    const newComment = await prismaClient.comment.create({
      data: {
        userId: user.id,
        postId: existingPost.id,
        commentContent: data.message,
      },
    });

    const comment: Comment = {
      id: newComment.id,
      likes: [],
      commentContent: newComment.commentContent,
      commentOwner: {
        id: user.id,
        pfpUrl: user.pfpUrl,
        username: user.username!,
      },
      createdAt: newComment.createdAt,
    };

    return NextResponse.json({ message: 'Comment created successfully', comment: comment }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
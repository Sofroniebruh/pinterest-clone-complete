import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/prisma-client';
import { deleteKeysWithPrefix, getUserByToken, isValidId } from '@/lib/helpers/helper-functions';

export async function PUT(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const user = await getUserByToken(req);
    const commentData = (await req.json()) as { message: string };

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!commentData.message || !commentData.message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const commentToUpdate = await prismaClient.comment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!commentToUpdate) {
      return NextResponse.json({ error: 'Comment was not found' }, { status: 404 });
    }

    if (commentToUpdate.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteKeysWithPrefix(`post:${commentToUpdate.postId}:comments`);

    const updatedComment = await prismaClient.comment.update({
      where: {
        id: commentToUpdate.id,
      },
      data: {
        commentContent: commentData.message,
      },
    });

    return NextResponse.json({ message: 'Comment was updated successfully', comment: updatedComment }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const user = await getUserByToken(req);

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const commentToDelete = await prismaClient.comment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!commentToDelete) {
      return NextResponse.json({ error: 'Comment was not found' }, { status: 404 });
    }

    if (commentToDelete.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteKeysWithPrefix(`post:${commentToDelete.postId}:comments`);

    await prismaClient.comment.delete({
      where: {
        id: commentToDelete.id,
      },
    });

    return NextResponse.json({ message: 'Comment was deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const user = await getUserByToken(req);

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comment = await prismaClient.comment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment was not found' }, { status: 404 });
    }

    await deleteKeysWithPrefix(`post:${comment.postId}:comments`);

    const commentHasLiked = await prismaClient.commentLike.findUnique({
      where: {
        userId_commentId: {
          commentId: comment.id,
          userId: user.id,
        },
      },
    });

    if (!commentHasLiked) {
      await prismaClient.commentLike.create({
        data: {
          userId: user.id,
          commentId: comment.id,
        },
      });

      return NextResponse.json({ message: 'Comment was liked' }, { status: 200 });
    }

    await prismaClient.commentLike.delete({
      where: {
        userId_commentId: {
          commentId: comment.id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({ message: 'Comment was unliked' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
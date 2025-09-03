import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/prisma-client';
import { getUserByToken, isValidId } from '@/lib/helpers/helper-functions';
import { redis } from '@/lib/redis';
import { PostComment } from '@/lib/helpers/helper-types-or-interfaces';

export async function GET(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const page = Number(req.nextUrl.searchParams.get('page'));
    const limit = Number(req.nextUrl.searchParams.get('limit'));
    const user = await getUserByToken(req);

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    const COUNT_CACHE_KEY = `post:${id}:comments:count`;
    const CACHE_KEY = `post:${id}:comments:page${page}:limit:${limit}`;
    const countCached = await redis.get(COUNT_CACHE_KEY);
    const cached = await redis.get(CACHE_KEY);

    let comments: PostComment[] = [];
    let count: number;

    if (countCached && cached) {
      comments = JSON.parse(cached);
      count = Number(countCached);
    } else {
      const [paginatedComments, commentCount] = await prismaClient.$transaction([
        prismaClient.comment.findMany({
          where: {
            postId: Number(id),
          },
          select: {
            id: true,
            likes: true,
            commentContent: true,
            createdAt: true,
            commentOwner: {
              select: {
                id: true,
                pfpUrl: true,
                username: true,
              },
            },
          },
          skip: limit * (page - 1),
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prismaClient.comment.count({
          where: {
            postId: Number(id),
          },
        }),
      ]);

      comments = paginatedComments;
      count = Number(commentCount);

      await redis.set(COUNT_CACHE_KEY, count.toString(), 'EX', 600);
      await redis.set(CACHE_KEY, JSON.stringify(comments), 'EX', 600);
    }

    const totalPages = Math.ceil(count / limit);

    const response = NextResponse.json({
      message: 'Comments were processed successfully',
      comments: comments,
      totalPages: totalPages,
      isOwner: false,
    }, { status: 200 });


    if (!user) {
      return response;
    }

    const commentsLikedByCurrentUser = await prismaClient.commentLike.findMany({
      where: {
        userId: user.id,
      },
    });

    const postCommentsWithIsOwner = comments.map((comment: PostComment) => ({
      ...comment,
      isOwner: comment.commentOwner.id === user.id,
      isLiked: commentsLikedByCurrentUser.some((likedComment: {
        userId: number
        commentId: number
      }) => likedComment.commentId === comment.id),
    }));

    return NextResponse.json({
      message: 'Comments were processed successfully',
      comments: postCommentsWithIsOwner,
      totalPages: totalPages,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
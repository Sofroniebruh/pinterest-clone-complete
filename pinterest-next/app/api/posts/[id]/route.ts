import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/prisma-client';
import { PostWithTagsAndLiked, TagsWithIsCreated } from '@/lib/helpers/helper-types-or-interfaces';
import {
  deleteKeysWithPrefix,
  getUserByToken,
  isValidId,
  validateReceivedHashtags,
} from '@/lib/helpers/helper-functions';
import { updatePost } from '@/components/auth/schema';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    let isOwner = false;
    const { id } = await params;
    const user = await getUserByToken(req);

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    const CACHED_KEY = `post:${id}`;
    const cached = await redis.get(CACHED_KEY);
    let post: PostWithTagsAndLiked | null;

    if (cached) {
      post = JSON.parse(cached);
    } else {
      post = await prismaClient.post.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              username: true,
              pfpUrl: true,
            },
          },
          comments: {
            select: {
              likes: true,
              id: true,
              commentOwner: {
                select: {
                  id: true,
                  username: true,
                  pfpUrl: true,
                },
              },
              commentContent: true,
              createdAt: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          tagAndPosts: {
            include: {
              tag: true,
            },
          },
        },
      });

      await redis.set(CACHED_KEY, JSON.stringify(post), 'EX', 600);
    }

    if (!post) {
      return NextResponse.json({ error: 'Post was not found' }, { status: 404 });
    }

    const owner = {
      id: post.createdBy.id,
      email: post.createdBy.email,
    };

    if (!user) {
      return NextResponse.json({
        message: 'Post was retrieved successfully',
        post: post,
        owner,
        isOwner: isOwner,
      }, { status: 200 });
    }

    isOwner = owner.email === user.email;

    const postWithUserLikedOrNo = {
      ...post,
      isLikedByUser: post.likes.some((like: { userId: number }) => like.userId === user.id),
    };

    return NextResponse.json({
      message: 'Post was retrieved successfully',
      post: postWithUserLikedOrNo, owner: owner, isOwner: isOwner,
    }, { status: 200 });
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

    const post = await prismaClient.post.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post was not found' }, { status: 404 });
    }

    await deleteKeysWithPrefix(`post:${id}`);
    await deleteKeysWithPrefix(`user:${user.id}:liked_posts`);

    const existingLike = await prismaClient.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });

    if (existingLike) {
      await prismaClient.like.delete({
        where: {
          userId_postId: {
            userId: existingLike.userId,
            postId: existingLike.postId,
          },
        },
      });

      return NextResponse.json({ message: 'Post was unliked' }, { status: 200 });
    }

    await prismaClient.like.create({
      data: {
        userId: user.id,
        postId: post.id,
      },
    });

    return NextResponse.json({ message: 'Post was liked' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const user = await getUserByToken(req);
    const body = await req.json();
    const { selectedTags, ...rest } = body;
    const typedTags: TagsWithIsCreated[] = selectedTags;

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    const postToUpdate = await prismaClient.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!postToUpdate) {
      return NextResponse.json({ error: 'Post was not found' }, { status: 404 });
    }

    if (typedTags) {
      await validateReceivedHashtags(postToUpdate, typedTags);
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.id !== postToUpdate.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteKeysWithPrefix(`post:${id}`);
    await deleteKeysWithPrefix(`user:${user.id}:created_posts`);

    const data = updatePost.parse(rest);

    const updatedPost = await prismaClient.post.update({
      where: {
        id: postToUpdate.id,
      },
      data,
    });

    return NextResponse.json({ message: 'Post was updated successfully', updatedPost }, { status: 200 });
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

    const postToDelete = await prismaClient.post.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        userId: true,
        id: true,
      },
    });

    if (!postToDelete) {
      return NextResponse.json({ error: 'Post was not found' }, { status: 404 });
    }

    if (postToDelete.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteKeysWithPrefix(`post:${id}`);
    await deleteKeysWithPrefix(`user:${user.id}:created_posts`);
    await deleteKeysWithPrefix(`user:${user.id}:commented_posts`);

    await prismaClient.post.delete({
      where: {
        id: postToDelete.id,
      },
    });

    return NextResponse.json({ message: 'Post was deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/prisma-client';
import { PostData } from '@/lib/api-client/change-user-info';
import { deleteKeysWithPrefix, getUserByToken, validateReceivedHashtags } from '@/lib/helpers/helper-functions';

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as PostData;
    const user = await getUserByToken(req);

    if (!data.imageUrl || !data.name) return NextResponse.json({ error: 'Post image and post name must be provided' }, { status: 400 });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteKeysWithPrefix(`user:${user.id}:created_posts`);

    const post = await prismaClient.post.create({
      data: {
        userId: user.id,
        postName: data.name,
        description: data.description,
        postImageUrl: data.imageUrl,
      },
    });

    if (data.selectedTags) {
      await validateReceivedHashtags(post, data.selectedTags);
    }

    const embedded = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_ROUTE}/add/${post.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: post.postImageUrl,
      }),
    });
    console.log('Id', post.id);
    console.log(embedded);
    if (!embedded) {
      return NextResponse.json({ error: 'Failed to save embedded vector', post }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post was created successfully', post }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const postIdToSkip = req.nextUrl.searchParams.get('excluding');
    const tag = req.nextUrl.searchParams.get('tag');
    const search = req.nextUrl.searchParams.get('search');
    const lastId = req.nextUrl.searchParams.get('lastId');
    const user = await getUserByToken(req);
    let allPosts;

    const baseInclude = {
      likes: {
        select: {
          userId: true,
        },
      },
    };

    if (tag) {
      allPosts = await prismaClient.post.findMany({
        take: 50,
        skip: lastId ? 1 : 0,
        cursor: Number(lastId) ? { id: Number(lastId) } : undefined,
        where: {
          tagAndPosts: {
            some: {
              tag: {
                tagName: tag,
              },
            },
          },
          ...(postIdToSkip && {
            NOT: {
              id: Number(postIdToSkip),
            },
          }),
        },
        include: baseInclude,
        orderBy: {
          id: 'desc',
        },
      });
    } else if (search) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_ROUTE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: search,
          lastId: lastId ? Number(lastId) : null,
        }),
      });
      const ids: number[] = [];
      const validatedResult = (await res.json() as { id: number, postImageUrl: string }[]);
      for (const result of validatedResult) {
        ids.push(result.id);
      }
      allPosts = await prismaClient.post.findMany({
        take: 50,
        skip: lastId ? 1 : 0,
        cursor: Number(lastId) ? { id: Number(lastId) } : undefined,
        where: {
          id: {
            in: ids,
          },
          ...(postIdToSkip && {
            NOT: {
              id: Number(postIdToSkip),
            },
          }),
        },
        include: baseInclude,
        orderBy: {
          id: 'desc',
        },
      });
    } else {
      allPosts = await prismaClient.post.findMany({
        take: 50,
        skip: lastId ? 1 : 0,
        cursor: Number(lastId) ? { id: Number(lastId) } : undefined,
        where: postIdToSkip
          ? {
            NOT: {
              id: Number(postIdToSkip),
            },
          }
          : undefined,
        include: baseInclude,
        orderBy: {
          id: 'desc',
        },
      });
    }

    if (!user) {
      return NextResponse.json({
        message: 'Posts were retrieved successfully',
        posts: allPosts,
      }, { status: 200 });
    }

    const postsWithLikedBySelectedUser = allPosts.map((post: {
      likes: {
        userId: number
      }[]
    } & {
      id: number
      userId: number
      postName: string
      description: string | null
      postImageUrl: string
      createdAt: Date
      updatedAt: Date | null
    }) => ({
      ...post,
      isLikedByCurrentUser: post.likes.some((like: { userId: number }) => like.userId === user.id),
      isOwner: post.userId === user.id,
    }));

    return NextResponse.json({
      message: 'Posts were retrieved successfully',
      posts: postsWithLikedBySelectedUser,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
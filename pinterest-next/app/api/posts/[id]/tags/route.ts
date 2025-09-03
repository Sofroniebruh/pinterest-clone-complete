import { NextRequest, NextResponse } from 'next/server';
import { isValidId } from '@/lib/helpers/helper-functions';
import { prismaClient } from '@/prisma/prisma-client';

export async function GET(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    const requestedPost = await prismaClient.post.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!requestedPost) {
      return NextResponse.json({ error: 'Post was not found' }, { status: 404 });
    }

    const tagsPerPost = await prismaClient.tags.findMany({
      where: {
        tagAndPosts: {
          some: {
            postId: requestedPost.id,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Tags per requested post processed successfully', tags: tagsPerPost });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
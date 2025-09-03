import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/prisma-client';
import { TagsWithIsCreated } from '@/lib/helpers/helper-types-or-interfaces';

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get('name');
    const excludingParam = req.nextUrl.searchParams.get('excluding');
    const excludingList = excludingParam ? excludingParam.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];

    if (!name) {
      const tags = await prismaClient.tags.findMany();
      return NextResponse.json({
        message: 'Tags were retrieved successfully',
        tags,
      }, { status: 200 });
    }

    const allTagsMatchingName = await prismaClient.tags.findMany({
      where: {
        tagName: {
          contains: name,
          mode: 'insensitive' as const,
        },
        ...(excludingParam && {
          NOT: {
            tagName: {
              in: excludingList,
              mode: 'insensitive' as const,
            },
          },
        }),
      },
    });

    const tagsWithIsCreated: TagsWithIsCreated[] = allTagsMatchingName.map((tag: { id: number, tagName: string }) => ({
      tagName: tag.tagName,
      isCreated: true,
    }));

    return NextResponse.json({
      message: 'Tags were retrieved successfully',
      tags: tagsWithIsCreated,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
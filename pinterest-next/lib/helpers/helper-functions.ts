import { NextRequest } from 'next/server';
import { tokenCheck } from '@/lib/auth';
import { prismaClient } from '@/prisma/prisma-client';
import { Post } from '@prisma/client';
import { TagsWithIsCreated } from '@/lib/helpers/helper-types-or-interfaces';
import { redis } from '@/lib/redis';

export async function getUserByToken(req: NextRequest) {
  const email = await tokenCheck(req);

  if (!email) {
    return null;
  }

  const user = await prismaClient.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  return user;
}

export const isValidId = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

export const validateReceivedHashtags = async (post: Post, selectedTags: TagsWithIsCreated[]) => {
  const postId = post.id;

  const existingTagConnections = await prismaClient.tagAndPosts.findMany({
    where: { postId },
    include: { tag: true },
  });

  const selectedTagNames = selectedTags.map(tag => tag.tagName);

  const tagsToRemove = existingTagConnections.filter(
    (connection) => !selectedTagNames.includes(connection.tag.tagName),
  );

  for (const connection of tagsToRemove) {
    await prismaClient.tagAndPosts.delete({
      where: {
        tagId_postId: {
          tagId: connection.tagId,
          postId: postId,
        },
      },
    });
  }

  const tagsNotCreatedPreviously = selectedTags.filter(tag => !tag.isCreated);
  const tagsCreatedPreviously = selectedTags.filter(tag => tag.isCreated);

  for (const tag of tagsNotCreatedPreviously) {
    await prismaClient.tags.create({
      data: {
        tagName: tag.tagName,
        tagAndPosts: {
          create: {
            postId,
          },
        },
      },
    });
  }

  for (const tag of tagsCreatedPreviously) {
    const createdTag = await prismaClient.tags.findUnique({
      where: {
        tagName: tag.tagName,
      },
    });

    if (!createdTag) continue;

    const alreadyLinked = await prismaClient.tagAndPosts.findUnique({
      where: {
        tagId_postId: {
          tagId: createdTag.id,
          postId,
        },
      },
    });

    if (!alreadyLinked) {
      await prismaClient.tagAndPosts.create({
        data: {
          postId,
          tagId: createdTag.id,
        },
      });
    }
  }
};

export async function deleteKeysWithPrefix(prefix: string) {
  const stream = redis.scanStream({ match: `${prefix}*` });

  const keysToDelete: string[] = [];

  for await (const keys of stream) {
    if (keys.length) keysToDelete.push(...keys);
  }

  if (keysToDelete.length) {
    await redis.del(...keysToDelete);
  }
}


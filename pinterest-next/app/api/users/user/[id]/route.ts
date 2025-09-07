import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/prisma/prisma-client';
import { updateProfileUsernameOrProfilePictureSchemaForAPI } from '@/components/auth/schema';
import { deleteKeysWithPrefix, getUserByToken, isValidId } from '@/lib/helpers/helper-functions';

export async function GET(req: NextRequest, { params }: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const userByToken = await getUserByToken(req);

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    const userById = await prismaClient.user.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        email: true,
        username: true,
        pfpUrl: true,
      },
    });

    if (!userById) {
      return NextResponse.json({ error: 'User was not found' }, { status: 404 });
    }

    if (!userByToken) {
      return NextResponse.json({
        message: 'User was retrieved successfully',
        user: userById,
        isOwner: false,
      }, { status: 200 });
    }

    const isOwner = userByToken.id === userById.id;

    return NextResponse.json({
      message: 'User was retrieved successfully',
      user: userById,
      isOwner: isOwner,
    }, { status: 200 });
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

    if (!user || user.id !== Number(id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userToDelete = await prismaClient.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User was not found' }, { status: 404 });
    }

    await deleteKeysWithPrefix('post');

    await prismaClient.user.delete({
      where: {
        email: userToDelete.email,
      },
    });

    const res = NextResponse.json({ message: 'User was deleted successfully' }, { status: 200 });

    res.cookies.set('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(0),
    });

    return res;
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

    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Id is invalid' }, { status: 400 });
    }

    if (!user || user.id !== Number(id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = updateProfileUsernameOrProfilePictureSchemaForAPI.parse(body);
    await deleteKeysWithPrefix('post');

    const userToUpdate = await prismaClient.user.update({
      where: {
        email: user.email,
      },
      data,
    });

    const { password: _, ...safeUser } = userToUpdate;

    return NextResponse.json({ message: 'User was updated successfully', user: safeUser }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
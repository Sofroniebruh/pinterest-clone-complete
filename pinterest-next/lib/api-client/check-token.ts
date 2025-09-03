import { User } from '@prisma/client';

export const checkToken = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}/auth/check-token`, {
    method: 'GET',
  });

  return (await response.json()) as { loggedIn: boolean, user: User };
};
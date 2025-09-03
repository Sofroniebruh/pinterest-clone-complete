'use client';

import useSWR, { mutate as globalMutate } from 'swr';
import { API } from '@/lib/api-client/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useUserUsername = (id: string) => {
  const route = `${process.env.NEXT_PUBLIC_API_ROUTE}/users/user/${id}`;
  const { data, mutate, isLoading } = useSWR(`${route}`, fetcher);

  const changeUsername = async (username: string, id: string) => {
    try {
      await globalMutate(route, {
        ...data,
        user: { ...data.user, username },
      }, false);

      await API.changeUserInfo.changeUsername(username, id);
    } catch (error) {
      console.error(error);
      await globalMutate(route, data, false);
    }
  };

  return {
    profileUser: data?.user || null,
    mutate,
    changeUsername,
    isLoading,
  };
};
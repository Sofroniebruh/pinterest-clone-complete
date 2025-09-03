import useSWR, { mutate as globalMutate } from 'swr';
import { useEffect } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const usePaginatedComments = (id: number, page: number, limit = 7) => {
  const key = `${process.env.NEXT_PUBLIC_API_ROUTE}/posts/${id}/comments?page=${page}&limit=${limit}`;

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    const nextPage = `${process.env.NEXT_PUBLIC_API_ROUTE}/posts/${id}/comments?page=${page + 1}&limit=${limit}`;
    globalMutate(nextPage, fetcher(nextPage), false);
  }, [limit, page]);

  return {
    data: data?.comments ?? [],
    totalPages: data?.totalPages ?? 0,
    isOwner: data?.isOwner ?? null,
    error,
    isLoading,
    mutate,
  };
};

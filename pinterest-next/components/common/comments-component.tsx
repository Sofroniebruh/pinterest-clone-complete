'use client';

import { CommentComponent } from '@/components/common/comment-component';
import { cn } from '@/lib/utils';
import { PostOwner } from '@/lib/helpers/helper-types-or-interfaces';
import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CommentInput } from '@/components/common/comment-input';
import Link from 'next/link';
import { useAuth } from '@/components/contexts/auth-context';
import { usePaginatedComments } from '@/lib/hooks/swr';
import { CommentLike } from '@prisma/client';

export type Comment = {
  id: number;
  commentContent: string;
  commentOwner: {
    id: number;
    pfpUrl: string | null;
    username: string;
  };
  createdAt: Date;
  likes: CommentLike[];
  isOwner?: boolean;
  isLiked?: boolean;
};

interface Props {
  className?: string;
  owner: PostOwner;
  id: number;
}

export const CommentsComponent = memo(({ className, owner, id }: Props) => {
  const [page, setPage] = useState(1);
  const { isLoading, totalPages, isOwner, data, error } = usePaginatedComments(id, page);
  const { isAuthenticated } = useAuth();

  return (
    <div className={cn('flex-col gap-4', className)}>
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

      <div className="flex flex-col h-[400px] w-full">
        <div
          className={cn(
            'overflow-y-auto h-full flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100',
            data.length === 0 && 'w-full',
          )}
        >
          {isLoading ? (
            <div className="w-full h-full flex justify-center items-center">
              <p>Loading...</p>
            </div>
          ) : data && data.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center">
              <p>No comments here yet...</p>
            </div>
          ) : (
            data.map((comment: Comment) => (
              <CommentComponent
                page={page}
                id={id}
                isOwner={!isOwner ? comment.isOwner : isOwner}
                isCreator={comment.commentOwner.id === owner.id}
                key={comment.id}
                comment={comment}
              />
            ))
          )}
        </div>

        {data.length > 0 && (
          <div className="flex items-center justify-center mt-4">
            <Button
              disabled={page <= 1}
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setPage(page > 1 ? page - 1 : 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <div className="mx-2 text-sm">
              {page} of {totalPages}
            </div>
            <Button
              disabled={page >= totalPages}
              variant="ghost"
              className="cursor-pointer"
              onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>

      {isAuthenticated ? (
        <CommentInput page={page} postId={id} className={className} />
      ) : (
        <Link href="/sign-in" className={cn('justify-center w-full', className)}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white w-[200px] cursor-pointer">
            Log In to leave comments
          </Button>
        </Link>
      )}
    </div>
  );
});

CommentsComponent.displayName = 'CommentsComponent';

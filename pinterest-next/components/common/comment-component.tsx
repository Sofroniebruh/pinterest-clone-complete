'use client';

import { AvatarComponent } from '@/components/common/avatar-component';
import { Comment } from '@/components/common/comments-component';
import { EditIcon, HeartIcon, TrashIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { memo, useState } from 'react';
import { DialogComponent } from '@/components/common/dialog-component';
import { CommentInput } from '@/components/common/comment-input';
import { Button } from '@/components/ui-components/ui/button';
import { API } from '@/lib/api-client/api';
import { toast } from 'sonner';
import { usePaginatedComments } from '@/lib/hooks/swr';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/components/contexts/auth-context';
import { DeleteDialogComponent } from '@/components/common/delete-dialog-component';
import { useStore } from 'zustand/react';
import { dialogStore } from '@/lib/store';

interface Props {
  comment: Comment;
  isCreator: boolean;
  isOwner: boolean;
  page: number;
  id: number;
}

export const CommentComponent = memo(({ comment, isCreator, isOwner, page, id }: Props) => {
  const { mutate } = usePaginatedComments(id, page);
  const [likesAmount, setLikesAmount] = useState(comment.likes.length);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const { isAuthenticated } = useAuth();
  const dialogs = useStore(dialogStore, (state) => state.dialogs);
  const isDeleteCommentDialogOpen = dialogs.some((d) => d.key.name === 'deleteComment');
  const isEditCommentDialogOpen = dialogs.some((d) => d.key.name === 'editComment');
  const setIsOpen = useStore(dialogStore, (state) => state.setIsOpen);

  const handleDelete = async (id: number) => {
    if (await API.comments.deleteComment(id)) {
      toast.success('Comment was deleted successfully');
      setIsOpen(false, { key: { name: 'deleteComment' }, value: false });
      await mutate();

      return;
    }

    toast.error('Error deleting your comment');
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast('Log In to like');
      return;
    }

    const prevLikes = likesAmount;
    const prevLiked = isLiked;

    try {
      if (isLiked) {
        setLikesAmount(Math.max(likesAmount - 1, 0));
        setIsLiked(false);
      } else {
        setLikesAmount(likesAmount + 1);
        setIsLiked(true);
      }

      await API.comments.toggleLikeOnComment(comment.id);
      await mutate();
    } catch (e) {
      console.error(e);
      setLikesAmount(prevLikes);
      setIsLiked(prevLiked);
    }
  };

  return (
    <div className="flex items-start gap-3 w-full">
      <Link href={`/profile/${comment.commentOwner.id}`}>
        <AvatarComponent
          className="w-9 h-9 shrink-0"
          email={comment.commentOwner.username}
          profilePicture={comment.commentOwner.pfpUrl}
        />
      </Link>
      <div className="flex flex-col gap-1 w-full">
        <div className={'flex gap-3'}>
          <p className="text-base font-semibold break-words">{comment.commentOwner.username}</p>
          {isCreator && (
            <div className={'bg-gray-200 rounded-sm px-1 flex items-center'}><p
              className={'text-sm text-center'}>Creator</p></div>
          )}
        </div>
        <p className="break-words">{comment.commentContent}</p>
        <div className={'flex gap-5 items-center'}>
          <p
            className={'text-sm text-gray-400'}>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
          <p className={'flex text-sm items-center justify-center gap-1'} onClick={handleLike}>
            <HeartIcon
              className={cn('w-4 h-4 cursor-pointer hover:text-red-600', isLiked && 'text-red-600 fill-red-600')}></HeartIcon>
            {likesAmount}
          </p>
        </div>
      </div>
      {isOwner &&
        <div className={'flex flex-col items-end justify-evenly h-full'}>
          <DialogComponent openState={isDeleteCommentDialogOpen} description={'This action can not be undone'}
                           triggerButton={
                             <TrashIcon onClick={() => setIsOpen(true, { key: { name: 'deleteComment' }, value: true })}
                                        className={'cursor-pointer'} size={16} />
                           } title={'Are you sure?'}>
            <DeleteDialogComponent deleteButton={
              <Button onClick={() => handleDelete(comment.id)} size={'lg'} variant={'destructive'}>Delete My
                Comment</Button>
            } setDialogOpen={() => setIsOpen(false, {
              key: { name: 'deleteComment' },
              value: false,
            })}></DeleteDialogComponent>
          </DialogComponent>
          <DialogComponent openState={isEditCommentDialogOpen} triggerButton={
            <EditIcon onClick={() => setIsOpen(true, { key: { name: 'editComment' }, value: true })}
                      className={'cursor-pointer'} size={16} />
          } title={'Edit your comment'}>
            <CommentInput comment={comment} isUpdatingComment={true} postId={id} page={page} />
          </DialogComponent>
        </div>
      }
    </div>
  );
});

CommentComponent.displayName = 'CommentComponent';


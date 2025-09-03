'use client';

import { Input } from '@/components/ui-components/ui/input';
import { cn } from '@/lib/utils';
import { SendHorizonalIcon } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inputSchema, InputSchemaType } from '@/components/auth/schema';
import { CommentStructure } from '@/lib/helpers/helper-types-or-interfaces';
import { API } from '@/lib/api-client/api';
import { Comment } from '@/components/common/comments-component';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { usePaginatedComments } from '@/lib/hooks/swr';
import { useStore } from 'zustand/react';
import { dialogStore } from '@/lib/store';

interface Props {
  className?: string;
  postId: number;
  page: number;
  isUpdatingComment?: boolean;
  comment?: Comment;
}

export const CommentInput = ({ className, postId, page, isUpdatingComment, comment }: Props) => {
  const { mutate } = usePaginatedComments(postId, page);
  const setIsOpen = useStore(dialogStore, (state) => state.setIsOpen);

  const form = useForm<InputSchemaType>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (isUpdatingComment) {
      form.setValue('message', comment!.commentContent);
    }
  }, [isUpdatingComment]);

  const onUpdate = async (data: InputSchemaType) => {
    const commentData = {
      message: data.message,
      commentId: comment!.id,
    };

    if (await API.comments.updateComment(commentData)) {
      toast.success('Comment updated successfully');
      setIsOpen(false, { key: { name: 'editComment' }, value: false });
      await mutate();
      form.reset();

      return;
    }

    toast.error('Error updating your comment');
  };

  const onSubmit = async (data: InputSchemaType) => {
    const commentData: CommentStructure = {
      message: data.message,
      id: postId,
    };

    const { comment } = await API.comments.createComment(commentData);

    if (comment) {
      await mutate();
      form.reset();
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(isUpdatingComment ? onUpdate : onSubmit)} className={'relative w-full'}>
        <Input {...form.register('message')}
               className={cn('px-3 py-5 w-full', className)}
               placeholder="Add your comment..." />
        <button type={'submit'}
                className={cn('absolute top-[6px] right-2 bg-blue-600 rounded-full p-2 text-white cursor-pointer text-sm')}>
          <SendHorizonalIcon className={'w-4 h-4'}></SendHorizonalIcon></button>
        {form.formState.errors.message && (
          <p className={cn('text-sm text-red-600', className)}>{form.formState.errors.message.message}</p>)}
      </form>
    </FormProvider>
  );
};
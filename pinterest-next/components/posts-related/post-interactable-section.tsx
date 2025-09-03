'use client';

import Link from 'next/link';
import { AvatarComponent, CommentsComponent, DialogComponent, PopoverComponent } from '@/components/common';
import { EditIcon, HeartIcon, InfoIcon, MessageCircleIcon, ShareIcon, TrashIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui-components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/contexts/auth-context';
import { usePost } from '@/components/contexts/post-context';
import { useLikes } from '@/lib/hooks/swr';
import { API } from '@/lib/api-client/api';
import { useRouter } from 'next/navigation';
import { DeleteDialogComponent } from '@/components/common/delete-dialog-component';
import { useStore } from 'zustand/react';
import { dialogStore } from '@/lib/store';
import { handleDownload } from '@/lib/helpers/edit-post-helper';
import { Dialog } from '@/lib/store/dialog-store';

export const PostInteractableSection = () => {
  const { isAuthenticated } = useAuth();
  const { post, isOwner, owner, totalLikes: initialLikes } = usePost();
  const { hasLiked, toggleLikes, totalLikes, isLoading } = useLikes(post.id);
  const router = useRouter();
  const dialogs = useStore(dialogStore, (state) => state.dialogs);
  const isDeleteDialogOpen = dialogs.some((d: Dialog) => d.key.name === 'deletePost');
  const setIsOpen = useStore(dialogStore, (state) => state.setIsOpen);

  const handleDelete = async (id: number) => {
    if (await API.posts.deletePost(id)) {
      toast.success('Post deleted successfully.');
      setIsOpen(false, { key: { name: 'deletePost' }, value: false });
      router.push('/posts');
      return;
    }
    toast.error('Failed to delete the post');
  };

  return (
    <div className="flex flex-col w-full lg md:w-[400px] md:mt-0 gap-4 min-h-0 justify-between">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className={'flex items-center gap-3'}>
            <Link href={`/profile/${post.createdBy.id}`}>
              <AvatarComponent className={'w-9 h-9'} email={post.createdBy.email}
                               profilePicture={post.createdBy.pfpUrl} />
            </Link>
            <h1 className="font-semibold text-lg">{post.createdBy.username}</h1>
          </div>
          <PopoverComponent className={'mr-5 z-30'} trigger={
            <InfoIcon className={'cursor-pointer text-gray-500'}></InfoIcon>
          } content={
            <div className={''}>
              <h1 className={'text-xl font-semibold mb-3'}>Post details</h1>
              <Separator></Separator>
              <div className={'mt-3 flex flex-col gap-1 break-words'}>
                <div>
                  <h1 className={'text-md font-semibold'}>Name</h1>
                  <p>{post.postName}</p>
                </div>
                <div>
                  <h1 className={'text-md font-semibold'}>Description</h1>
                  {post.description!.length == 0 ?
                    (<p className={'text-gray-400'}>Author did not provide a
                      description</p>) :
                    (
                      <p>{post.description}</p>
                    )}
                </div>
                <div>
                  <h1 className={'text-md font-semibold'}>Created at</h1>
                  <p>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <h1 className={'text-md font-semibold'}>Tags</h1>
                  <div className={'break-words w-full flex gap-x-2 flex-wrap'}>
                    {post.tagAndPosts.length == 0 && (
                      <p className={'text-gray-400'}>No tags were added</p>
                    )}
                    {post.tagAndPosts.length > 0 && post.tagAndPosts.map((tagAndPost) => (
                      <p key={tagAndPost.tag.id}>#{tagAndPost.tag.tagName}</p>
                    ))}
                  </div>
                </div>
                {isOwner &&
                  <div>
                    <h1 className={'text-md font-semibold'}>Total likes:</h1>
                    <span className={'flex items-center gap-1'}>
                      <HeartIcon size={20} className={'fill-red-600 text-red-600'}></HeartIcon>{totalLikes}</span>
                  </div>
                }
              </div>
            </div>
          }></PopoverComponent>
        </div>
        <div className="flex items-center justify-between">
          {
            isOwner ? (
              <div className={'flex gap-2'}>
                <DialogComponent description={'This action can not be undone'}
                                 openState={isDeleteDialogOpen} triggerButton={
                  <div onClick={() => setIsOpen(true, { key: { name: 'deletePost' }, value: true })}
                       className={'flex p-2 px-3 bg-red-600 text-white gap-1 rounded-md text-sm items-center cursor-pointer hover:bg-red-700'}>Delete
                    Post <TrashIcon size={16}></TrashIcon></div>
                } title={'Are you sure?'}>
                  <DeleteDialogComponent deleteButton={
                    <Button onClick={() => handleDelete(post.id)} size={'lg'} variant={'destructive'}>Delete my
                      post</Button>
                  } setDialogOpen={() => setIsOpen(false, {
                    key: { name: 'deletePost' },
                    value: false,
                  })}></DeleteDialogComponent>
                </DialogComponent>
                <Link href={`/posts/${post.id}/edit-post`}>
                  <Button
                    className={'bg-blue-600 hover:bg-blue-700'}>Edit <EditIcon></EditIcon></Button>
                </Link>
              </div>
            ) : (
              <div className={'flex items-center gap-3'}>
                <div className={'w-[65px] flex items-center justify-center'}>
                  <p className="font-semibold">{isLoading ? initialLikes : totalLikes}</p>
                </div>
                <Button
                  onClick={() => isAuthenticated ? toggleLikes() : toast('Log In to like')}
                  variant="outline"
                  className={cn(isLoading ? post.isLikedByUser && 'text-red-600 fill-red-600' : hasLiked && 'text-red-600 fill-red-600')}>Like <HeartIcon /></Button>
                <div className="flex items-center gap-3" onClick={() => handleDownload(post.postImageUrl)}>
                  <Button variant="outline">Save <ShareIcon /></Button>
                </div>
              </div>
            )
          }
          <DialogComponent className={'flex flex-col justify-center items-center'} triggerButton={
            <div
              className={'sm:hidden rounded-full p-2.5 cursor-pointer bg-blue-600 text-white hover:bg-blue-500'}>
              <MessageCircleIcon className={'w-5 h-5'}></MessageCircleIcon>
            </div>
          } title={''}>
            <CommentsComponent id={post.id} owner={owner}
                               className={'flex w-full'}></CommentsComponent>
          </DialogComponent>
        </div>
        <Separator />
      </div>
      <div className={'hidden sm:flex lg:hidden w-full h-full items-center justify-center'}>
        <DialogComponent className={'flex flex-col justify-center items-center'} triggerButton={
          <div
            className={'bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2 text-sm px-3 cursor-pointer'}>Open
            comment section</div>
        } title={''}>
          <CommentsComponent id={post.id} owner={owner}
                             className={'flex w-full'}></CommentsComponent>
        </DialogComponent>
      </div>
      <CommentsComponent id={post.id} owner={owner}
                         className={'lg:flex hidden'}></CommentsComponent>
    </div>
  );
};

PostInteractableSection.displayName = 'PostInteractableSection';
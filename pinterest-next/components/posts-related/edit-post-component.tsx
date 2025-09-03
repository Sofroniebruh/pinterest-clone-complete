'use client';

import { useAuth } from '@/components/contexts/auth-context';
import { useHandleImageDropZone } from '@/lib/hooks';
import { FormProvider, useForm } from 'react-hook-form';
import { newPostSchema, PostSchemaType } from '@/components/auth/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API } from '@/lib/api-client/api';
import { toast } from 'sonner';
import { PostData } from '@/lib/api-client/change-user-info';
import { Button } from '@/components/ui-components/ui/button';
import { DragAndDropImageComponent } from '@/components/common';
import { Input } from '@/components/ui-components/ui/input';
import { Loader2 } from 'lucide-react';
import { PostWithTags, TagsWithIsCreated } from '@/lib/helpers/helper-types-or-interfaces';
import { TagsComponent } from '@/components/posts-related/tags-component';

interface Props {
  post: PostWithTags;
}

export const EditPostComponent = ({ post }: Props) => {
  const { user } = useAuth();
  const router = useRouter();

  const [postImage, setPostImage] = useState(post.postImageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chosenTags, setChosenTags] = useState<TagsWithIsCreated[] | []>([]);
  const [isNotEnteredTags, setIsNotEnteredTags] = useState<boolean>(false);

  const {
    getInputProps,
    isDragActive,
    getRootProps,
    uploadedFile,
    setUploadedFile,
  } = useHandleImageDropZone({ isPfp: false, id: user!.id });

  const form = useForm<PostSchemaType>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      name: post.postName,
      description: post.description || '',
    },
  });

  useEffect(() => {
    form.setValue('name', post.postName);
    post.description && form.setValue('description', post.description);
  }, []);

  useEffect(() => {
    if (uploadedFile) {
      const objectUrl = URL.createObjectURL(uploadedFile);
      setPostImage(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPostImage(postImage);
    }
  }, [uploadedFile]);

  const onSubmit = async (data: PostSchemaType) => {
    setIsSubmitting(true);
    let imageUrl = postImage;

    if (chosenTags.length == 0) {
      setIsNotEnteredTags(true);
      setIsSubmitting(false);

      return;
    }

    if (uploadedFile) {
      const image = await API.uploadImage.uploadPublicImage(uploadedFile);
      if (image instanceof Error) {
        toast.error('Failed to upload image');
        setIsSubmitting(false);
        return;
      }
      imageUrl = image;
      setPostImage(image);
    }

    const updatedPostData: PostData = {
      ...data,
      imageUrl,
      selectedTags: chosenTags,
    };

    const result = await API.posts.updatePost(updatedPostData, post.id);
    setIsSubmitting(false);

    if (result) {
      toast.success('Post was updated successfully');
      router.push(`/profile/${user!.id}`);
    } else {
      setIsSubmitting(false);
      toast.error('Error updating post');
    }
  };

  const handleResetImage = () => {
    setUploadedFile(null);
    setPostImage('');
  };

  const hasImage = !!postImage;
  const imageChanged = uploadedFile !== null;
  const formChanged = form.formState.isDirty;
  const isDisabled = !hasImage || (!formChanged && !imageChanged);

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h1 className="text-2xl sm:text-5xl mb-4 sm:mb-10">Update your post</h1>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col sm:flex-row items-center gap-8 w-full max-w-6xl justify-center"
        >
          <div className="w-full flex-col sm:flex-row flex items-center justify-center mt-[40px] gap-10">
            <div className={'flex flex-col items-center justify-center'}>
              {postImage ? (
                <div className="flex flex-col items-center gap-2 w-full max-w-sm relative">
                  <div className="relative w-full rounded-lg overflow-hidden">
                    <img
                      src={postImage}
                      alt={'cube image'}
                      className="w-full rounded-lg"
                    />
                  </div>
                  <Button type="button" onClick={handleResetImage} variant="outline">
                    Change Image
                  </Button>
                </div>
              ) : (
                !postImage && (
                  <div className="h-[300px] w-[335px]">
                    <DragAndDropImageComponent
                      className="flex-1"
                      getRootProps={getRootProps}
                      getInputProps={getInputProps}
                      isDragActive={isDragActive}
                    />
                  </div>
                )
              )}
            </div>
            <div className="w-full sm:max-w-[282px] sm:w-fit space-y-4 flex flex-col px-4">
              <TagsComponent tagAndPosts={post.tagAndPosts} isFileEmpty={isDisabled}
                             setSelectedTagsByUser={setChosenTags}
                             isNotEnteredTags={isNotEnteredTags}></TagsComponent>
              <div className="w-full sm:w-[250px]">
                <label className="text-sm text-gray-500" htmlFor="name">Post name:</label>
                <Input {...form.register('name')} placeholder="Enter name..." />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="w-full sm:w-[250px]">
                <label className="text-sm text-gray-500" htmlFor="description">Post description (optional):</label>
                <Input {...form.register('description')} placeholder="Enter description..." />
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-4 bg-blue-600 w-full flex justify-center items-center"
                disabled={isSubmitting || isDisabled}
              >
                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Update'}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

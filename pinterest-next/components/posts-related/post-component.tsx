'use client';

import { PostCardOpenedVersion } from '@/components/posts-related/post-card-opened-version';
import { ArrowLeftIcon } from 'lucide-react';
import { PostsComponent } from '@/components/posts-related/posts-component';
import { useRouter } from 'next/navigation';
import { PostInteractableSection } from '@/components/posts-related/post-interactable-section';
import { usePost } from '@/components/contexts/post-context';

export const PostComponent = () => {
  const router = useRouter();
  const { post } = usePost();

  const handleBack = () => {
    router.back();
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  };

  return (
    <div className={'flex flex-col'}>
      <div className="px-5 sm:px-[80px] pt-10 pb-4 sm:py-10">
        <div className="flex flex-col sm:flex-row justify-center gap-8">
          <div
            className="w-full sm:min-w-[240px] sm:max-w-[300px] md:max-w-[370px] xl:max-w-[430px] flex items-center justify-center relative gap-8">
            <div onClick={handleBack}
                 className={'hidden md:block rounded-full p-2.5 cursor-pointer bg-blue-600 text-white hover:bg-blue-700'}>
              <ArrowLeftIcon /></div>
            <PostCardOpenedVersion
              image={post.postImageUrl} />
          </div>
          <PostInteractableSection />
        </div>
      </div>
      <PostsComponent postId={post.id.toString()} isPostPage={true}></PostsComponent>
    </div>
  );
};
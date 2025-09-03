'use client';

import { EditIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui-components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/components/contexts/auth-context';
import { useLikes } from '@/lib/hooks/swr';
import { usePathname } from 'next/navigation';
import { handleDownload } from '@/lib/helpers/edit-post-helper';

interface Props {
  image: string,
  id: number,
  isOwner?: boolean,
  isLiked?: boolean,
}

export const PostCardComponent = ({ image, id, isOwner, isLiked }: Props) => {
  const { hasLiked, toggleLikes, isLoading } = useLikes(id);
  const [isLoaded, setIsLoaded] = useState<boolean>();
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const { isAuthenticated } = useAuth();
  const pathName = usePathname();
  const isProfilePage = pathName.startsWith('/profile/');

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(ratio);
      setIsLoaded(true);
    };
  }, [image]);

  return (
    <div className={'break-inside-avoid rounded-lg shadow-sm overflow-hidden relative'}>
      {isLoaded ? (
        <Link href={`/posts/${id}`} className={'block'}>
          <img
            src={image}
            alt={'cube image'}
            className="w-full h-auto rounded-lg"
          />
        </Link>
      ) : aspectRatio ? (
        <div
          className="w-full bg-gray-200 animate-pulse rounded-lg"
          style={{ aspectRatio: `${1 / aspectRatio}` }}
        />
      ) : (
        <Skeleton className="w-full aspect-[3/4]" />
      )}
      <div className={'absolute bottom-5 right-5'}>
        <div className={'flex items-center gap-2.5'}>
          <div onClick={() => handleDownload(image)}
               className="rounded-full bg-white p-2 cursor-pointer hover:bg-white/70">
            <ShareIcon size={20} />
          </div>
          {isProfilePage ? (
            isOwner && (
              <Link
                href={`/posts/${id}/edit-post`}
                className="rounded-full bg-white p-2 hover:bg-white/70 transition-colors duration-200"
              >
                <EditIcon size={20} />
              </Link>
            )
          ) : (
            <div
              onClick={() =>
                isAuthenticated ? toggleLikes() : toast('Log In to like')
              }
              className="rounded-full bg-white p-2 cursor-pointer hover:bg-white/70"
            >
              {isOwner ? (
                <Link
                  href={`/posts/${id}/edit-post`}
                  className="rounded-full block"
                >
                  <EditIcon size={20} />
                </Link>
              ) : (
                <HeartIcon
                  size={20}
                  className={cn(
                    isLoading
                      ? isLiked && 'fill-red-600 text-red-600'
                      : hasLiked && 'fill-red-600 text-red-600',
                  )}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
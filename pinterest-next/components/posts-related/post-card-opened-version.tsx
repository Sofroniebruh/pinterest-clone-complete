'use client';

import { Skeleton } from '@/components/ui-components/ui/skeleton';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui-components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  image: string;
}

export const PostCardOpenedVersion = ({ image }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setIsLoaded(true);
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    };

  }, [image]);

  return (
    <>
      {isLoaded ? (
        <div className={'relative'}>
          <Button onClick={router.back} size={'lg'}
                  className={'absolute md:hidden top-5 left-5 bg-blue-600 text-white hover:bg-blue-500'}><ArrowLeftIcon /> Back</Button>
          <img
            src={image}
            alt={'cube image'}
            className="w-full h-auto rounded-lg"
          />
        </div>
      ) : aspectRatio ? (
        <div
          className="w-full bg-gray-200 animate-pulse rounded-lg"
          style={{ aspectRatio: `${1 / aspectRatio}` }}
        />
      ) : (
        <Skeleton className="w-full aspect-[3/4]" />
      )}
    </>
  );
};
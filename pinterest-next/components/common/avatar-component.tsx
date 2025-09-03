'use client';

import { LoaderCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui-components/ui/avatar';

interface Props {
  email: string | undefined;
  className?: string;
  profilePicture?: string | null;
  isForProfile?: boolean;
  profileIsLoading?: boolean;
  setProfileIsLoading?: (isLoading: boolean) => void;
}

const loader = (
  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-full">
    <LoaderCircleIcon className="animate-spin w-4 h-4 text-gray-500" />
  </div>
);

export const AvatarComponent = ({
                                  email,
                                  className,
                                  profilePicture,
                                  setProfileIsLoading,
                                  profileIsLoading,
                                  isForProfile,
                                }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!profilePicture) {
      isForProfile ? (setProfileIsLoading!(false)) : setIsLoading(false);

      return;
    }

  }, [profilePicture, isForProfile, setProfileIsLoading]);

  return (
    <div className={cn('relative', className)}>
      <Avatar className="w-full h-full overflow-hidden">
        {profilePicture ? (
          <AvatarImage
            className="object-cover w-full h-full"
            src={profilePicture}
            alt="Profile"
            onLoad={() => isForProfile ? setProfileIsLoading!(false) : setIsLoading(false)}
            onError={() => isForProfile ? setProfileIsLoading!(false) : setIsLoading(false)}
          />
        ) : (
          <>
            <AvatarFallback>
              {email ? email.slice(0, 2).toUpperCase() : 'C'}
            </AvatarFallback>
          </>
        )}

      </Avatar>
      {isForProfile ? (
        profileIsLoading && (
          loader
        )
      ) : (isLoading && (
        loader
      ))
      }
    </div>
  );
};
import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui-components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
  className?: string;
  isForAuth?: boolean;
  step?: 1 | 2,
  setStep?: (step: 1 | 2) => void;
}

export const CommonCard = ({ children, className, isForAuth, step, setStep }: Props) => {
  return (
    <div className={'w-full min-h-screen flex justify-center items-center'}>
      <div
        className={cn('bg-white z-50 flex flex-col gap-10 rounded-lg shadow-sm items-center justify-center p-10 py-10 w-fit sm:w-[400px]', className)}>
        {isForAuth && (
          <div className={'flex w-full items-start'}>
            {step === 2 ? (
              <Button onClick={() => setStep!(1)} className={'text-blue-600'}
                      variant={'ghost'}><ArrowLeftIcon></ArrowLeftIcon> Go
                Back</Button>
            ) : (
              <Link href={'/'}>
                <Button className={'text-blue-600'}
                        variant={'ghost'}><ArrowLeftIcon></ArrowLeftIcon> Go
                  Back</Button>
              </Link>
            )}
          </div>
        )}
        <div className={'flex items-center justify-center bg-white rounded-full z-50 p-10 shadow-sm'}>
          <Image src={'/main_logo.png'} alt={'main logo'} width={100} height={100}></Image>
        </div>
        {children}
      </div>
    </div>
  );
};

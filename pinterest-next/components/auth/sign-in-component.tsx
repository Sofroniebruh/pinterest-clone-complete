'use client';

import { Input } from '@/components/ui-components/ui/input';
import { Button } from '@/components/ui-components/ui/button';
import { LogInIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import { formLoginSchema, LoginFormType } from '@/components/auth/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { CommonCard } from '@/components/common';
import { API } from '@/lib/api-client/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { HandleNextStage } from '@/lib/helpers';
import { useAuth } from '@/components/contexts/auth-context';
import { mutate as globalMutate } from 'swr';
import { useStore } from 'zustand/react';
import { sheetStore } from '@/lib/store';
import { UserWithNoPassword } from '@/lib/helpers/helper-types-or-interfaces';

export const SignInComponent = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const { setUser } = useAuth();
  const router = useRouter();
  const setAllSheetsClosed = useStore(sheetStore, (state) => state.setAllSheetsClosed);
  const form = useForm<LoginFormType>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleNext = async () => {
    const isValid = await HandleNextStage({ loginForm: form });

    isValid && setStep(2);
  };

  const handleSignInWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/posts' });
  };

  const onSubmit = async (data: LoginFormType) => {
    const res = await API.auth.login(data);

    if (!(res instanceof Error) && res.status === 200) {
      setAllSheetsClosed();
      setUser(res.user as UserWithNoPassword);
      await globalMutate(() => true, undefined, { revalidate: false });
      router.push('/posts');
      toast.success('Login successful');

      return;
    }

    setUser(null);
    toast.error(res.message);
  };

  return (
    <CommonCard isForAuth={true} setStep={setStep} step={step}>
      <FormProvider {...form}>
        {step === 1 ? (
          <form className={'flex flex-col gap-6'}>
            <div className={'flex flex-col gap-3 w-[255px]'}>
              <div className={'flex flex-col gap-1'}>
                <Input {...form.register('email')} className={'outline-none'}
                       placeholder={'Enter your email'}></Input>
                {form.formState.errors.email &&
                  <p className={'text-sm text-red-500'}>{form.formState.errors.email.message}</p>}
              </div>
              <Button type={'button'} onClick={handleNext}
                      className={'bg-blue-600 hover:bg-blue-700 shadow-sm text-base'}>Sign
                In <LogInIcon></LogInIcon></Button>
            </div>
            <div className={'flex w-full items-center justify-center gap-2'}>
              <div className={'h-0.5 w-full bg-gray-200'}></div>
              <p className={'text-base text-gray-500'}>OR</p>
              <span className={'h-0.5 w-full bg-gray-200'}></span>
            </div>
            <div className={'flex flex-col gap-3 w-full'}>
              <Button onClick={handleSignInWithGoogle} type={'button'}
                      className={'shadow-sm w-full text-base'}
                      variant={'outline'}>Sign In with <Image
                src={'/google-icon.png'}
                alt={'google icon'} width={20} height={20}></Image></Button>
              <p className={'text-sm text-gray-400 text-center'}>Don't have an account? <Link
                className={'text-blue-600'}
                href={'/sign-up'}>Sign Up
                here</Link></p>
            </div>
          </form>
        ) : (
          <form className={'flex flex-col gap-6'} onSubmit={form.handleSubmit(onSubmit)}>
            <div className={'flex flex-col gap-3 w-[255px]'}>
              <div className={'flex flex-col gap-1'}>
                <Input className={'outline-none'} {...form.register('password')}
                       placeholder={'Enter your password'}
                       type={'password'}></Input>
                {form.formState.errors.password &&
                  <p className={'text-sm text-red-500'}>{form.formState.errors.password.message}</p>}
              </div>
              <Button type={'submit'} className={'bg-blue-600 hover:bg-blue-700 shadow-sm text-base'}>Sign
                In <LogInIcon></LogInIcon></Button>
            </div>
            <p className={'text-sm text-gray-400 text-center'}>Forgot your password? <Link
              className={'text-blue-600'}
              href={'/request-password-change'}>Click here</Link></p>
          </form>
        )}
      </FormProvider>
    </CommonCard>
  );
};
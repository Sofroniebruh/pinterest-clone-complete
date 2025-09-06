'use client';

import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui-components/ui/input';
import { CommonCard } from '@/components/common';
import { Button } from '@/components/ui-components/ui/button';
import { FormProvider, useForm } from 'react-hook-form';
import { twoPasswordsSchema, TwoPasswordsSchemaType } from '@/components/auth/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { API } from '@/lib/api-client/api';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const form = useForm<TwoPasswordsSchemaType>({
    resolver: zodResolver(twoPasswordsSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  if (!token) {
    return notFound();
  }

  const onSubmit = async (data: TwoPasswordsSchemaType) => {
    const res = await API.passwordActions.passwordReset(data.password, token);
    if (res.isOk) {
      toast.success('Password has been reset successfully');
      router.push(`/profile/${res.user.id}`);

      return;
    }

    toast.error('Error resetting password');
  };

  return (
    <FormProvider {...form}>
      <CommonCard>
        <form onSubmit={form.handleSubmit(onSubmit)} className={'w-full sm:w-[90%]'}>
          <div className={'flex flex-col gap-5 w-full'}>
            <h1 className={'text-3xl sm:text-4xl text-center'}>Change password</h1>
            <div
              className={'gap-2.5 flex sm:text-base flex-col items-center justify-center min-w-[255px] w-full'}>
              <div className="flex flex-col gap-1 w-full">
                <Input {...form.register('password')} type={'password'} className={'w-full'}
                       placeholder={'Enter new password'}></Input>
                {form.formState.errors.password && (
                  <p className={'text-sm text-red-500'}>{form.formState.errors.password.message}</p>)}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Input {...form.register('confirmPassword')} type={'password'} className={'w-full'}
                       placeholder={'Repeat new password'}></Input>
                {form.formState.errors.confirmPassword && (
                  <p className={'text-sm text-red-500'}>{form.formState.errors.confirmPassword.message}</p>)}
              </div>
            </div>
            <Button type={'submit'} size={'lg'}
                    className={'bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-sm text-base w-full'}>Submit</Button>
          </div>
        </form>
      </CommonCard>
    </FormProvider>
  );
}
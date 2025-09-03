'use client';

import { CommonCard } from '@/components/common';
import { Input } from '@/components/ui-components/ui/input';
import { Button } from '@/components/ui-components/ui/button';
import { FormProvider, useForm } from 'react-hook-form';
import { emailSchema, EmailType } from '@/components/auth/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { API } from '@/lib/api-client/api';

export default function RequestPasswordChangePage() {
  const form = useForm<EmailType>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: EmailType) => {
    if (await API.passwordActions.passwordResetRequest(data)) {
      toast.success('Email has been sent');

      return;
    }

    toast.error('Error sending email');
  };

  return (
    <FormProvider {...form}>
      <CommonCard>
        <form className={'w-full sm:w-[90%]'} onSubmit={form.handleSubmit(onSubmit)}>
          <div className={'flex flex-col gap-5 w-full'}>
            <div className={'flex flex-col gap-2.5 justify-center items-center w-full'}>
              <h1 className={'text-3xl sm:text-4xl'}>Enter email</h1>
              <p className={'text-sm text-gray-400'}>You will receive a link shortly after</p>
            </div>
            <div className={'flex flex-col gap-2.5 justify-center w-full'}>
              <div className={'flex flex-col gap-1'}>
                <Input {...form.register('email')} className={'w-full'}
                       placeholder={'Enter your email'}></Input>
                {form.formState.errors.email && (
                  <p className={'text-sm text-red-500'}>{form.formState.errors.email.message}</p>)}
              </div>
              <Button type={'submit'} size={'lg'}
                      className={'bg-blue-600 cursor-pointer shadow-sm text-base w-full'}>Send
                link</Button>
            </div>
          </div>
        </form>
      </CommonCard>
    </FormProvider>
  );
}
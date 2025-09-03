'use client';

import { LogOutIcon, SettingsIcon } from 'lucide-react';
import { ChangableAvatarComponent, DialogComponent, HoverCardComponent, SheetComponent } from '@/components/common';
import { Input } from '@/components/ui-components/ui/input';
import { Button } from '@/components/ui-components/ui/button';
import { ProfileTabsComponent } from '@/components/profile-related/profile-tabs';
import { API } from '@/lib/api-client/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FormProvider, useForm } from 'react-hook-form';
import { usernameSchema, UsernameSchemaType } from '@/components/auth/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/contexts/auth-context';
import { ServerUserType } from '@/app/(with-header)/profile/[id]/page';
import { useUserUsername } from '@/lib/hooks/swr';
import { mutate as globalMutate } from 'swr';
import { DeleteDialogComponent } from '@/components/common/delete-dialog-component';
import { useStore } from 'zustand/react';
import { dialogStore, sheetStore } from '@/lib/store';

interface Props {
  user: ServerUserType;
}

export const ProfileComponent = ({ user }: Props) => {
    const [saveDisabled, setSaveDisabled] = useState(true);
    const { mutate, changeUsername, isLoading, profileUser } = useUserUsername(user.user.id.toString());
    const { logout, setUser } = useAuth();
    const dialogs = useStore(dialogStore, (state) => state.dialogs);
    const isOpenDeleteAccountDialog = dialogs.some(d => d.key.name === 'deleteAccount');
    const setIsOpen = useStore(dialogStore, (state) => state.setIsOpen);
    const sheets = useStore(sheetStore, (state) => state.sheets);
    const isOpenSettingsSheet = sheets.some(s => s.key.name === 'settings sheet');
    const setIsSheetOpen = useStore(sheetStore, (state) => state.setIsSheetOpen);

    function truncate(text: string, maxLength: number): string {
      if (!text) return '';
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    const validatedUsername = truncate(isLoading ? user.user.username : profileUser?.username || user.user.username, 10);

    const router = useRouter();
    const form = useForm<UsernameSchemaType>({
      resolver: zodResolver(usernameSchema),
      defaultValues: {
        username: '',
      },
    });

    const handleUsernameSubmit = async (value: UsernameSchemaType, id: string) => {
      try {
        await changeUsername(value.username, id);
        setIsSheetOpen(false, { key: { name: 'settings sheet' }, value: false });
        await mutate();
        return;
      } catch (error) {
        console.error(error);
        toast.error('Error updating your username.');
      }
    };

    const handleDelete = async () => {
      if (await API.changeUserInfo.deleteUser(user.user.id.toString())) {
        setUser(null);
        router.replace('/');
        router.refresh();

        return;
      }

      toast.error('Error deleting the user');
    };

    const handleLogout = async () => {
      try {
        await logout();
        router.replace('/sign-in');
        router.refresh();
        await globalMutate(() => true, undefined, { revalidate: false });
        return;
      } catch (error) {
        console.log(error);
        toast.error('Error while logging out');
      }
    };

    return (
      <div className={'w-full min-h-screen p-5 flex flex-col'}>
        <div className={'flex flex-col items-center justify-center gap-5'}>
          <ChangableAvatarComponent isOwner={user.isOwner} id={user.user.id}
                                    email={isLoading ? user.user.email : profileUser?.email || ''}
                                    className={'sm:w-[110px] sm:h-[110px]'}></ChangableAvatarComponent>
          {/*{isInfoLoading ? (*/}
          {/*  <div className={'flex flex-col items-center justify-center gap-1'}>*/}

          {/*    <Skeleton className={'w-[174px] h-[32px] sm:w-[174px] sm:h-[48px]'}></Skeleton>*/}
          {/*    <Skeleton className={'w-[174px] h-[24px] sm:w-[174px] sm:h-[28px]'}></Skeleton>*/}
          {/*  </div>*/}
          {/*) : (*/}
          <div className={'flex flex-col items-center justify-center gap-1'}>
            <HoverCardComponent trigger={
              <h1 className={'text-2xl sm:text-5xl'}>{validatedUsername}</h1>
            } content={isLoading ? user.user.username : profileUser?.username || user.user.username} />
            <p className={'text-gray-700 text-base sm:text-lg'}>{user.user.email}</p>
          </div>
          {/*)}*/}
          {user.isOwner &&
            <div className={'flex gap-2.5'}>
              <div onClick={handleLogout}
                   className={'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer rounded-md border shadow-sm flex p-2 gap-2 px-4'}>
                Log Out <LogOutIcon></LogOutIcon>
              </div>
              <SheetComponent openState={isOpenSettingsSheet} triggerElement={
                <div onClick={() => setIsSheetOpen(true, { key: { name: 'settings sheet' }, value: true })}
                     className={'rounded-md border shadow-sm cursor-pointer flex p-2 gap-2 px-4'}>
                  Settings <SettingsIcon></SettingsIcon>
                </div>
              } sheetTitle={'Settings'}>
                <div className={'w-full flex items-center justify-center'}>
                  <div className={'flex-col flex gap-2 w-3/4'}>
                    <div className={'w-full flex items-center justify-center mb-4'}>
                      <ChangableAvatarComponent isOwner={user.isOwner} id={user.user.id}
                                                email={user.user.email}></ChangableAvatarComponent>
                    </div>
                    <FormProvider {...form}>
                      <form onSubmit={form.handleSubmit((value) => handleUsernameSubmit(value, user.user.id.toString()))}>
                        <label className={'text-sm text-gray-500'} htmlFor={'username'}>Your
                          username</label>
                        <div>
                          <div className={'relative'}>
                            <Input {...form.register('username')}
                                   onChange={() => setSaveDisabled(false)} className={'mt-1'}
                                   name={'username'}
                                   placeholder={isLoading ? user.user.username : profileUser?.username || user.user.username}></Input>
                          </div>
                          {form.formState.errors.username && (
                            <p className={'text-sm text-red-500'}>{form.formState.errors.username.message}</p>
                          )}
                        </div>
                        <div>
                          <label className={'text-sm text-gray-500'} htmlFor={'email'}>Your
                            email</label>
                          <Input className={'mt-1'} name={'email'} value={user.user.email} readOnly={true}
                                 disabled={true}></Input>
                        </div>
                        <div className={'mt-10 sm:mt-0 flex gap-2 flex-col sm:flex-row'}>
                          <Link href={'/request-password-change'}>
                            <Button type={'button'} variant={'outline'}
                                    className={'mt-4 w-full text-sm'}>Change
                              your
                              password</Button>
                          </Link>
                          <Button type={'submit'} disabled={saveDisabled} variant={'outline'}
                                  className={'sm:mt-4 text-sm sm:flex-1'}>Save</Button>
                        </div>
                      </form>
                    </FormProvider>
                    <DialogComponent classNameForTriggerButton={'mt-10'} openState={isOpenDeleteAccountDialog}
                                     triggerButton={
                                       <div
                                         onClick={() => setIsOpen(true, { key: { name: 'deleteAccount' }, value: true })}
                                         className={'cursor-pointer bg-red-500 hover:bg-red-600 text-sm text-white p-2 rounded-md'}>Delete
                                         account</div>
                                     } title={'Are you sure?'} description={'This action can not be undone'}>
                      <DeleteDialogComponent deleteButton={
                        <Button className={"bg-red-500 hover:bg-red-600"} size={'lg'} variant={'destructive'} onClick={handleDelete}>Delete My account</Button>
                      } setDialogOpen={() => setIsOpen(false, { key: { name: 'deleteAccount' }, value: false })}
                      />
                    </DialogComponent>
                  </div>
                </div>
              </SheetComponent>
            </div>
          }
        </div>
        <div className={'w-full mt-10'}>
          <ProfileTabsComponent id={user.user.id}></ProfileTabsComponent>
        </div>
      </div>
    );
  }
;
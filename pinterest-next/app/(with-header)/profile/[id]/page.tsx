import { ProfileComponent } from '@/components/profile-related';
import { UserWithNoPassword } from '@/lib/helpers/helper-types-or-interfaces';
import { cookies } from 'next/headers';
import { API } from '@/lib/api-client/api';
import { redirect } from 'next/navigation';

export type ServerUserType = {
  user: UserWithNoPassword,
  isOwner: boolean
}

export default async function ProfilePage(
  { params }: {
    params: Promise<{ id: string }>;
  }) {
  const { id } = await params;
  const cookiesStore = await cookies();
  const token = cookiesStore.get('jwt')?.value;

  const user = await API.getUserInfo.getUserInfo(id, token);

  if (!user || user instanceof Error) {
    return redirect('/not-found');
  }

  return (
    <ProfileComponent user={user}></ProfileComponent>
  );
}
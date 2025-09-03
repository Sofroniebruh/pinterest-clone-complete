import { NewPostComponent } from '@/components/posts-related';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function NewPostPage() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('jwt')?.value;

  if (!token) {
    redirect('/sign-in');
  }

  return (
    <NewPostComponent></NewPostComponent>
  );
}
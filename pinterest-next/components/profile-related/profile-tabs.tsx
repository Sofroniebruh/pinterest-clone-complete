import { TabsComponent, TabsContent, TabsTrigger } from '@/components/common/tabs-component';
import { LikedPosts } from '@/components/profile-related/liked-posts';
import { CommentedPostsComponent } from '@/components/profile-related/commented-posts';
import { CreatedPostsComponent } from '@/components/profile-related/created-posts';

interface Props {
  id: number
}

export const ProfileTabsComponent = ({id} : Props) => {
  const tabs: TabsTrigger[] = [
    {
      name: 'Liked',
      value: 'liked-posts',
    },
    {
      name: 'Commented',
      value: 'commented',
    },
    {
      name: 'Created',
      value: 'created',
    },
  ];

  const content: TabsContent[] = [
    {
      value: 'liked-posts',
      content: <LikedPosts id={id}></LikedPosts>,
    },
    {
      value: 'commented',
      content: <CommentedPostsComponent id={id}></CommentedPostsComponent>,
    },
    {
      value: 'created',
      content: <CreatedPostsComponent id={id}></CreatedPostsComponent>,
    },
  ];

  return (
    <TabsComponent tabs={tabs} content={content}
                   mainClassName={'w-full flex flex-col items-center justify-center'}></TabsComponent>
  );
};
import { Post, Tags } from '@prisma/client';

export interface PostWithRelations extends Post {
  isLikedByUser: boolean;
  createdBy: {
    id: number
    email: string
    username: string | null
    pfpUrl: string | null
  };
  likes: {
    userId: number
    postId: number
  }[];
  comments: {
    id: number
    commentContent: string
    commentOwner: {
      id: number,
      pfpUrl: string | null,
      username: string,
    },
    createdAt: Date,
  }[];
  isOwner?: boolean;
  tagAndPosts: TagAndPost[];
}

export interface PostWithTags extends Post {
  tagAndPosts: TagAndPost[];
}

export type TagAndPost = {
  postId: number
  tagId: number
  tag: Tags
}

export type UserWithNoPassword = {
  id: number,
  email: string,
  username: string,
  pfpUrl: string | null,
}

export interface PostsWithLikedByCurrentUser {
  isLikedByCurrentUser: boolean;
  likes: {
    userId: number
  }[];
  id: number;
  userId: number;
  postName: string;
  description: string | null;
  postImageUrl: string;
  createdAt: Date;
  updatedAt: Date | null;
  isOwner?: boolean;
}

export interface PostOwner {
  id: number;
  email: string;
}

export interface CommentStructure {
  message: string;
  id: number;
}

export interface EditCommentStructure {
  message: string;
  commentId: number;
}

export interface PlainPostsWithIsOwner extends Post {
  isOwner: boolean;
}

export interface TagsWithIsCreated {
  tagName: string;
  isCreated: boolean;
}

export interface PostWithTagsAndLiked {
  createdBy: {
    id: number
    email: string
    username: string | null
    pfpUrl: string | null
  };
  likes: {
    userId: number
  }[];
  comments: {
    id: number
    createdAt: Date
    commentContent: string
    likes: {}[]
    commentOwner: {}
  }[];
  tagAndPosts: {}[];
}

export interface PostComment {
  id: number
  likes: {
    userId: number
    commentId: number
  }[]
  commentContent: string
  createdAt: Date
  commentOwner: {
    id: number
    username: string | null
    pfpUrl: string | null
  }
}

export type AuthUser = {
  id: string;
  username: string;
};

export type AccountUser = AuthUser & {
  password: string;
};

export type Comment = {
  id: string;
  postId: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
};

export type PostFormValues = {
  title: string;
  content: string;
  tags: string[];
};

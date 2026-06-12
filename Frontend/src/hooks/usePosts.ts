import { useMemo } from "react";
import { initialPosts } from "../data/seed";
import { createId } from "../lib/id";
import type { AuthUser, Post, PostFormValues } from "../types";
import { useLocalStorage } from "./useLocalStorage";

const POSTS_KEY = "mini-board.posts";

export function usePosts() {
  const [posts, setPosts] = useLocalStorage<Post[]>(POSTS_KEY, initialPosts);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [posts],
  );

  const createPost = (values: PostFormValues, author: AuthUser) => {
    const timestamp = new Date().toISOString();
    const nextPost: Post = {
      id: createId("post"),
      title: values.title.trim(),
      content: values.content.trim(),
      tags: values.tags,
      authorId: author.id,
      authorName: author.username,
      createdAt: timestamp,
      updatedAt: timestamp,
      comments: [],
    };

    setPosts((currentPosts) => [nextPost, ...currentPosts]);
  };

  const updatePost = (
    postId: string,
    values: PostFormValues,
    authorId: string,
  ) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId && post.authorId === authorId
          ? {
              ...post,
              title: values.title.trim(),
              content: values.content.trim(),
              tags: values.tags,
              updatedAt: new Date().toISOString(),
            }
          : post,
      ),
    );
  };

  const deletePost = (postId: string, authorId: string) => {
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => !(post.id === postId && post.authorId === authorId),
      ),
    );
  };

  const addComment = (postId: string, body: string, author: AuthUser) => {
    const trimmedBody = body.trim();
    if (!trimmedBody) {
      return;
    }

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: createId("comment"),
                  postId,
                  body: trimmedBody,
                  authorId: author.id,
                  authorName: author.username,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : post,
      ),
    );
  };

  const deleteComment = (
    postId: string,
    commentId: string,
    authorId: string,
  ) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.filter(
                (comment) =>
                  !(comment.id === commentId && comment.authorId === authorId),
              ),
            }
          : post,
      ),
    );
  };

  return {
    posts: sortedPosts,
    createPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
  };
}

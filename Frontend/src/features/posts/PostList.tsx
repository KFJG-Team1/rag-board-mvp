import type { AuthUser, Post } from "../../types";
import { PostCard } from "./PostCard";

type PostListProps = {
  posts: Post[];
  currentUser: AuthUser | null;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onAddComment: (postId: string, body: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
};

export function PostList({
  posts,
  currentUser,
  onEdit,
  onDelete,
  onAddComment,
  onDeleteComment,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <section className="empty-state">
        <h2>게시물이 없습니다</h2>
        <p>검색어나 태그 필터를 바꾸거나 새 게시물을 작성해보세요.</p>
      </section>
    );
  }

  return (
    <section className="post-list" aria-label="게시물 목록">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      ))}
    </section>
  );
}

import type { AuthUser, Post } from "../../types";
import { Comments } from "../comments/Comments";

type PostCardProps = {
  post: Post;
  currentUser: AuthUser | null;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onAddComment: (postId: string, body: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function PostCard({
  post,
  currentUser,
  onEdit,
  onDelete,
  onAddComment,
  onDeleteComment,
}: PostCardProps) {
  const canManage = currentUser?.id === post.authorId;

  return (
    <article className="post-card">
      <header className="post-header">
        <div>
          <div className="post-meta">
            <span>{post.authorName}</span>
            <span>{formatDate(post.updatedAt)}</span>
          </div>
          <h2>{post.title}</h2>
        </div>
        {canManage && (
          <div className="button-row">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => onEdit(post)}
            >
              수정
            </button>
            <button
              className="button button-danger"
              type="button"
              onClick={() => onDelete(post.id)}
            >
              삭제
            </button>
          </div>
        )}
      </header>

      <p className="post-content">{post.content}</p>

      {post.tags.length > 0 && (
        <div className="tag-list" aria-label="게시물 태그">
          {post.tags.map((tag) => (
            <span className="tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <Comments
        comments={post.comments}
        currentUser={currentUser}
        onAdd={(body) => onAddComment(post.id, body)}
        onDelete={(commentId) => onDeleteComment(post.id, commentId)}
      />
    </article>
  );
}

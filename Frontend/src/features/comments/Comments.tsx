import { useState } from "react";
import type { AuthUser, Comment } from "../../types";

type CommentsProps = {
  comments: Comment[];
  currentUser: AuthUser | null;
  onAdd: (body: string) => void;
  onDelete: (commentId: string) => void;
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function Comments({
  comments,
  currentUser,
  onAdd,
  onDelete,
}: CommentsProps) {
  const [body, setBody] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd(body);
    setBody("");
  };

  return (
    <section className="comments">
      <div className="comments-title">
        <h3>댓글</h3>
        <span>{comments.length}</span>
      </div>

      {comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <div>
                <strong>{comment.authorName}</strong>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
              <p>{comment.body}</p>
              {currentUser?.id === comment.authorId && (
                <button
                  className="inline-action"
                  type="button"
                  onClick={() => onDelete(comment.id)}
                >
                  삭제
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">아직 댓글이 없습니다.</p>
      )}

      {currentUser ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="댓글 작성"
          />
          <button className="button button-secondary" type="submit">
            등록
          </button>
        </form>
      ) : (
        <p className="muted">댓글 작성은 로그인 후 가능합니다.</p>
      )}
    </section>
  );
}

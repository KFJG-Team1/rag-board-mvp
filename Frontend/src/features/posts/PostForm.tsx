import { useEffect, useState } from "react";
import type { Post, PostFormValues } from "../../types";

type PostFormProps = {
  editingPost: Post | null;
  onCancelEdit: () => void;
  onSubmit: (values: PostFormValues) => void;
};

export function PostForm({
  editingPost,
  onCancelEdit,
  onSubmit,
}: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagText, setTagText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setTitle(editingPost?.title ?? "");
    setContent(editingPost?.content ?? "");
    setTagText(editingPost?.tags.join(", ") ?? "");
    setErrorMessage("");
  }, [editingPost]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTagText("");
    setErrorMessage("");
  };

  const parseTags = () =>
    tagText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .filter((tag, index, allTags) => allTags.indexOf(tag) === index);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorMessage("제목과 내용을 모두 입력해주세요.");
      return;
    }

    onSubmit({
      title,
      content,
      tags: parseTags(),
    });

    if (!editingPost) {
      resetForm();
    }
  };

  return (
    <section className="panel composer-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">게시물</p>
          <h2>{editingPost ? "게시물 수정" : "새 게시물 작성"}</h2>
        </div>
        {editingPost && (
          <button
            className="button button-ghost"
            type="button"
            onClick={onCancelEdit}
          >
            취소
          </button>
        )}
      </div>

      <form className="stack" onSubmit={handleSubmit}>
        <label>
          제목
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="게시물 제목"
          />
        </label>
        <label>
          내용
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="게시물 내용을 입력하세요"
            rows={6}
          />
        </label>
        <label>
          태그
          <input
            value={tagText}
            onChange={(event) => setTagText(event.target.value)}
            placeholder="react, typescript"
          />
        </label>
        {errorMessage && <p className="form-error">{errorMessage}</p>}
        <button className="button button-primary" type="submit">
          {editingPost ? "수정 완료" : "등록"}
        </button>
      </form>
    </section>
  );
}

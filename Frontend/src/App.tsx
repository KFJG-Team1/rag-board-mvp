import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./features/auth/AuthPanel";
import { useAuth } from "./features/auth/AuthContext";
import { Pagination } from "./features/pagination/Pagination";
import { PostForm } from "./features/posts/PostForm";
import { PostList } from "./features/posts/PostList";
import { SearchBar } from "./features/search/SearchBar";
import { TagFilter } from "./features/tags/TagFilter";
import { usePosts } from "./hooks/usePosts";
import type { Post, PostFormValues } from "./types";

const PAGE_SIZE = 4;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default function App() {
  const { currentUser } = useAuth();
  const {
    posts,
    createPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
  } = usePosts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const allTags = useMemo(
    () =>
      Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const keyword = normalize(searchTerm);

    return posts.filter((post) => {
      const matchesTag = selectedTag ? post.tags.includes(selectedTag) : true;
      const searchableText = normalize(
        [post.title, post.content, post.authorName, post.tags.join(" ")].join(
          " ",
        ),
      );
      const matchesSearch = keyword ? searchableText.includes(keyword) : true;

      return matchesTag && matchesSearch;
    });
  }, [posts, searchTerm, selectedTag]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const pagedPosts = filteredPosts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTag]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePostSubmit = (values: PostFormValues) => {
    if (!currentUser) {
      return;
    }

    if (editingPost) {
      updatePost(editingPost.id, values, currentUser.id);
      setEditingPost(null);
      return;
    }

    createPost(values, currentUser);
  };

  const handleDeletePost = (postId: string) => {
    if (!currentUser) {
      return;
    }

    deletePost(postId, currentUser.id);
    if (editingPost?.id === postId) {
      setEditingPost(null);
    }
  };

  const handleAddComment = (postId: string, body: string) => {
    if (!currentUser) {
      return;
    }

    addComment(postId, body, currentUser);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (!currentUser) {
      return;
    }

    deleteComment(postId, commentId, currentUser.id);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">React + TypeScript</p>
          <h1>미니 게시판</h1>
        </div>
        <p>회원가입부터 검색까지 한 화면에서 확인하는 최소 구현입니다.</p>
      </header>

      <main className="app-layout">
        <aside className="sidebar">
          <AuthPanel />
          {currentUser ? (
            <PostForm
              editingPost={editingPost}
              onCancelEdit={() => setEditingPost(null)}
              onSubmit={handlePostSubmit}
            />
          ) : (
            <section className="panel locked-panel">
              <p className="eyebrow">작성</p>
              <h2>로그인이 필요합니다</h2>
              <p>게시물 작성, 수정, 삭제와 댓글 작성은 로그인 후 사용할 수 있습니다.</p>
            </section>
          )}
        </aside>

        <section className="content">
          <div className="toolbar">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <TagFilter
              tags={allTags}
              selectedTag={selectedTag}
              onSelect={setSelectedTag}
            />
          </div>

          <div className="result-summary">
            <strong>{filteredPosts.length}</strong>
            <span>개의 게시물</span>
          </div>

          <PostList
            posts={pagedPosts}
            currentUser={currentUser}
            onEdit={setEditingPost}
            onDelete={handleDeletePost}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </section>
      </main>
    </div>
  );
}

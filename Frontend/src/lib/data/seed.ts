import type { Post } from "../types";

const now = new Date().toISOString();

export const initialPosts: Post[] = [
  {
    id: "post_seed_1",
    title: "React TypeScript 게시판 MVP",
    content:
      "회원가입, 로그인, 게시물 작성, 댓글, 태그, 페이징, 검색 흐름을 확인할 수 있는 샘플 게시물입니다.",
    tags: ["react", "typescript", "mvp"],
    authorId: "system",
    authorName: "관리자",
    createdAt: now,
    updatedAt: now,
    comments: [
      {
        id: "comment_seed_1",
        postId: "post_seed_1",
        body: "로그인하면 댓글 작성과 게시물 작성이 가능합니다.",
        authorId: "system",
        authorName: "관리자",
        createdAt: now,
      },
    ],
  },
  {
    id: "post_seed_2",
    title: "태그와 검색 사용 예시",
    content:
      "검색어는 제목, 본문, 작성자, 태그에 적용됩니다. 태그 버튼을 누르면 해당 태그 게시물만 볼 수 있습니다.",
    tags: ["search", "tag"],
    authorId: "system",
    authorName: "관리자",
    createdAt: now,
    updatedAt: now,
    comments: [],
  },
  {
    id: "post_seed_3",
    title: "페이징 확인용 게시물",
    content:
      "초기 샘플 게시물이 여러 개라서 첫 화면에서도 페이지 이동 버튼을 확인할 수 있습니다.",
    tags: ["pagination", "mvp"],
    authorId: "system",
    authorName: "관리자",
    createdAt: now,
    updatedAt: now,
    comments: [],
  },
  {
    id: "post_seed_4",
    title: "댓글 기능 요약",
    content:
      "로그인한 사용자는 각 게시물 아래에서 댓글을 작성할 수 있고, 자신이 작성한 댓글은 삭제할 수 있습니다.",
    tags: ["comment", "crud"],
    authorId: "system",
    authorName: "관리자",
    createdAt: now,
    updatedAt: now,
    comments: [],
  },
  {
    id: "post_seed_5",
    title: "회원 기능 요약",
    content:
      "회원가입하면 바로 로그인 상태가 되며, 브라우저 저장소에 계정과 세션이 유지됩니다.",
    tags: ["auth", "localStorage"],
    authorId: "system",
    authorName: "관리자",
    createdAt: now,
    updatedAt: now,
    comments: [],
  },
];

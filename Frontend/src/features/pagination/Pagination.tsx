type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        className="button button-secondary"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        이전
      </button>
      <div className="page-numbers">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              className={currentPage === page ? "active" : ""}
              type="button"
              key={page}
              onClick={() => onChange(page)}
            >
              {page}
            </button>
          ),
        )}
      </div>
      <button
        className="button button-secondary"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        다음
      </button>
    </nav>
  );
}

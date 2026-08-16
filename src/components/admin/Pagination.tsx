type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

/** Renders `1 2 3 4 5 … 30` with the current page anchored in view. */
function pageWindow(page: number, totalPages: number) {
  const pages: (number | "gap")[] = [];
  const start = Math.max(1, Math.min(page - 3, totalPages - 4));
  const end = Math.min(totalPages, start + 4);

  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push("gap");
  if (end < totalPages) pages.push(totalPages);

  return pages;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Pagination">
      <span>
        Page {page} of {totalPages}
      </span>

      <div className="pagination__pages">
        <button
          type="button"
          className="pagination__page"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>

        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <span className="pagination__page" key={`gap-${index}`} aria-hidden="true">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={entry}
              className={entry === page ? "pagination__page is-active" : "pagination__page"}
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? "page" : undefined}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          className="pagination__page"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      <label className="pagination__goto">
        Go to page
        <select value={page} onChange={(event) => onPageChange(Number(event.target.value))}>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {String(value).padStart(2, "0")}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}

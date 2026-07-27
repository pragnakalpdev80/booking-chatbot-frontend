import React from "react";

const Pagination = ({ count, pageSize, currentPage, onPageChange }) => {
  if (count === 0) return null;

  const totalPages = Math.ceil(count / pageSize);
  if (totalPages <= 1) return null; // No need for pagination if only 1 page

  const getPageNumbers = () => {
    const pages = [];
    const SIBLING_COUNT = 2;

    const leftSibling = Math.max(currentPage - SIBLING_COUNT, 1);
    const rightSibling = Math.min(currentPage + SIBLING_COUNT, totalPages);

    if (leftSibling > 2) {
      pages.push("...");
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i);
    }

    if (rightSibling < totalPages - 1) {
      pages.push("...");
    }

    // Add first and last pages if not already in the array
    if (pages[0] !== 1 && pages[0] !== "...") {
      pages.unshift(1);
    } else if (pages[0] === "...") {
      pages.unshift(1);
    }

    if (pages[pages.length - 1] !== totalPages && pages[pages.length - 1] !== "...") {
      pages.push(totalPages);
    } else if (pages[pages.length - 1] === "...") {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      </button>

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="pagination-btn ellipsis">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            type="button"
            className={`pagination-btn ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6"></path>
        </svg>
      </button>
    </div>
  );
};

export default Pagination;

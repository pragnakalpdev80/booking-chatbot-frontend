import React from "react";

function Banner({ type = "error", message, style = {} }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div className={`banner banner-${isError ? "error" : "success"}`} style={style}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isError ? (
          <>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </>
        ) : (
          <path d="M5 13l4 4L19 7" />
        )}
      </svg>
      {message}
    </div>
  );
}

export default Banner;

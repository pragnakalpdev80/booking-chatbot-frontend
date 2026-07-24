import React from "react";
import { useLocation } from "react-router-dom";

function TopNavbar() {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/provider/dashboard":
        return "Overview";
      case "/provider/settings":
        return "Provider Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{getPageTitle()}</h1>
      </div>

      <div className="topbar-actions">
        <button
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>

        <div className="user-profile">
          <div className="avatar">D</div>
          <span style={{ fontSize: "0.9rem", fontWeight: "500" }}>Admin</span>
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
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;

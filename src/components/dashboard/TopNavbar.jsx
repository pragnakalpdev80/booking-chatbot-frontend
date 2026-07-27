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
        {/* Placeholder for future topbar actions */}
      </div>
    </header>
  );
}

export default TopNavbar;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppointmentsTable from "../components/dashboard/AppointmentsTable";

const API_BASE = "/api/v1";

function ProviderDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await fetch(`${API_BASE}/dashboard/stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();
        setStats(statsData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="banner banner-error">
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
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="stats-grid">
        <Link
          to="/provider/all-appointments"
          className="card stat-card"
          style={{
            textDecoration: "none",
            color: "inherit",
            transition: "all 0.2s ease",
            display: "flex",
          }}
        >
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <div className="stat-value">{stats?.total || 0}</div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--brand-primary)",
                marginTop: "0.5rem",
                fontWeight: "500",
              }}
            >
              View all →
            </div>
          </div>
          <div
            className="stat-icon"
            style={{ background: "var(--brand-primary-light)", color: "var(--brand-primary)" }}
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
        </Link>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Upcoming</h3>
            <div className="stat-value">{stats?.upcoming || 0}</div>
          </div>
          <div
            className="stat-icon"
            style={{ background: "var(--success-bg)", color: "var(--success)" }}
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
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        </div>

        <Link
          to="/provider/cancelled-appointments"
          className="card stat-card"
          style={{
            textDecoration: "none",
            color: "inherit",
            transition: "all 0.2s ease",
            display: "flex",
          }}
        >
          <div className="stat-info">
            <h3>Cancelled</h3>
            <div className="stat-value">{stats?.cancelled || 0}</div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--danger)",
                marginTop: "0.5rem",
                fontWeight: "500",
              }}
            >
              View all →
            </div>
          </div>
          <div
            className="stat-icon"
            style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
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
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </div>
        </Link>
      </div>

      <AppointmentsTable
        endpoint="/dashboard/appointments/"
        emptyTitle="No Upcoming Appointments"
      />
    </div>
  );
}

export default ProviderDashboard;

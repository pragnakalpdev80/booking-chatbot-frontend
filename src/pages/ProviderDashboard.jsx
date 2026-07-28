import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "/api/v1";
const TODAY = new Date().toISOString().split("T")[0];

function ProviderDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const emailQuery = searchParams.get("email") || "";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await fetch(`${API_BASE}/dashboard/stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!statsRes.ok) throw new Error("Failed to fetch stats");
        const statsData = await statsRes.json();
        setStats(statsData.data);

        // Fetch appointments
        const query = new URLSearchParams();
        if (startDate) query.append("start_date", startDate);
        if (endDate) query.append("end_date", endDate);
        if (emailQuery) query.append("email", emailQuery);

        const apptsRes = await fetch(`${API_BASE}/dashboard/appointments/?${query.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!apptsRes.ok) throw new Error("Failed to fetch appointments");
        const apptsData = await apptsRes.json();
        setAppointments(apptsData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token, startDate, endDate, emailQuery]);

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    if (newStart && endDate) {
      if (new Date(newStart) > new Date(endDate)) {
        setFilterError("Start date cannot be after end date.");
        return;
      }
    }
    setFilterError("");
    setSearchParams((prev) => {
      if (newStart) prev.set("start_date", newStart);
      else prev.delete("start_date");
      return prev;
    });
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    if (startDate && newEnd) {
      if (new Date(startDate) > new Date(newEnd)) {
        setFilterError("End date cannot be before start date.");
        return;
      }
    }
    setFilterError("");
    setSearchParams((prev) => {
      if (newEnd) prev.set("end_date", newEnd);
      else prev.delete("end_date");
      return prev;
    });
  };

  const clearFilters = () => {
    setFilterError("");
    setSearchParams({});
  };

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
        <div
          className="card stat-card"
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          role="button"
          tabIndex={0}
          onClick={() => navigate("/provider/all-appointments")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/provider/all-appointments");
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
        </div>

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

        <div
          className="card stat-card"
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          role="button"
          tabIndex={0}
          onClick={() => navigate("/provider/cancelled-appointments")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/provider/cancelled-appointments");
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
        </div>
      </div>

      {filterError && (
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
          {filterError}
        </div>
      )}

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="form-group" style={{ flex: 1, minWidth: "200px", margin: 0 }}>
            <label htmlFor="emailSearch" className="form-label">
              Search by Email
            </label>
            <input
              id="emailSearch"
              type="email"
              className="form-input"
              placeholder="client@example.com"
              value={emailQuery}
              onChange={(e) =>
                setSearchParams((prev) => {
                  if (e.target.value) {
                    prev.set("email", e.target.value);
                  } else {
                    prev.delete("email");
                  }
                  return prev;
                })
              }
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="startDate" className="form-label">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="form-input"
              min={TODAY}
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="endDate" className="form-label">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className="form-input"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h2 style={{ fontSize: "1.125rem" }}>Upcoming Appointments</h2>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Email</th>
                <th>Date & Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ fontWeight: "500", color: "var(--text-main)" }}>
                        {appt.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "500" }}>
                        {new Date(appt.start_time).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {new Date(appt.start_time).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(appt.end_time).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>{appt.reason || "N/A"}</td>
                    <td>
                      <span className="badge badge-success">Upcoming</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state">
                      <svg
                        width="48"
                        height="48"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <h3>No Upcoming Appointments</h3>
                      <p>There are no upcoming appointments matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProviderDashboard;

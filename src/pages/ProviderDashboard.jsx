import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "/api/v1";

function ProviderDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

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
    return <div className="error-banner">{error}</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div
          className="glass-card stat-card animate-stagger-1"
          style={{ animation: "slideFadeUp 0.4s forwards", opacity: 0 }}
        >
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <div className="stat-value">{stats?.total || 0}</div>
          </div>
          <div className="stat-icon primary">
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

        <div
          className="glass-card stat-card animate-stagger-2"
          style={{ animation: "slideFadeUp 0.4s forwards", opacity: 0 }}
        >
          <div className="stat-info">
            <h3>Upcoming</h3>
            <div className="stat-value">{stats?.upcoming || 0}</div>
          </div>
          <div className="stat-icon success">
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
          className="glass-card stat-card animate-stagger-3"
          style={{ animation: "slideFadeUp 0.4s forwards", opacity: 0 }}
        >
          <div className="stat-info">
            <h3>Cancelled</h3>
            <div className="stat-value">{stats?.cancelled || 0}</div>
          </div>
          <div className="stat-icon danger">
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
        <div className="error-banner" style={{ marginTop: "1.5rem", marginBottom: "0" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {filterError}
        </div>
      )}

      <div
        className="glass-card animate-stagger-4"
        style={{
          padding: "1.5rem",
          marginTop: filterError ? "1rem" : "2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
          animation: "slideFadeUp 0.4s forwards",
          opacity: 0,
        }}
      >
        <div className="form-group" style={{ flex: 1, minWidth: "200px", margin: 0 }}>
          <label
            style={{
              marginBottom: "0.5rem",
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
            }}
          >
            Search by Email
          </label>
          <input
            type="email"
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
          <label
            style={{
              marginBottom: "0.5rem",
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
            }}
          >
            Start Date
          </label>
          <input type="date" value={startDate} onChange={handleStartDateChange} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label
            style={{
              marginBottom: "0.5rem",
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
            }}
          >
            End Date
          </label>
          <input type="date" value={endDate} onChange={handleEndDateChange} />
        </div>
        <button className="btn-secondary" onClick={clearFilters}>
          Clear
        </button>
      </div>

      <div
        className="glass-card animate-stagger-5"
        style={{
          padding: "1.5rem",
          marginTop: "1rem",
          animation: "slideFadeUp 0.4s forwards",
          opacity: 0,
        }}
      >
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Confirmed Appointments</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Email</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <strong>{appt.email}</strong>
                    </td>
                    <td>{new Date(appt.start_time).toLocaleString()}</td>
                    <td>{new Date(appt.end_time).toLocaleTimeString()}</td>
                    <td>{appt.reason || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
                    No appointments found.
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

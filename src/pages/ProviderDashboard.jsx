import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "/api/v1";

function ProviderDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

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
        const apptsRes = await fetch(`${API_BASE}/dashboard/appointments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!apptsRes.ok) throw new Error("Failed to fetch appointments");
        const apptsData = await apptsRes.json();
        setAppointments(apptsData.data.appointments || []);
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
    return <div className="error-banner">{error}</div>;
  }

  return (
    <div>
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <div className="stat-value">{stats?.total_bookings || 0}</div>
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

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Upcoming</h3>
            <div className="stat-value">{stats?.upcoming_bookings || 0}</div>
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

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Cancelled</h3>
            <div className="stat-value">{stats?.cancelled_bookings || 0}</div>
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

      <div className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>Recent Appointments</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client Email</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Reason</th>
                <th>Status</th>
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
                    <td>
                      <span className={`badge ${appt.status.toLowerCase()}`}>{appt.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
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

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Pagination from "../components/dashboard/Pagination";

const API_BASE = "/api/v1";

function CancelledAppointments() {
  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const emailQuery = searchParams.get("email") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (startDate) query.append("start_date", startDate);
        if (endDate) query.append("end_date", endDate);
        if (emailQuery) query.append("email", emailQuery);
        query.append("page", currentPage.toString());

        const res = await fetch(
          `${API_BASE}/dashboard/appointments/cancelled/?${query.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          if (res.status === 404) {
            setData({ count: 0, results: [] });
            return;
          }
          throw new Error("Failed to fetch cancelled appointments");
        }

        const json = await res.json();
        setData({ count: json.count || 0, results: json.data || [] });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAppointments();
    }
  }, [token, startDate, endDate, emailQuery, currentPage]);

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
      prev.delete("page");
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
      prev.delete("page");
      return prev;
    });
  };

  const handleEmailSearch = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      if (val) prev.set("email", val);
      else prev.delete("email");
      prev.delete("page");
      return prev;
    });
  };

  const clearFilters = () => {
    setFilterError("");
    setSearchParams({});
  };

  const handlePageChange = (pageNumber) => {
    setSearchParams((prev) => {
      prev.set("page", pageNumber.toString());
      return prev;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Cancelled Appointments</h1>
        <p style={{ color: "var(--text-secondary)" }}>View all past cancelled bookings.</p>
      </div>

      {filterError && (
        <div className="banner banner-error" style={{ marginBottom: "1rem" }}>
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

      <div className="card" style={{ marginBottom: "1.5rem" }}>
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
              onChange={handleEmailSearch}
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
        {error ? (
          <div className="banner banner-error" style={{ margin: "1.5rem" }}>
            {error}
          </div>
        ) : loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div
              className="typing-dot"
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                background: "var(--brand-primary)",
                animationDuration: "1s",
              }}
            ></div>
            <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>
              Loading appointments...
            </p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client Email</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {data.results.length > 0 ? (
                    data.results.map((appt) => (
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
                        <td>
                          <span className="badge badge-danger">Cancelled</span>
                        </td>
                        <td>{appt.reason || "N/A"}</td>
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
                          <h3>No Cancelled Appointments</h3>
                          <p>No cancelled appointments match your current filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data.count > 0 && (
              <div
                style={{
                  padding: "1.5rem",
                  borderTop: "1px solid var(--border-light)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  Showing <strong>{data.results.length}</strong> of <strong>{data.count}</strong>{" "}
                  results
                </div>
                <Pagination
                  count={data.count}
                  pageSize={10}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CancelledAppointments;

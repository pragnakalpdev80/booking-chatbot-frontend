import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "/api/v1";

export default function ProviderSelector() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(`${API_BASE}/accounts/providers/`);
        if (!response.ok) throw new Error("Failed to load providers");
        const json = await response.json();
        setProviders(json.data || []);
      } catch (err) {
        console.error("Provider fetch error:", err);
        setError("Could not load available providers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  if (loading) {
    return (
      <div
        className="selector-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
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
            Loading available providers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="selector-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div className="card" style={{ maxWidth: "500px", textAlign: "center" }}>
          <svg
            style={{
              width: "48px",
              height: "48px",
              color: "var(--danger)",
              margin: "0 auto 1rem auto",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <h2 style={{ marginBottom: "0.5rem" }}>Unable to load providers</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)", position: "relative" }}>
      <div style={{ position: "absolute", top: "1.5rem", right: "2rem", zIndex: 10 }}>
        <Link to="/provider/login" className="btn btn-secondary">
          Provider Login
        </Link>
      </div>

      <div className="selector-container">
        <div className="selector-header">
          <h1>Who would you like to see?</h1>
          <p>Select a provider to view their calendar and book an appointment instantly.</p>
        </div>

        {providers.length === 0 ? (
          <div className="empty-state card">
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--slate-300)", marginBottom: "1rem" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
            <h3>No providers available</h3>
            <p>There are currently no active providers accepting bookings.</p>
          </div>
        ) : (
          <div className="provider-grid">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                className="provider-card"
                onClick={() => {
                  navigate(`/${provider.slug}/chat`);
                }}
                aria-label={`Select ${provider.name}`}
                style={{ border: "1px solid var(--border-light)", background: "var(--bg-surface)" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    width: "100%",
                  }}
                >
                  <div className="provider-avatar">{provider.name.charAt(0).toUpperCase()}</div>
                  <div style={{ color: "var(--slate-300)" }}>
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: "1.25rem",
                    color: "var(--text-main)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {provider.name}
                </h3>

                {provider.specialty && (
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--brand-primary)",
                      fontWeight: "500",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {provider.specialty}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

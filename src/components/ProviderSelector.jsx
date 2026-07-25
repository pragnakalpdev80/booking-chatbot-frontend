import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
        setError("Could not load available doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "var(--bg-app)",
    padding: "2rem",
  };

  const cardStyle = {
    background: "var(--bg-surface)",
    padding: "2rem",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-lg)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "var(--text-main)",
    marginBottom: "0.5rem",
  };

  const subtitleStyle = {
    color: "var(--text-secondary)",
    marginBottom: "2rem",
    fontSize: "1rem",
  };

  const providerButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "1rem 1.25rem",
    marginBottom: "1rem",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "var(--transition-fast)",
    boxShadow: "var(--shadow-sm)",
  };

  const avatarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--brand-primary)",
    color: "var(--text-inverse)",
    fontSize: "1.25rem",
    fontWeight: "600",
    marginRight: "1rem",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ color: "var(--text-secondary)" }}>Loading available doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ color: "var(--danger)", fontWeight: "500" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Appointment Booking System</h1>
        <p style={subtitleStyle}>Select a provider to start scheduling your visit.</p>

        <div style={{ marginTop: "1.5rem" }}>
          {providers.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No providers are currently available.</p>
          ) : (
            providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  sessionStorage.setItem("selectedProvider", provider.id);
                  navigate("/chat");
                }}
                style={providerButtonStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-primary)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                }}
                aria-label={`Select ${provider.name}`}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={avatarStyle}>{provider.name.charAt(0).toUpperCase()}</div>
                  <div style={{ textAlign: "left" }}>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "var(--text-main)",
                        margin: 0,
                      }}
                    >
                      {provider.name}
                    </h3>
                    {provider.specialty && (
                      <p
                        style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}
                      >
                        {provider.specialty}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ color: "var(--text-sidebar)" }}>➔</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

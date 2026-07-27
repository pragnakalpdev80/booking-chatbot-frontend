import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = "/api/v1";

function ProviderLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      login(data.access, data.refresh);
      navigate("/provider/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>Appointment Booking.</h1>
        <p>The modern, AI-driven scheduling platform for busy professionals.</p>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>

          {error && (
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
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={isLoading}
            >
              {isLoading ? <span>Signing In...</span> : <span>Sign In</span>}
            </button>

            <div
              style={{
                textAlign: "center",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                marginTop: "1.5rem",
              }}
            >
              Don't have a provider account?{" "}
              <Link
                to="/provider/register"
                style={{ color: "var(--brand-primary)", textDecoration: "none", fontWeight: "600" }}
              >
                Register here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProviderLogin;

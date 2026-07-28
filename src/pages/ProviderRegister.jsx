import React, { useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "/api/v1";

function ProviderRegister() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/accounts/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Registration failed.";
        if (data.data) {
          const key = Object.keys(data.data)[0];
          errorMessage = `${key}: ${data.data[key][0]}`;
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/provider/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Provider Registration"
      subtitle="Create a new provider account."
      error={error}
      success={success}
    >
      <form onSubmit={handleRegister}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="first_name" className="form-label">
              First Name
            </label>
            <input
              id="first_name"
              type="text"
              className="form-input"
              placeholder="Jane"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="last_name" className="form-label">
              Last Name
            </label>
            <input
              id="last_name"
              type="text"
              className="form-input"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            placeholder="janedoe"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password2" className="form-label">
            Confirm Password
          </label>
          <input
            id="password2"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={formData.password2}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "0.5rem" }}
          disabled={isLoading}
        >
          {isLoading ? <span>Registering...</span> : <span>Register</span>}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            marginTop: "1.5rem",
          }}
        >
          Already have a provider account?{" "}
          <Link
            to="/provider/login"
            style={{ color: "var(--brand-primary)", textDecoration: "none", fontWeight: "600" }}
          >
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ProviderRegister;

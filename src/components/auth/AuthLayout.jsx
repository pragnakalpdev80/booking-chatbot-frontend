import React from "react";

function AuthLayout({ title, subtitle, error, success, children }) {
  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <h1>Appointment Booking.</h1>
        <p>The modern, AI-driven scheduling platform for busy professionals.</p>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>{title}</h2>
          <p>{subtitle}</p>

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

          {success && (
            <div className="banner banner-success">
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

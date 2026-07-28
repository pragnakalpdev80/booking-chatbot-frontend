import React from "react";
import Banner from "../Banner";

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

          <Banner type="error" message={error} />
          <Banner type="success" message={success} />

          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

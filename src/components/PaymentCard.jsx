import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const API_BASE = "/api/v1";

const TERMINAL_STATES = new Set(["paid", "failed", "expired"]);

const PaymentCard = ({ orderId, onReply, disabled }) => {
  const [status, setStatus] = useState("created");
  const [amount, setAmount] = useState(0);
  const [booking, setBooking] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/payments/orders/${orderId}/status/`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data;
        setStatus(data.status);
        setAmount((data.amount_paise ?? 0) / 100);
        if (data.booking) setBooking(data.booking);

        // Stop polling once we reach a terminal state
        if (TERMINAL_STATES.has(data.status) && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (err) {
        console.error("Error polling payment status:", err);
      }
    };

    pollStatus();
    intervalRef.current = setInterval(pollStatus, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  const cardStyle = {
    padding: "1rem",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return "—";
    try {
      return new Date(isoStr).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  // ── PAID ─────────────────────────────────────────────────────────────────────
  if (status === "paid") {
    return (
      <div className="card" style={{ ...cardStyle, borderColor: "rgba(16, 185, 129, 0.4)" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}
        >
          <span style={{ fontSize: "1.5rem" }}>✅</span>
          <h4 style={{ margin: 0, fontWeight: "700", color: "var(--success)", fontSize: "1rem" }}>
            Booking Confirmed!
          </h4>
        </div>
        {booking && (
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <div>
              <strong>📅 Start:</strong> {formatDateTime(booking.start_time)}
            </div>
            <div>
              <strong>⏰ End:</strong> {formatDateTime(booking.end_time)}
            </div>
            {booking.reason && (
              <div>
                <strong>📝 Reason:</strong> {booking.reason}
              </div>
            )}
          </div>
        )}
        {onReply && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", fontSize: "0.875rem", padding: "0.5rem" }}
              onClick={() =>
                onReply(
                  "I have completed the payment. The booking is already confirmed. Please just acknowledge this and ask if I need help with anything else.",
                  true
                )
              }
              disabled={disabled}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── FAILED / EXPIRED ──────────────────────────────────────────────────────────
  if (status === "failed" || status === "expired") {
    return (
      <div className="card" style={{ ...cardStyle, borderColor: "rgba(239, 68, 68, 0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.5rem" }}>❌</span>
          <span style={{ fontWeight: "600", color: "var(--danger)", fontSize: "0.95rem" }}>
            Payment {status === "failed" ? "Failed" : "Expired"}. Please try booking again.
          </span>
        </div>
        {onReply && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", fontSize: "0.875rem", padding: "0.5rem" }}
              onClick={() =>
                onReply(`My payment ${status}. I would like to try again or do something else.`)
              }
              disabled={disabled}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── CREATED (awaiting payment) ────────────────────────────────────────────────
  return (
    <div className="card" style={cardStyle}>
      <h4
        style={{
          fontWeight: "600",
          fontSize: "1.125rem",
          color: "var(--text-main)",
          marginBottom: "0.5rem",
        }}
      >
        Complete Your Booking
      </h4>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
        Please pay the booking fee to secure your appointment.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Fee:</span>
        <span style={{ fontSize: "1.125rem", fontWeight: "700", color: "var(--text-main)" }}>
          ₹{amount.toFixed(2)}
        </span>
      </div>

      <Link
        to={`/mock-pay/${orderId}`}
        className="btn btn-primary"
        style={{ width: "100%", textDecoration: "none" }}
        aria-label="Pay Now"
      >
        Pay Now
      </Link>
    </div>
  );
};

export default PaymentCard;

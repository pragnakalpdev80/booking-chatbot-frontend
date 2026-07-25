import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function MockPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState("loading"); // loading | confirm | processing | success | failed
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    fetch(`/api/v1/payments/orders/${orderId}/status/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200 || data.status === "success" || data.data) {
          setOrderDetails(data.data);
          setStage("confirm");
        } else {
          setStage("failed");
        }
      })
      .catch((err) => {
        console.error("Order fetch error:", err);
        setStage("failed");
      });
  }, [orderId]);

  const handleWebhook = async (status) => {
    setStage("processing");
    const event = status === "success" ? "payment.captured" : "payment.failed";
    const reason = status === "failed" ? "User cancelled payment" : "";

    try {
      const response = await fetch("/api/v1/payments/webhook/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          order_id: orderId,
          payment_id: `mock_pay_${Date.now()}`,
          signature: "mock_sig_valid",
          reason,
        }),
      });

      if (!response.ok) throw new Error("Webhook failed");
      setStage(status);
    } catch (error) {
      console.error(error);
      setStage("failed");
    }
  };

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
    padding: "2.5rem",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-lg)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "var(--text-main)",
    marginBottom: "1.5rem",
  };

  const textStyle = {
    color: "var(--text-secondary)",
    marginBottom: "1rem",
    fontSize: "1rem",
  };

  const amountStyle = {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "var(--brand-primary)",
    marginBottom: "2rem",
  };

  const btnPrimary = {
    width: "100%",
    padding: "0.875rem 1.5rem",
    backgroundColor: "var(--success)",
    color: "var(--text-inverse)",
    fontWeight: "600",
    fontSize: "1rem",
    borderRadius: "var(--radius-md)",
    border: "none",
    cursor: "pointer",
    marginBottom: "0.75rem",
    transition: "var(--transition-fast)",
  };

  const btnSecondary = {
    width: "100%",
    padding: "0.875rem 1.5rem",
    backgroundColor: "transparent",
    color: "var(--danger)",
    fontWeight: "600",
    fontSize: "1rem",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--danger)",
    cursor: "pointer",
    transition: "var(--transition-fast)",
  };

  const btnReturn = {
    width: "100%",
    padding: "0.875rem 1.5rem",
    backgroundColor: "var(--brand-primary)",
    color: "var(--text-inverse)",
    fontWeight: "600",
    fontSize: "1rem",
    borderRadius: "var(--radius-md)",
    border: "none",
    cursor: "pointer",
    marginTop: "1.5rem",
  };

  const renderContent = () => {
    if (stage === "loading" || stage === "processing") {
      return (
        <div style={cardStyle}>
          <div style={{ marginBottom: "1.5rem" }}>
            {/* Simple CSS spinner */}
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "4px solid var(--border-light)",
                borderTop: "4px solid var(--brand-primary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
          <p style={textStyle}>
            {stage === "loading" ? "Loading order details..." : "Processing payment..."}
          </p>
        </div>
      );
    }

    if (stage === "success") {
      return (
        <div style={cardStyle}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>✅</span>
          </div>
          <h2 style={titleStyle}>Payment Successful!</h2>
          <p style={textStyle}>Your booking has been confirmed. You can now return to the chat.</p>
          <button style={btnReturn} onClick={() => navigate("/chat")}>
            Return to Chat
          </button>
        </div>
      );
    }

    if (stage === "failed") {
      return (
        <div style={cardStyle}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>❌</span>
          </div>
          <h2 style={titleStyle}>Payment Failed</h2>
          <p style={textStyle}>Unfortunately, your payment could not be processed.</p>
          <button style={btnReturn} onClick={() => navigate("/chat")}>
            Return to Chat
          </button>
        </div>
      );
    }

    // confirm stage
    return (
      <div style={cardStyle}>
        <h2 style={titleStyle}>Confirm Payment</h2>
        <p style={textStyle}>Amount to Pay</p>
        <div style={amountStyle}>₹{(orderDetails?.amount_paise / 100).toFixed(2)}</div>
        <button
          style={btnPrimary}
          onClick={() => handleWebhook("success")}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Confirm Payment
        </button>
        <button
          style={btnSecondary}
          onClick={() => handleWebhook("failed")}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "var(--danger)";
            e.currentTarget.style.color = "var(--text-inverse)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--danger)";
          }}
        >
          Cancel
        </button>
      </div>
    );
  };

  return <div style={containerStyle}>{renderContent()}</div>;
}

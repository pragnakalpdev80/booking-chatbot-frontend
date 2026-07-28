import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi } from "vitest";
import MockPayment from "../pages/MockPayment";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("MockPayment Component", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter initialEntries={["/mock-pay/ord_123"]}>
        <Routes>
          <Route path="/mock-pay/:orderId" element={<MockPayment />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("renders loading state initially", async () => {
    // Return a pending promise so it stays loading
    mockFetch.mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByText("Loading order details...")).toBeInTheDocument();
  });

  it("renders confirm stage after order loaded", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        data: {
          amount_paise: 50000,
        },
      }),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Confirm Payment" })).toBeInTheDocument();
    });

    expect(screen.getByText("₹500.00")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("transitions to success on confirm click", async () => {
    // 1. mock status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        data: { amount_paise: 50000 },
      }),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Confirm Payment" })).toBeInTheDocument();
    });

    // 2. mock webhook fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Click confirm
    const confirmBtn = screen.getByRole("button", { name: "Confirm Payment" });
    fireEvent.click(confirmBtn);

    // Should transition to processing then success
    await waitFor(() => {
      expect(screen.getByText("Payment Successful!")).toBeInTheDocument();
    });

    // Check what was sent to webhook
    const webhookCall = mockFetch.mock.calls[1];
    expect(webhookCall[0]).toContain("/api/v1/payments/webhook/");
    const body = JSON.parse(webhookCall[1].body);
    expect(body.event).toBe("payment.captured");
    expect(body.order_id).toBe("ord_123");
  });

  it("transitions to failed on cancel click", async () => {
    // 1. mock status fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 200,
        data: { amount_paise: 50000 },
      }),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    // 2. mock webhook fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Click cancel
    const cancelBtn = screen.getByText("Cancel", { selector: "button" });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.getByText("Payment Failed")).toBeInTheDocument();
    });

    // Check what was sent to webhook
    const webhookCall = mockFetch.mock.calls[1];
    const body = JSON.parse(webhookCall[1].body);
    expect(body.event).toBe("payment.failed");
    expect(body.order_id).toBe("ord_123");
    expect(body.reason).toBe("User cancelled payment");
  });

  it("handles fetch order error gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
    });
  });
});

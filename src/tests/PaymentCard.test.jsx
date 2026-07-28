import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PaymentCard from "../components/PaymentCard";

describe("PaymentCard Component", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders created state and awaits payment", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { status: "created", amount_paise: 50000, booking: null },
      }),
    });

    render(
      <MemoryRouter>
        <PaymentCard orderId="order_123" onReply={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Complete Your Booking")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("₹500.00")).toBeInTheDocument();
    });
  });

  it("renders paid state directly from initial fetch", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          status: "paid",
          amount_paise: 50000,
          booking: {
            start_time: "2023-10-10T10:00:00Z",
            end_time: "2023-10-10T10:30:00Z",
            reason: "Checkup",
          },
        },
      }),
    });

    const mockOnReply = vi.fn();
    render(
      <MemoryRouter>
        <PaymentCard orderId="order_456" onReply={mockOnReply} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
      expect(screen.getByText(/Checkup/)).toBeInTheDocument();
    });

    const continueBtn = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(continueBtn);
    expect(mockOnReply).toHaveBeenCalled();
  });

  it("renders failed state and calls onReply on continue", async () => {
    const mockOnReply = vi.fn();
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { status: "failed", amount_paise: 50000, booking: null },
      }),
    });

    render(
      <MemoryRouter>
        <PaymentCard orderId="order_789" onReply={mockOnReply} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
    });

    const continueBtn = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(continueBtn);

    expect(mockOnReply).toHaveBeenCalledWith(
      "My payment failed. I would like to try again or do something else."
    );
  });

  it("renders expired state and handles missing booking safely", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { status: "expired", amount_paise: 50000, booking: null },
      }),
    });

    render(
      <MemoryRouter>
        <PaymentCard orderId="order_000" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Payment Expired/i)).toBeInTheDocument();
    });
  });

  it("handles fetch errors gracefully without crashing", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    global.fetch.mockRejectedValue(new Error("Network Error"));

    render(
      <MemoryRouter>
        <PaymentCard orderId="order_err" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error polling payment status:", expect.any(Error));
    });
    consoleSpy.mockRestore();
  });
});

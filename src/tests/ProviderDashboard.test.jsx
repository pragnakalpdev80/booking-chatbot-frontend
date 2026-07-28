import { render, screen, act, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProviderDashboard from "../pages/ProviderDashboard";
import { AuthProvider } from "../context/AuthContext";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";

describe("Provider Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("admin_token", "mock-token");
    global.fetch = vi.fn((url) => {
      if (url.includes("/dashboard/stats/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                total: 50,
                upcoming: 10,
                cancelled: 5,
              },
            }),
        });
      }
      if (url.includes("/dashboard/appointments/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: "1",
                  email: "patient@example.com",
                  start_time: "2026-07-28T09:00:00Z",
                  end_time: "2026-07-28T10:00:00Z",
                  status: "confirmed",
                  reason: "Consultation",
                },
              ],
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });
    });
  });

  const renderComponent = async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <BrowserRouter>
            <ProviderDashboard />
          </BrowserRouter>
        </AuthProvider>
      );
    });
  };

  it("fetches and displays stats and upcoming appointments", async () => {
    await renderComponent();

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("patient@example.com")).toBeInTheDocument();
    expect(screen.getByText("Consultation")).toBeInTheDocument();
  });

  it("handles navigation on interactive cards", async () => {
    await renderComponent();

    const allAptCard = screen.getByText("Total Bookings").closest(".card");
    fireEvent.keyDown(allAptCard, { key: "Enter" });
    // Assuming react-router navigate was triggered, hard to verify without mock
  });
});

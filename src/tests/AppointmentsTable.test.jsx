import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentsTable from "../components/dashboard/AppointmentsTable";
import { AuthProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import React from "react";

const mockData = {
  count: 2,
  data: [
    {
      id: "1",
      email: "client1@example.com",
      start_time: "2026-07-28T09:00:00Z",
      end_time: "2026-07-28T10:00:00Z",
      status: "confirmed",
      reason: "Checkup",
    },
    {
      id: "2",
      email: "client2@example.com",
      start_time: "2026-07-29T14:00:00Z",
      end_time: "2026-07-29T14:30:00Z",
      status: "pending",
      reason: null,
    },
  ],
};

const renderComponent = (props = {}) => {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <AppointmentsTable
          endpoint="/dashboard/appointments/all/"
          title="All Appointments"
          description="View your entire appointment history."
          emptyTitle="No Appointments Found"
          {...props}
        />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe("AppointmentsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("admin_token", "mock-token");
    global.fetch = vi.fn();
    window.scrollTo = vi.fn();
  });

  it("renders loading state initially and then fetches data", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    renderComponent();
    expect(screen.getByText("Loading appointments...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading appointments...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("client1@example.com")).toBeInTheDocument();
    expect(screen.getByText("client2@example.com")).toBeInTheDocument();
    expect(screen.getByText("Checkup")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument(); // For client2's null reason

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/dashboard/appointments/all/?page=1"),
      expect.objectContaining({
        headers: { Authorization: "Bearer mock-token" },
      })
    );
  });

  it("handles 404 response correctly", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading appointments...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("No Appointments Found")).toBeInTheDocument();
  });

  it("handles generic fetch error", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    renderComponent();

    expect(await screen.findByText("Failed to fetch appointments")).toBeInTheDocument();
  });

  it("updates search params on filter changes", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, data: [] }),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading appointments...")).not.toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText("Search by Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // The fetch should be called again with the new query
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("email=test%40example.com"),
        expect.any(Object)
      );
    });

    const clearButton = screen.getByRole("button", { name: "Clear" });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(emailInput.value).toBe("");
    });
  });

  it("validates date ranges", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, data: [] }),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading appointments...")).not.toBeInTheDocument();
    });

    const startInput = screen.getByLabelText("Start Date");
    const endInput = screen.getByLabelText("End Date");

    fireEvent.change(startInput, { target: { value: "2026-07-30" } });
    fireEvent.change(endInput, { target: { value: "2026-07-28" } });

    expect(await screen.findByText("End date cannot be before start date.")).toBeInTheDocument();
  });

  it("sets min attribute on start date to today", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, data: [] }),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Loading appointments...")).not.toBeInTheDocument();
    });

    const startInput = screen.getByLabelText("Start Date");
    const today = new Date().toISOString().split("T")[0];
    expect(startInput).toHaveAttribute("min", today);
  });
});

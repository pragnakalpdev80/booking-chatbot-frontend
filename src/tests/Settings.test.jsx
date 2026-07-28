import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import Settings from "../pages/Settings";
import { AuthProvider } from "../context/AuthContext";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";

describe("Settings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("admin_token", "mock-token");
    global.fetch = vi.fn((url) => {
      if (url.includes("/admin/my-calendars/")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                { id: "primary", summary: "My Calendar" },
                { id: "abc@group.calendar.google.com", summary: "Appointments" },
              ],
            }),
        });
      }
      if (url.includes("/admin/provider-settings/")) {
        if (url.includes("method=PUT")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: "Success" }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                is_google_connected: true,
                provider_name: "Dr. Smith",
                timezone: "Asia/Kolkata",
                slot_duration: 30,
                calendar_id: "primary",
                day_schedules: {
                  0: { is_active: true, start: "09:00", end: "17:00" },
                },
                break_times: [
                  { id: "break1", weekday: 1, start: "12:00", end: "13:00", label: "Lunch" },
                ],
                holidays: [{ id: "hol1", date: "2026-12-25", label: "Christmas" }],
              },
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
    render(
      <AuthProvider>
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      </AuthProvider>
    );
    await waitFor(
      () => {
        expect(screen.queryByText("Loading settings...")).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  };

  it("shows calendar picker when Google is connected", async () => {
    await renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/Booking Calendar/i)).toBeInTheDocument();
    });
    expect(screen.getByText("My Calendar")).toBeInTheDocument();
    expect(screen.getByText("Appointments")).toBeInTheDocument();
  });

  it("updates general settings and saves", async () => {
    global.fetch.mockImplementation((url, options) => {
      // initial fetch settings
      if (
        url.includes("/admin/provider-settings/") &&
        (!options || options.method === "GET" || !options.method)
      ) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: {
                is_google_connected: true,
                provider_name: "Old Name",
                timezone: "UTC",
                calendar_id: "primary",
                day_schedules: {},
                break_times: [],
                holidays: [],
              },
            }),
        });
      }
      if (url.includes("/admin/provider-settings/") && options && options.method === "PATCH") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Saved" }) });
      }
      if (url.includes("/admin/my-calendars/")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ data: {} }) });
    });

    await renderComponent();

    // Click General tab
    fireEvent.click(screen.getByRole("button", { name: /General & Schedule/i }));

    const nameInput = screen.getByLabelText("Provider Name");
    fireEvent.change(nameInput, { target: { value: "New Dr. Name" } });

    // Ensure fetch mock for PUT
    global.fetch.mockImplementation((url, options) => {
      if (options && options.method === "PATCH") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Saved" }) });
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      const putCall = global.fetch.mock.calls.find((call) => call[1] && call[1].method === "PATCH");
      expect(putCall).toBeTruthy();
      expect(JSON.parse(putCall[1].body)).toMatchObject({
        provider_name: "New Dr. Name",
      });
    });
  });

  it("updates schedule and saves", async () => {
    await renderComponent();

    // The first day (Monday) should be loaded as active from our mock
    expect(screen.getByText("Monday")).toBeInTheDocument();

    // Toggle Tuesday (index 1)
    const toggles = screen.getAllByRole("checkbox");
    fireEvent.click(toggles[1]); // Tuesday toggle

    global.fetch.mockImplementation((url, options) => {
      if (options && options.method === "PATCH") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Saved" }) });
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Schedule" }));

    await waitFor(() => {
      const putCall = global.fetch.mock.calls.find((call) => call[1] && call[1].method === "PATCH");
      expect(putCall).toBeTruthy();
      const body = JSON.parse(putCall[1].body);
      expect(body.day_schedules["1"].is_active).toBe(true);
    });
  });

  it("interacts with breaks tab and saves", async () => {
    await renderComponent();

    // Go to breaks tab
    fireEvent.click(screen.getByRole("button", { name: /Break Times/i }));
    expect(screen.getByDisplayValue("Lunch")).toBeInTheDocument();

    // Add Break
    fireEvent.click(screen.getByRole("button", { name: /Add Break/i }));

    global.fetch.mockImplementation((url, options) => {
      if (options && options.method === "PUT") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Saved" }) });
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Break Times" }));

    await waitFor(() => {
      const putCall = global.fetch.mock.calls.find((call) => call[1] && call[1].method === "PUT");
      expect(putCall).toBeTruthy();
      const body = JSON.parse(putCall[1].body);
      expect(body.breaks.length).toBe(2);
    });

    // Remove Break
    const removeBtns = screen.getAllByTitle("Remove Break");
    fireEvent.click(removeBtns[0]); // Remove the first break

    fireEvent.click(screen.getByRole("button", { name: "Save Break Times" }));
    await waitFor(() => {
      const putCalls = global.fetch.mock.calls.filter(
        (call) => call[1] && call[1].method === "PUT"
      );
      const latestCall = putCalls[putCalls.length - 1];
      const body = JSON.parse(latestCall[1].body);
      expect(body.breaks.length).toBe(1);
    });
  });

  it("interacts with holidays tab and saves", async () => {
    await renderComponent();

    // Go to holidays tab
    fireEvent.click(screen.getByRole("button", { name: /Holidays & Time Off/i }));
    expect(screen.getByDisplayValue("Christmas")).toBeInTheDocument();

    // Add Holiday
    fireEvent.click(screen.getByRole("button", { name: /Add Holiday/i }));

    global.fetch.mockImplementation((url, options) => {
      if (options && options.method === "PUT") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: "Saved" }) });
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Holidays" }));

    await waitFor(() => {
      const putCall = global.fetch.mock.calls.find((call) => call[1] && call[1].method === "PUT");
      expect(putCall).toBeTruthy();
      const body = JSON.parse(putCall[1].body);
      expect(body.holidays.length).toBe(2);
    });

    // Remove Holiday
    const removeBtns = screen.getAllByTitle("Remove Holiday");
    fireEvent.click(removeBtns[0]);

    fireEvent.click(screen.getByRole("button", { name: "Save Holidays" }));
    await waitFor(() => {
      const putCalls = global.fetch.mock.calls.filter(
        (call) => call[1] && call[1].method === "PUT"
      );
      const latestCall = putCalls[putCalls.length - 1];
      const body = JSON.parse(latestCall[1].body);
      expect(body.holidays.length).toBe(1);
    });
  });

  it("handles fetch error during save gracefully", async () => {
    await renderComponent();

    // Override fetch to fail on PATCH
    global.fetch.mockImplementationOnce((url, options) => {
      if (options && options.method === "PATCH") {
        return Promise.reject(new Error("Network Failure"));
      }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    // Test will just ensure it doesn't crash, the UI currently doesn't show an error banner for save, it just console.errors.
    // Wait for the button state to reset
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();
    });
  });

  it("handles fetch error during initial load gracefully", async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error("Network Failure")));
    render(
      <AuthProvider>
        <MemoryRouter>
          <Settings />
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Network Failure/i)).toBeInTheDocument();
    });
  });

  it("handles Connect Google Calendar button click", async () => {
    // Override the GET settings fetch to return is_google_connected: false
    global.fetch.mockImplementation((url) => {
      if (url === "/api/v1/calendar/login/") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ url: "https://accounts.google.com/o/oauth2/auth" }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              is_google_connected: false,
              day_schedules: {},
              break_times: [],
              holidays: [],
            },
          }),
      });
    });

    await renderComponent();

    const connectBtn = screen.getByRole("button", { name: /Connect Google Calendar/i });
    fireEvent.click(connectBtn);

    await waitFor(() => {
      const fetchCalls = global.fetch.mock.calls;
      const connectCall = fetchCalls.find((call) => call[0] === "/api/v1/calendar/login/");
      expect(connectCall).toBeTruthy();
    });
  });
});

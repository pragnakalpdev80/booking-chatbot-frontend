import { render, screen, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Settings from "../pages/Settings";
import { AuthProvider } from "../context/AuthContext";

test("shows calendar picker when Google is connected", async () => {
  global.fetch = (url) => {
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
              day_schedules: {},
              break_times: [],
              holidays: [],
            },
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: {} }),
    });
  };

  localStorage.setItem("admin_token", "test-token");

  await act(async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Settings />
        </BrowserRouter>
      </AuthProvider>
    );
  });

  expect(screen.getByLabelText(/Booking Calendar/i)).toBeInTheDocument();
  expect(screen.getByText("My Calendar")).toBeInTheDocument();
  expect(screen.getByText("Appointments")).toBeInTheDocument();

  localStorage.removeItem("admin_token");
});

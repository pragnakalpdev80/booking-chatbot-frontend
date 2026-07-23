import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "../pages/AdminDashboard";
import { AuthProvider } from "../context/AuthContext";

test("renders and interacts with AdminDashboard", async () => {
  global.fetch = (url) => {
    if (url.includes("/calendar/events/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: "1",
              summary: "Test Event",
              start: { dateTime: "2026-07-23T10:00:00Z" },
              end: { dateTime: "2026-07-23T11:00:00Z" },
            },
          ]),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          timezone: "UTC",
          work_days: [1],
          work_start: "09:00",
          work_end: "17:00",
          provider_name: "Dr. Test",
        }),
    });
  };

  localStorage.setItem("admin_token", "test-token");

  await act(async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <AdminDashboard />
        </BrowserRouter>
      </AuthProvider>
    );
  });

  expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();

  // Test updating settings
  const providerInput = await screen.findByLabelText(/Provider Name/i);
  fireEvent.change(providerInput, { target: { value: "Dr. New Name" } });

  const startInput = await screen.findByLabelText(/Work Start Time/i);
  fireEvent.change(startInput, { target: { value: "10:00" } });

  const endInput = await screen.findByLabelText(/Work End Time/i);
  fireEvent.change(endInput, { target: { value: "18:00" } });

  const tzInput = await screen.findByLabelText(/Timezone/i);
  fireEvent.change(tzInput, { target: { value: "America/New_York" } });

  const saveBtn = screen.getByRole("button", { name: /Save Settings/i });
  await act(async () => {
    fireEvent.click(saveBtn);
  });

  // Switch to events tab
  const eventsTab = screen.getByRole("button", { name: /Upcoming Events/i });
  await act(async () => {
    fireEvent.click(eventsTab);
  });

  // Test link calendar
  const linkBtn = screen.getByRole("button", { name: /Link Google Calendar/i });
  await act(async () => {
    fireEvent.click(linkBtn);
  });

  // Test logout
  const logoutBtn = screen.getByRole("button", { name: /Logout/i });
  await act(async () => {
    fireEvent.click(logoutBtn);
  });

  localStorage.removeItem("admin_token");
});

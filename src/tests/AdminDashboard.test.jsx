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
        }),
    });
  };

  // Need a token to bypass login redirect
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

  const eventsTab = screen.getByRole("button", { name: /Upcoming Events/i });

  await act(async () => {
    fireEvent.click(eventsTab);
  });

  localStorage.removeItem("admin_token");
});

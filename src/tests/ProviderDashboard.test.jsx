import { render, screen, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProviderDashboard from "../pages/ProviderDashboard";
import { AuthProvider } from "../context/AuthContext";

test("renders and interacts with ProviderDashboard", async () => {
  global.fetch = (url) => {
    if (url.includes("/dashboard/appointments/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              appointments: [
                {
                  id: "1",
                  email: "test@example.com",
                  start_time: "2026-07-23T10:00:00Z",
                  end_time: "2026-07-23T11:00:00Z",
                  reason: "Consultation",
                  status: "CONFIRMED",
                },
              ],
            },
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            total_bookings: 10,
            upcoming_bookings: 2,
            cancelled_bookings: 1,
          },
        }),
    });
  };

  localStorage.setItem("admin_token", "test-token");

  await act(async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <ProviderDashboard />
        </BrowserRouter>
      </AuthProvider>
    );
  });

  expect(screen.getByText(/Recent Appointments/i)).toBeInTheDocument();
  expect(screen.getByText(/Total Bookings/i)).toBeInTheDocument();

  localStorage.removeItem("admin_token");
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CancelledAppointments from "../pages/CancelledAppointments";
import { AuthProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import React from "react";

const renderComponent = () => {
  localStorage.setItem("admin_token", "mock-token");
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CancelledAppointments />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe("CancelledAppointments", () => {
  it("renders correctly with specific titles", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: "Cancelled Appointments" })).toBeInTheDocument();
    expect(screen.getByText("View all past cancelled bookings.")).toBeInTheDocument();
  });
});

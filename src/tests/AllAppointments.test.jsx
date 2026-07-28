import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AllAppointments from "../pages/AllAppointments";
import { AuthProvider } from "../context/AuthContext";
import { MemoryRouter } from "react-router-dom";
import React from "react";

const renderComponent = () => {
  localStorage.setItem("admin_token", "mock-token");
  return render(
    <AuthProvider>
      <MemoryRouter>
        <AllAppointments />
      </MemoryRouter>
    </AuthProvider>
  );
};

describe("AllAppointments", () => {
  it("renders correctly with specific titles", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: "All Appointments" })).toBeInTheDocument();
    expect(screen.getByText("View your entire appointment history.")).toBeInTheDocument();
  });
});

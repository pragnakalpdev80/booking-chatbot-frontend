import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import * as AuthContext from "../context/AuthContext";

describe("DashboardLayout", () => {
  it("renders Sidebar, TopNavbar, and Outlet content", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ logout: vi.fn() });

    render(
      <MemoryRouter initialEntries={["/dashboard/test"]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="test" element={<div>Test Outlet Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Verify Sidebar renders (using a known text from Sidebar)
    expect(screen.getByText("Booking System")).toBeInTheDocument();

    // Verify TopNavbar renders (using a known text from TopNavbar)
    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    // Verify Outlet renders
    expect(screen.getByText("Test Outlet Content")).toBeInTheDocument();
  });
});

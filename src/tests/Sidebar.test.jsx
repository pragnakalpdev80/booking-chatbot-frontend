import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import * as AuthContext from "../context/AuthContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Sidebar", () => {
  it("renders correctly with navigation links", () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ logout: vi.fn() });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText("Booking System")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("All Appointments")).toBeInTheDocument();
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });

  it("calls logout and navigates on Sign Out click", () => {
    const mockLogout = vi.fn();
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({ logout: mockLogout });

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const signOutBtn = screen.getByText("Sign Out");
    fireEvent.click(signOutBtn);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/provider/login");
  });
});

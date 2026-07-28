import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import TopNavbar from "../components/dashboard/TopNavbar";

describe("TopNavbar", () => {
  it("renders Overview title for /provider/dashboard", () => {
    render(
      <MemoryRouter initialEntries={["/provider/dashboard"]}>
        <TopNavbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders Provider Settings title for /provider/settings", () => {
    render(
      <MemoryRouter initialEntries={["/provider/settings"]}>
        <TopNavbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Provider Settings")).toBeInTheDocument();
  });

  it("renders Dashboard title for other routes", () => {
    render(
      <MemoryRouter initialEntries={["/provider/all-appointments"]}>
        <TopNavbar />
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});

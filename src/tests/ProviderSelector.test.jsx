import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ProviderSelector from "../components/ProviderSelector";

describe("ProviderSelector", () => {
  it("shows loading state while fetching", async () => {
    // Mock a fetch that never resolves for this test
    global.fetch = () => new Promise(() => {});

    render(
      <MemoryRouter>
        <ProviderSelector />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading available providers/i)).toBeInTheDocument();
  });

  it("renders provider cards from API", async () => {
    global.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: "Dr. Smith", specialty: "Cardiology" },
              { id: 2, name: "Dr. Jones", specialty: "Pediatrics" },
            ],
          }),
      });

    await act(async () => {
      render(
        <MemoryRouter>
          <ProviderSelector />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
    expect(screen.getByText("Cardiology")).toBeInTheDocument();
    expect(screen.getByText("Dr. Jones")).toBeInTheDocument();
  });

  it("navigates on click", async () => {
    global.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 10, name: "Dr. Who", specialty: "Time Travel", slug: "dr-who" }],
          }),
      });

    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<ProviderSelector />} />
            <Route path="/:slug/chat" element={<div>Chat Page Loaded</div>} />
          </Routes>
        </MemoryRouter>
      );
    });

    const button = screen.getByRole("button", { name: /Select Dr. Who/i });
    fireEvent.click(button);

    expect(screen.getByText("Chat Page Loaded")).toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    global.fetch = () => Promise.reject(new Error("Network down"));

    await act(async () => {
      render(
        <MemoryRouter>
          <ProviderSelector />
        </MemoryRouter>
      );
    });

    expect(screen.getByText(/Could not load available providers/i)).toBeInTheDocument();
  });
});

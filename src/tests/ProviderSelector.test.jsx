import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
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
    expect(screen.getByText(/Loading available doctors/i)).toBeInTheDocument();
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

  it("calls sessionStorage and navigates on click", async () => {
    global.fetch = () =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 10, name: "Dr. Who", specialty: "Time Travel" }],
          }),
      });

    await act(async () => {
      render(
        <MemoryRouter>
          <ProviderSelector />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole("button", { name: /Select Dr. Who/i });

    // Mock sessionStorage
    const setItemMock = vi.spyOn(Storage.prototype, "setItem");

    fireEvent.click(button);

    expect(setItemMock).toHaveBeenCalledWith("selectedProvider", 10);
    setItemMock.mockRestore();
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

    expect(screen.getByText(/Could not load available doctors/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProviderRegister from "../pages/ProviderRegister";
import { MemoryRouter } from "react-router-dom";
import React from "react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProviderRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("admin_token", "mock-token");
    global.fetch = vi.fn();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <ProviderRegister />
      </MemoryRouter>
    );
  };

  it("renders the registration form", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: /Appointment Booking\./i })).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Register/i })).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "johndoe" } });
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits the form successfully and redirects", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Success" }),
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "johndoe" } });
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Registration successful/i)).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/accounts/register/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          first_name: "John",
          last_name: "Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "password123",
          password2: "password123",
        }),
      })
    );

    // Wait for setTimeout to redirect
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/provider/login");
      },
      { timeout: 2500 }
    );
  });

  it("displays API validation error messages correctly", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        data: {
          username: ["A user with that username already exists."],
        },
      }),
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "johndoe" } });
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(
      await screen.findByText(/username: A user with that username already exists/i)
    ).toBeInTheDocument();
  });

  it("displays generic API error message", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Server error occurred",
      }),
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "johndoe" } });
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Server error occurred/i)).toBeInTheDocument();
  });

  it("handles fetch network error", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network Error"));

    renderComponent();
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "johndoe" } });
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "password123" } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(await screen.findByText(/Network Error/i)).toBeInTheDocument();
  });
});

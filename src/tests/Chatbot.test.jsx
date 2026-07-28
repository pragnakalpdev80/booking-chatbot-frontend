import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Chatbot from "../pages/Chatbot";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import React from "react";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Chatbot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("admin_token", "mock-token");
    sessionStorage.clear();
    global.fetch = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/chat/dr-smith"]}>
        <Routes>
          <Route path="/chat/:providerSlug" element={<Chatbot />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("fetches provider data on mount and establishes session", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { id: "prov123", session_key: "sess123" },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { session_key: "sess123", greeting: "Hello from Dr. Smith" },
        }),
      });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Booking Assistant")).toBeInTheDocument();
    });

    expect(await screen.findByText("Hello from Dr. Smith")).toBeInTheDocument();
    expect(sessionStorage.getItem("sessionKey")).toBe("sess123");
  });

  it("handles provider load failure gracefully", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network Error"));
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("Could not connect to the server. Is Django running?")
      ).toBeInTheDocument();
    });
  });

  it("sends message and handles successful response", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "prov123" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { session_key: "sess123" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { response: "I can help with that." } }),
      });

    renderComponent();
    await waitFor(() => expect(screen.getByText("Booking Assistant")).toBeInTheDocument());

    const input = screen.getByPlaceholderText("Ask me to book an appointment...");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Hello")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("I can help with that.")).toBeInTheDocument();
    });
  });

  it("handles empty message submission", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "prov123" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { session_key: "sess123" } }),
      });

    renderComponent();
    await waitFor(() => expect(screen.getByText("Booking Assistant")).toBeInTheDocument());

    expect(global.fetch).toHaveBeenCalledTimes(2); // provider + session

    const input = screen.getByPlaceholderText("Ask me to book an appointment...");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(global.fetch).toHaveBeenCalledTimes(2); // not called again
  });

  it("sends quick reply successfully", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "prov123" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            session_key: "sess123",
            greeting_options: [
              { label: "Book Appointment", value: "I'd like to book an appointment." },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { response: "Sure, let's book." } }),
      });

    renderComponent();
    await waitFor(() => expect(screen.getByText("Booking Assistant")).toBeInTheDocument());

    const quickReply = await screen.findByText("Book Appointment");
    fireEvent.click(quickReply);

    expect(screen.getByText("I'd like to book an appointment.")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Sure, let's book.")).toBeInTheDocument();
    });
  });

  it("handles message send failure gracefully", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "prov123" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            session_key: "sess123",
            greeting_options: [
              { label: "Book Appointment", value: "I'd like to book an appointment." },
            ],
          },
        }),
      })
      .mockRejectedValueOnce(new Error("Send Failed"));

    renderComponent();
    await waitFor(() => expect(screen.getByText("Booking Assistant")).toBeInTheDocument());

    const quickReply = await screen.findByText("Book Appointment");
    fireEvent.click(quickReply);

    await waitFor(() => {
      expect(screen.getByText(/Sorry, I encountered an error/)).toBeInTheDocument();
    });
  });

  it("closes chat when close button is clicked", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: "prov123" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { session_key: "sess123" } }),
      });

    renderComponent();
    await waitFor(() => expect(screen.getByText("Booking Assistant")).toBeInTheDocument());

    const closeBtn = screen.getByTitle("Close Chat");
    fireEvent.click(closeBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

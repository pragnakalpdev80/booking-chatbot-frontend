import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Chatbot from "../pages/Chatbot";

test("renders and interacts with Chatbot", async () => {
  sessionStorage.clear();

  window.HTMLElement.prototype.scrollIntoView = function () {};

  global.fetch = vi.fn((url) => {
    if (url.includes("/chat/provider/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { id: 1, name: "Dr. Mock", slug: "dr-mock", specialty: "Tests" },
          }),
      });
    }
    if (url.includes("/providers/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1, name: "Dr. Mock", slug: "dr-mock", specialty: "Tests" }],
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          data: {
            session_key: "fake-session",
            response: "Reply message",
          },
        }),
    });
  });

  await act(async () => {
    render(
      <MemoryRouter initialEntries={["/dr-mock/chat"]}>
        <Routes>
          <Route path="/:providerSlug/chat" element={<Chatbot />} />
        </Routes>
      </MemoryRouter>
    );
  });

  // 1. Now the chat UI should be visible
  expect(await screen.findByText(/Booking Assistant/i)).toBeInTheDocument();

  // Test input
  const input = screen.getByPlaceholderText(/Ask me to book an appointment/i);
  fireEvent.change(input, { target: { value: "Hello" } });

  // Test sending message
  const sendBtn = screen.getByRole("button", { name: /Send message/i });
  await act(async () => {
    fireEvent.click(sendBtn);
  });
});

import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Chatbot from "../pages/Chatbot";

test("renders and interacts with Chatbot", async () => {
  window.HTMLElement.prototype.scrollIntoView = function () {};

  global.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ session_key: "fake-session" }),
    });

  await act(async () => {
    render(
      <BrowserRouter>
        <Chatbot />
      </BrowserRouter>
    );
  });

  expect(screen.getByText(/Scheduling Bot/i)).toBeInTheDocument();

  // Test input
  const input = screen.getByPlaceholderText(/Ask for an appointment.../i);
  fireEvent.change(input, { target: { value: "Hello" } });
});

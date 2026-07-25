import { render, act } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";

test("renders App without crashing", async () => {
  window.HTMLElement.prototype.scrollIntoView = function () {};

  global.fetch = vi.fn((url) => {
    if (url && url.includes("/providers/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 1, name: "Dr. Mock", specialty: "Tests" }],
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { session_key: "fake-session" } }),
    });
  });

  await act(async () => {
    render(<App />);
  });
});

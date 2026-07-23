import { render, act } from "@testing-library/react";
import App from "../App";

test("renders App without crashing", async () => {
  window.HTMLElement.prototype.scrollIntoView = function () {};

  global.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ session_key: "fake-session" }),
    });

  await act(async () => {
    render(<App />);
  });
});

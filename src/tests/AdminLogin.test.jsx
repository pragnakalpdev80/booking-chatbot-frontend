import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin";
import { AuthProvider } from "../context/AuthContext";

test("renders and submits AdminLogin", async () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    </AuthProvider>
  );
  expect(screen.getByRole("heading", { name: /Admin Portal/i })).toBeInTheDocument();

  const user = screen.getByLabelText(/Username/i);
  const pass = screen.getByLabelText(/Password/i);
  const btn = screen.getByRole("button", { name: /Log In/i });

  fireEvent.change(user, { target: { value: "admin" } });
  fireEvent.change(pass, { target: { value: "password" } });

  // Mock fetch
  global.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ access: "fake-token" }),
    });

  fireEvent.click(btn);
});

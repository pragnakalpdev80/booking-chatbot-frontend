import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProviderLogin from "../pages/ProviderLogin";
import { AuthProvider } from "../context/AuthContext";

test("renders and submits ProviderLogin", async () => {
  await act(async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <ProviderLogin />
        </BrowserRouter>
      </AuthProvider>
    );
  });

  expect(screen.getByRole("heading", { name: /Welcome Back/i })).toBeInTheDocument();

  const user = screen.getByLabelText(/Username/i);
  const pass = screen.getByLabelText(/Password/i);
  const btn = screen.getByRole("button", { name: /Sign In/i });

  await act(async () => {
    fireEvent.change(user, { target: { value: "admin" } });
    fireEvent.change(pass, { target: { value: "password" } });
  });

  // Mock fetch
  global.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ access: "fake-token" }),
    });

  await act(async () => {
    fireEvent.click(btn);
  });
});

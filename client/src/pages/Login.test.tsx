import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Provider } from "jotai";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { loginRequest } from "@/auth/authApi";
import { ApiError } from "@/lib/api";
import { authAtom } from "@/store/auth";
import { Login } from "./Login";

vi.mock("@/auth/authApi", () => ({
  loginRequest: vi.fn(),
}));

const mockedLoginRequest = vi.mocked(loginRequest);

function renderLogin() {
  const store = createStore();

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/register" element={<div>Register page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return { store };
}

describe("Login", () => {
  it("shows a validation error under each empty required field when submitted", async () => {
    renderLogin();

    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(mockedLoginRequest).not.toHaveBeenCalled();
  });

  it("logs in and redirects to the home page on valid submit", async () => {
    mockedLoginRequest.mockResolvedValueOnce({
      user: { id: "1", email: "user@example.com" },
    });
    const { store } = renderLogin();

    await userEvent.type(screen.getByLabelText("Email *"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password *"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Home page")).toBeInTheDocument();
    expect(store.get(authAtom)).toEqual({ email: "user@example.com" });
  });

  it("shows the server's error message and stays on the page when login fails", async () => {
    mockedLoginRequest.mockRejectedValueOnce(new ApiError(401, "Invalid email or password."));
    renderLogin();

    await userEvent.type(screen.getByLabelText("Email *"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password *"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).not.toBeDisabled();
  });

  it("links to the register page", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
  });
});

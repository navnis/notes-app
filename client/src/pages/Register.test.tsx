import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Provider } from "jotai";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { registerRequest } from "@/api/auth";
import { ApiError } from "@/lib/api";
import { authAtom } from "@/store/auth";
import { Register } from "./Register";

vi.mock("@/api/auth", () => ({
  registerRequest: vi.fn(),
}));

const mockedRegisterRequest = vi.mocked(registerRequest);

function renderRegister() {
  const store = createStore();

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return { store };
}

describe("Register", () => {
  it("shows a validation error under each empty required field when submitted", async () => {
    renderRegister();

    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();
    expect(mockedRegisterRequest).not.toHaveBeenCalled();
  });

  it("shows an error when the password is too short", async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText("Email *"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password *"), "short");
    await userEvent.type(screen.getByLabelText("Confirm password *"), "short");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  it("shows an error when passwords don't match", async () => {
    renderRegister();

    await userEvent.type(screen.getByLabelText("Email *"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password *"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm password *"), "password456");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
  });

  it("registers and redirects to the home page on valid submit", async () => {
    mockedRegisterRequest.mockResolvedValueOnce({
      user: { id: "1", email: "user@example.com" },
    });
    const { store } = renderRegister();

    await userEvent.type(screen.getByLabelText("Email *"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password *"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm password *"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Home page")).toBeInTheDocument();
    expect(store.get(authAtom)).toEqual({ email: "user@example.com" });
  });

  it("shows the server's error message when the email is already taken", async () => {
    mockedRegisterRequest.mockRejectedValueOnce(
      new ApiError(409, "An account with this email already exists."),
    );
    renderRegister();

    await userEvent.type(screen.getByLabelText("Email *"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password *"), "password123");
    await userEvent.type(screen.getByLabelText("Confirm password *"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("An account with this email already exists."),
    ).toBeInTheDocument();
  });

  it("links to the login page", () => {
    renderRegister();
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });
});

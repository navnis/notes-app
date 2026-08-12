import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createStore, Provider } from "jotai";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logoutRequest } from "@/auth/authApi";
import { Toaster } from "@/components";
import { __resetToastStoreForTests } from "@/components/Toast/toastStore";
import { authAtom } from "@/store/auth";
import { LogoutButton } from "./LogoutButton";

vi.mock("@/auth/authApi", () => ({
  logoutRequest: vi.fn(),
}));

const mockedLogoutRequest = vi.mocked(logoutRequest);

function renderLogoutButton() {
  const store = createStore();
  store.set(authAtom, { email: "user@example.com" });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<LogoutButton />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </Provider>,
  );

  return { store };
}

describe("LogoutButton", () => {
  beforeEach(() => {
    __resetToastStoreForTests();
  });

  it("renders a log out button", () => {
    mockedLogoutRequest.mockResolvedValue(undefined);
    renderLogoutButton();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("clears the session and redirects to /login when clicked", async () => {
    mockedLogoutRequest.mockResolvedValue(undefined);
    const { store } = renderLogoutButton();

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(store.get(authAtom)).toBeNull();
    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("still logs out locally and shows a toast when the server-side revoke fails", async () => {
    mockedLogoutRequest.mockRejectedValue(new Error("network down"));
    const { store } = renderLogoutButton();

    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(store.get(authAtom)).toBeNull();
    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(
      await screen.findByText("Couldn't fully sign out on the server, but you're signed out here."),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { authAtom, sessionRestoredAtom } from "@/store/auth";
import { PrivateRoute } from "./PrivateRoute";

function renderPrivateRoute(store: ReturnType<typeof createStore>) {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<div>Protected content</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("PrivateRoute", () => {
  it("shows a loading state while the session hasn't been restored yet", () => {
    renderPrivateRoute(createStore());

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("redirects to /login once restored, if not authenticated", () => {
    const store = createStore();
    store.set(sessionRestoredAtom, true);
    renderPrivateRoute(store);

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders the protected route once restored, if authenticated", () => {
    const store = createStore();
    store.set(sessionRestoredAtom, true);
    store.set(authAtom, { name: "Rahul", email: "user@example.com" });
    renderPrivateRoute(store);

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});

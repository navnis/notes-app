import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthLayout } from "./AuthLayout";

describe("AuthLayout", () => {
  it("renders the title, children, and footer", () => {
    render(
      <AuthLayout title="Log in" footer={<span>Footer content</span>}>
        <p>Form content</p>
      </AuthLayout>,
    );

    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByText("Form content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });
});

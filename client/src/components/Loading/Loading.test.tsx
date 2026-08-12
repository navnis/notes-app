import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Loading } from "./Loading";

describe("Loading", () => {
  it("has an accessible status role with a default label", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading");
  });

  it("shows a visible label and uses it as the aria-label when given", () => {
    render(<Loading label="Loading notes..." />);
    expect(screen.getByText("Loading notes...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Loading notes...");
  });

  it("shows no visible text when no label is given", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});

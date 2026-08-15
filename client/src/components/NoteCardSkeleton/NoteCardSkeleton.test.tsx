import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NoteCardSkeleton } from "./NoteCardSkeleton";

describe("NoteCardSkeleton", () => {
  it("renders a status placeholder", () => {
    render(<NoteCardSkeleton />);
    expect(screen.getByRole("status", { name: "Loading note" })).toBeInTheDocument();
  });
});

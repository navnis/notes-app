import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteCard } from "./NoteCard";

const TAGS = ["frontend", "backend", "api"];

describe("NoteCard", () => {
  it("renders the emoji, title and preview", () => {
    render(
      <NoteCard
        id="note-1"
        emoji="🚀"
        title="System Design Notes"
        preview="Some notes about system design."
        tags={[]}
        updatedAt={new Date()}
      />,
    );
    expect(screen.getByText("System Design Notes")).toBeInTheDocument();
    expect(screen.getByText("Some notes about system design.")).toBeInTheDocument();
    expect(screen.getByText("🚀")).toBeInTheDocument();
  });

  it("shows only the first two tags plus an overflow count", () => {
    render(<NoteCard id="note-1" title="Note" tags={TAGS} updatedAt={new Date()} />);
    expect(screen.getByText("#frontend")).toBeInTheDocument();
    expect(screen.getByText("#backend")).toBeInTheDocument();
    expect(screen.queryByText("#api")).not.toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("calls onClick with its own id when clicked", async () => {
    const onClick = vi.fn();
    render(<NoteCard id="note-1" title="Note" tags={[]} updatedAt={new Date()} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: /Note/ }));
    expect(onClick).toHaveBeenCalledWith("note-1");
  });

  it("formats updatedAt as a relative time", () => {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
    render(<NoteCard id="note-1" title="Note" tags={[]} updatedAt={twentyMinutesAgo} />);
    expect(screen.getByText("20m ago")).toBeInTheDocument();
  });

  it("accepts updatedAt as a raw ISO string", () => {
    const isoString = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    render(<NoteCard id="note-1" title="Note" tags={[]} updatedAt={isoString} />);
    expect(screen.getByText("1h ago")).toBeInTheDocument();
  });
});

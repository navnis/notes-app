import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteList } from "./NoteList";
import type { NoteListItem } from "./types";

const NOTES: NoteListItem[] = [
  {
    id: "1",
    title: "Zebra Notes",
    preview: "About zebras",
    tags: [{ id: "t1", name: "animals" }],
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Alpha Notes",
    preview: "About the alphabet",
    tags: [{ id: "t2", name: "language" }],
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
];

describe("NoteList", () => {
  it("renders all notes and the total count", () => {
    render(<NoteList notes={NOTES} onSelectNote={vi.fn()} />);
    expect(screen.getByText("Zebra Notes")).toBeInTheDocument();
    expect(screen.getByText("Alpha Notes")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("filters notes by search query", async () => {
    render(<NoteList notes={NOTES} onSelectNote={vi.fn()} />);
    await userEvent.type(screen.getByRole("textbox", { name: /search notes/i }), "zebra");
    expect(screen.getByText("Zebra Notes")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Notes")).not.toBeInTheDocument();
  });

  it("focuses the search input when '/' is pressed", async () => {
    render(<NoteList notes={NOTES} onSelectNote={vi.fn()} />);
    const search = screen.getByRole("textbox", { name: /search notes/i });
    expect(search).not.toHaveFocus();
    await userEvent.keyboard("/");
    expect(search).toHaveFocus();
  });

  it("calls onSelectNote when a note is clicked", async () => {
    const onSelectNote = vi.fn();
    render(<NoteList notes={NOTES} onSelectNote={onSelectNote} />);
    await userEvent.click(screen.getByRole("button", { name: /Alpha Notes/ }));
    expect(onSelectNote).toHaveBeenCalledWith("2");
  });

  it("sorts notes by title when that sort option is chosen", async () => {
    render(<NoteList notes={NOTES} onSelectNote={vi.fn()} />);
    await userEvent.click(screen.getByRole("combobox", { name: /sort by/i }));
    await userEvent.click(screen.getByRole("option", { name: "Title" }));

    const cards = screen.getAllByRole("button");
    const cardOrder = cards.map((card) => card.textContent).filter((text) => text?.includes("Notes"));
    expect(cardOrder[0]).toContain("Alpha Notes");
    expect(cardOrder[1]).toContain("Zebra Notes");
  });
});

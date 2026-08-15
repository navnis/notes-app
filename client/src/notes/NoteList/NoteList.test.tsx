import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NoteList } from "./NoteList";
import type { NoteListProps } from "./NoteList";
import type { NoteListItem } from "./types";
import { SEARCH_DEBOUNCE_MS, SKELETON_COUNT } from "./NoteList.constants";

const NOTES: NoteListItem[] = [
  {
    id: "1",
    title: "Zebra Notes",
    preview: "About zebras",
    tags: ["animals"],
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Alpha Notes",
    preview: "About the alphabet",
    tags: ["language"],
    updatedAt: new Date(Date.now() - 10 * 60 * 1000),
  },
];

const BASE_PROPS: NoteListProps = {
  notes: NOTES,
  totalCount: NOTES.length,
  onSelectNote: vi.fn(),
  search: "",
  onSearchChange: vi.fn(),
  sortBy: "updatedAt",
  onSortByChange: vi.fn(),
};

function renderList(overrides: Partial<NoteListProps> = {}) {
  return render(<NoteList {...BASE_PROPS} {...overrides} />);
}

describe("NoteList", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all notes and the total count", () => {
    renderList();
    expect(screen.getByText("Zebra Notes")).toBeInTheDocument();
    expect(screen.getByText("Alpha Notes")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("defaults the heading to All Notes, and reflects the active view when given one", () => {
    const { rerender } = renderList();
    expect(screen.getByText("All Notes")).toBeInTheDocument();

    rerender(<NoteList {...BASE_PROPS} heading="Pinned" />);
    expect(screen.getByText("Pinned")).toBeInTheDocument();
    expect(screen.queryByText("All Notes")).not.toBeInTheDocument();
  });

  it("reports the debounced search value via onSearchChange", async () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    renderList({ onSearchChange });

    fireEvent.change(screen.getByRole("textbox", { name: /search notes/i }), {
      target: { value: "zebra" },
    });
    expect(onSearchChange).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS);
    });
    expect(onSearchChange).toHaveBeenCalledWith("zebra");
  });

  it("focuses the search input when '/' is pressed", async () => {
    renderList();
    const search = screen.getByRole("textbox", { name: /search notes/i });
    expect(search).not.toHaveFocus();
    await userEvent.keyboard("/");
    expect(search).toHaveFocus();
  });

  it("calls onSelectNote when a note is clicked", async () => {
    const onSelectNote = vi.fn();
    renderList({ onSelectNote });
    await userEvent.click(screen.getByRole("button", { name: /Alpha Notes/ }));
    expect(onSelectNote).toHaveBeenCalledWith("2");
  });

  it("calls onSortByChange when a sort option is chosen", async () => {
    const onSortByChange = vi.fn();
    renderList({ onSortByChange });
    await userEvent.click(screen.getByRole("combobox", { name: /sort by/i }));
    await userEvent.click(screen.getByRole("option", { name: "Title" }));
    expect(onSortByChange).toHaveBeenCalledWith("title");
  });

  it("shows the no-notes empty state when there are no notes and no active search", () => {
    renderList({ notes: [], totalCount: 0 });
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
  });

  it("shows the no-results empty state when a search yields nothing", () => {
    renderList({ notes: [], totalCount: 0, search: "nothing matches" });
    expect(screen.getByText("No notes match your search")).toBeInTheDocument();
  });

  it("shows a loading spinner at the bottom while fetching the next page", () => {
    renderList({ hasMore: true, isFetchingMore: true, onLoadMore: vi.fn() });
    expect(screen.getByLabelText("Loading more notes")).toBeInTheDocument();
  });

  it("shows skeleton placeholders instead of notes while loading", () => {
    renderList({ isLoading: true });
    expect(screen.getAllByRole("status", { name: "Loading note" })).toHaveLength(SKELETON_COUNT);
    expect(screen.queryByText("Zebra Notes")).not.toBeInTheDocument();
  });
});

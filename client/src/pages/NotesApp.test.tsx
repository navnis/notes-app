import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { createNoteRequest, listNotesRequest, updateNoteRequest } from "@/api/notes";
import { listTagsRequest } from "@/api/tags";
import { NotesApp } from "./NotesApp";

vi.mock("@/api/notes", () => ({
  listNotesRequest: vi.fn(),
  createNoteRequest: vi.fn(),
  updateNoteRequest: vi.fn(),
  deleteNoteRequest: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/api/tags", () => ({
  listTagsRequest: vi.fn(),
}));

const mockedListNotes = vi.mocked(listNotesRequest);
const mockedCreateNote = vi.mocked(createNoteRequest);
const mockedUpdateNote = vi.mocked(updateNoteRequest);
const mockedListTags = vi.mocked(listTagsRequest);

function renderNotesApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotesApp />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("NotesApp", () => {
  // Tests that simulate going offline dispatch a real "offline" window event — reset it
  // back to online after every test so that state doesn't leak into the next one.
  afterEach(() => {
    window.dispatchEvent(new Event("online"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockedListNotes.mockResolvedValue({
      notes: [],
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false,
      allNotesCount: 0,
      favoritesCount: 0,
      pinnedCount: 0,
    });
    mockedListTags.mockResolvedValue([]);
    mockedCreateNote.mockResolvedValue({
      id: "new-note",
      title: "Untitled Note",
      content: "",
      tags: [],
      isFavorite: false,
      isPinned: false,
      pinnedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  // Cmd+N is reserved by the browser on Mac and never reaches page JS —
  // only Ctrl+N is wired up as the global "new note" shortcut.
  it("creates a note on Ctrl+N", async () => {
    renderNotesApp();
    await waitFor(() => expect(mockedListNotes).toHaveBeenCalled());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n", ctrlKey: true }));

    await waitFor(() => expect(mockedCreateNote).toHaveBeenCalledTimes(1));
  });

  it("does not create a note on Cmd+N alone (browser-reserved, not our shortcut)", async () => {
    renderNotesApp();
    await waitFor(() => expect(mockedListNotes).toHaveBeenCalled());

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n", metaKey: true }));

    expect(mockedCreateNote).not.toHaveBeenCalled();
  });

  it("toggles preview mode on Ctrl+P when a note is open", async () => {
    mockedListNotes.mockResolvedValue({
      notes: [
        {
          id: "note-1",
          title: "First",
          content: "hello",
          tags: [],
          isFavorite: false,
          isPinned: false,
          pinnedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      hasMore: false,
      allNotesCount: 1,
      favoritesCount: 0,
      pinnedCount: 0,
    });
    renderNotesApp();
    await userEvent.click(await screen.findByRole("button", { name: /First/ }));
    await screen.findByLabelText("Note content");

    // Ctrl+P swaps the editable textarea for the read-only markdown preview.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "p", ctrlKey: true }));
    await waitFor(() => expect(screen.queryByLabelText("Note content")).not.toBeInTheDocument());
  });

  it("disables the editor when the browser goes offline, and re-enables it when back online", async () => {
    mockedListNotes.mockResolvedValue({
      notes: [
        {
          id: "note-1",
          title: "First",
          content: "hello",
          tags: [],
          isFavorite: false,
          isPinned: false,
          pinnedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      hasMore: false,
      allNotesCount: 1,
      favoritesCount: 0,
      pinnedCount: 0,
    });
    renderNotesApp();
    await userEvent.click(await screen.findByRole("button", { name: /First/ }));
    await screen.findByLabelText("Note content");
    expect(screen.getByLabelText("Note content")).not.toBeDisabled();

    act(() => window.dispatchEvent(new Event("offline")));
    expect(screen.getByLabelText("Note content")).toBeDisabled();

    act(() => window.dispatchEvent(new Event("online")));
    expect(screen.getByLabelText("Note content")).not.toBeDisabled();
  });

  it("shows the empty state when there are no notes", async () => {
    renderNotesApp();
    expect(await screen.findByText("No notes yet")).toBeInTheDocument();
  });

  it("keeps All Notes' count stable when switching to a view with a smaller/zero count", async () => {
    mockedListNotes.mockResolvedValue({
      notes: [],
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false,
      allNotesCount: 3,
      favoritesCount: 0,
      pinnedCount: 1,
    });
    renderNotesApp();
    await waitFor(() => expect(screen.getByRole("button", { name: /All Notes/ })).toHaveTextContent("3"));

    await userEvent.click(screen.getByRole("button", { name: /Favorites/ }));

    // All Notes' own count must not be affected by switching to a different, unrelated view.
    expect(screen.getByRole("button", { name: /All Notes/ })).toHaveTextContent("3");
  });

  it("shows the active view's label as the list heading", async () => {
    renderNotesApp();
    await waitFor(() => expect(mockedListNotes).toHaveBeenCalled());

    await userEvent.click(screen.getByRole("button", { name: /Pinned/ }));
    expect(await screen.findByRole("heading", { name: /Pinned/ })).toBeInTheDocument();
  });

  it("keeps a note's favorited state after switching selection away and back (cache, not just the overlay, must be patched)", async () => {
    const baseNote = (id: string, title: string) => ({
      id,
      title,
      content: "hello",
      tags: [],
      isFavorite: false,
      isPinned: false,
      pinnedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockedListNotes.mockResolvedValue({
      notes: [baseNote("note-1", "First"), baseNote("note-2", "Second")],
      page: 1,
      limit: 10,
      total: 2,
      hasMore: false,
      allNotesCount: 2,
      favoritesCount: 0,
      pinnedCount: 0,
    });
    mockedUpdateNote.mockResolvedValue({ ...baseNote("note-1", "First"), isFavorite: true });

    renderNotesApp();
    await userEvent.click(await screen.findByRole("button", { name: /First/ }));
    await userEvent.click(screen.getByLabelText("Add to favorites"));
    await waitFor(() => expect(mockedUpdateNote).toHaveBeenCalledWith("note-1", { isFavorite: true }));

    // Switch away to the other note, then back — the favorited state must survive this round-trip.
    await userEvent.click(screen.getByRole("button", { name: /Second/ }));
    await userEvent.click(screen.getByRole("button", { name: /First/ }));

    expect(screen.getByLabelText("Remove from favorites")).toHaveAttribute("aria-pressed", "true");
  });

  it("moves a pinned note to the top of the list immediately, before the request resolves", async () => {
    const baseNote = (id: string, title: string) => ({
      id,
      title,
      content: "hello",
      tags: [],
      isFavorite: false,
      isPinned: false,
      pinnedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockedListNotes.mockResolvedValue({
      notes: [baseNote("note-1", "First"), baseNote("note-2", "Second")],
      page: 1,
      limit: 10,
      total: 2,
      hasMore: false,
      allNotesCount: 2,
      favoritesCount: 0,
      pinnedCount: 0,
    });
    // Never resolves within this test — proves the reorder happens before any server confirmation.
    mockedUpdateNote.mockReturnValue(new Promise(() => {}));

    renderNotesApp();
    await userEvent.click(await screen.findByRole("button", { name: /Second/ }));
    await userEvent.click(screen.getByLabelText("Pin note"));

    const cardTitles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(cardTitles[0]).toContain("Second");
  });

  it("reverts a pin toggle (including its position in the list) if the request fails", async () => {
    // Distinct, deterministic updatedAt values — First sorts above Second by default (Recently Updated).
    const baseNote = (id: string, title: string, updatedAt: string) => ({
      id,
      title,
      content: "hello",
      tags: [],
      isFavorite: false,
      isPinned: false,
      pinnedAt: null,
      createdAt: updatedAt,
      updatedAt,
    });
    mockedListNotes.mockResolvedValue({
      notes: [
        baseNote("note-1", "First", "2026-01-02T00:00:00.000Z"),
        baseNote("note-2", "Second", "2026-01-01T00:00:00.000Z"),
      ],
      page: 1,
      limit: 10,
      total: 2,
      hasMore: false,
      allNotesCount: 2,
      favoritesCount: 0,
      pinnedCount: 0,
    });
    mockedUpdateNote.mockRejectedValue(new Error("Server exploded"));

    renderNotesApp();
    await userEvent.click(await screen.findByRole("button", { name: /Second/ }));
    await userEvent.click(screen.getByLabelText("Pin note"));

    await waitFor(() => expect(mockedUpdateNote).toHaveBeenCalled());
    await waitFor(() => {
      const cardTitles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
      expect(cardTitles[0]).toContain("First");
    });
  });
});

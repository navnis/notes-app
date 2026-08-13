import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createNoteRequest, listNotesRequest } from "@/api/notes";
import { listTagsRequest } from "@/api/tags";
import { NotesApp } from "./NotesApp";

vi.mock("@/api/notes", () => ({
  listNotesRequest: vi.fn(),
  createNoteRequest: vi.fn(),
  updateNoteRequest: vi.fn(),
  deleteNoteRequest: vi.fn(),
}));
vi.mock("@/api/tags", () => ({
  listTagsRequest: vi.fn(),
}));

const mockedListNotes = vi.mocked(listNotesRequest);
const mockedCreateNote = vi.mocked(createNoteRequest);
const mockedListTags = vi.mocked(listTagsRequest);

function renderNotesApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotesApp />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("NotesApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedListNotes.mockResolvedValue({ notes: [], page: 1, limit: 10, total: 0, hasMore: false });
    mockedListTags.mockResolvedValue([]);
    mockedCreateNote.mockResolvedValue({
      id: "new-note",
      title: "Untitled Note",
      content: "",
      tags: [],
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

  it("shows the empty state when there are no notes", async () => {
    renderNotesApp();
    expect(await screen.findByText("No notes yet")).toBeInTheDocument();
  });
});

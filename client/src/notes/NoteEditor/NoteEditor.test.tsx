import type { ReactElement } from "react";
import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateNoteRequest } from "@/api/notes";
import { toast } from "@/components";
import { ApiError } from "@/lib/api";
import { NoteEditor } from "./NoteEditor";
import type { NoteEditorProps } from "./NoteEditor";
import { AUTOSAVE_DEBOUNCE_MS } from "./NoteEditor.constants";

vi.mock("@/api/notes", () => ({
  updateNoteRequest: vi.fn(),
}));

const mockedUpdateNoteRequest = vi.mocked(updateNoteRequest);

const TAGS = [{ id: "1", name: "frontend" }];

const BASE_PROPS: NoteEditorProps = {
  noteId: "note-1",
  title: "My Note",
  onTitleChange: vi.fn(),
  value: "hello",
  onChange: vi.fn(),
  preview: false,
  onPreviewChange: vi.fn(),
  onDelete: vi.fn(),
  tags: TAGS,
  onAddTag: vi.fn(),
  onRemoveTag: vi.fn(),
  createdAt: new Date("2026-01-01T10:00:00"),
  updatedAt: new Date("2026-01-02T12:00:00"),
};

let queryClient: QueryClient;

function wrap(node: ReactElement) {
  return <QueryClientProvider client={queryClient}>{node}</QueryClientProvider>;
}

function renderEditor(overrides: Partial<NoteEditorProps> = {}) {
  const utils = render(wrap(<NoteEditor {...BASE_PROPS} {...overrides} />));
  return {
    ...utils,
    rerenderEditor: (nextOverrides: Partial<NoteEditorProps>) =>
      utils.rerender(wrap(<NoteEditor {...BASE_PROPS} {...overrides} {...nextOverrides} />)),
  };
}

describe("NoteEditor", () => {
  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    mockedUpdateNoteRequest.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders the markdown editor with the given value", () => {
    renderEditor({ value: "hello world" });
    expect(screen.getByLabelText("Note content")).toHaveValue("hello world");
  });

  it("renders the title and calls onTitleChange when edited", async () => {
    const onTitleChange = vi.fn();
    renderEditor({ title: "Original title", onTitleChange });
    const titleInput = screen.getByLabelText("Note title");
    expect(titleInput).toHaveValue("Original title");
    await userEvent.type(titleInput, "!");
    expect(onTitleChange).toHaveBeenCalledWith("Original title!");
  });

  it("calls onPreviewChange when switching tabs", async () => {
    const onPreviewChange = vi.fn();
    renderEditor({ onPreviewChange });
    await userEvent.click(screen.getByRole("button", { name: "Preview" }));
    expect(onPreviewChange).toHaveBeenCalledWith(true);
  });

  it("shows Saved by default and does not autosave on mount", () => {
    renderEditor();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(mockedUpdateNoteRequest).not.toHaveBeenCalled();
  });

  it("does not autosave just from switching to a different note", () => {
    vi.useFakeTimers();
    const { rerenderEditor } = renderEditor({ noteId: "note-1", title: "First", value: "one" });

    rerenderEditor({ noteId: "note-2", title: "Second", value: "two" });
    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS + 100);
    });

    expect(mockedUpdateNoteRequest).not.toHaveBeenCalled();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("debounces edits, autosaves, and reports Saving/Saved status", async () => {
    vi.useFakeTimers();
    mockedUpdateNoteRequest.mockResolvedValue({
      id: "note-1",
      title: "My Note",
      content: "new content",
      createdAt: "2026-01-01T10:00:00.000Z",
      updatedAt: "2026-01-03T09:00:00.000Z",
    });
    const onSaved = vi.fn();
    const { rerenderEditor } = renderEditor({ onSaved });

    rerenderEditor({ onSaved, value: "new content" });
    expect(screen.getByText("Saving…")).toBeInTheDocument();
    expect(mockedUpdateNoteRequest).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    });

    expect(mockedUpdateNoteRequest).toHaveBeenCalledExactlyOnceWith("note-1", {
      title: "My Note",
      content: "new content",
    });
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it("shows Failed to save and toasts an error when autosave fails", async () => {
    vi.useFakeTimers();
    mockedUpdateNoteRequest.mockRejectedValue(new ApiError(500, "Server exploded"));
    const errorSpy = vi.spyOn(toast, "error").mockImplementation(() => "toast-id");
    const { rerenderEditor } = renderEditor();

    rerenderEditor({ value: "new content" });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
    });

    expect(screen.getByText("Failed to save")).toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalledWith("Server exploded");
  });

  it("renders tags and calls onRemoveTag", async () => {
    const onRemoveTag = vi.fn();
    renderEditor({ onRemoveTag });
    expect(screen.getByText("#frontend")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemoveTag).toHaveBeenCalledWith("1");
  });

  it("adds a tag when typing in the input and pressing Enter", async () => {
    const onAddTag = vi.fn();
    renderEditor({ onAddTag });
    const input = screen.getByLabelText("Add tag");
    await userEvent.type(input, "backend{Enter}");
    expect(onAddTag).toHaveBeenCalledWith("backend");
    expect(input).toHaveValue("");
  });

  it("does not add a duplicate tag (case-insensitive) and shows an error toast instead", async () => {
    const onAddTag = vi.fn();
    const errorSpy = vi.spyOn(toast, "error").mockImplementation(() => "toast-id");
    renderEditor({ onAddTag, tags: [{ id: "1", name: "frontend" }] });

    const input = screen.getByLabelText("Add tag");
    await userEvent.type(input, "Frontend{Enter}");

    expect(onAddTag).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("");
  });

  it("shows the created/updated timestamps", () => {
    renderEditor({
      createdAt: new Date("2026-01-01T10:00:00"),
      updatedAt: new Date("2026-01-02T12:00:00"),
    });
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it("confirms before calling onDelete", async () => {
    const onDelete = vi.fn();
    renderEditor({ onDelete });

    await userEvent.click(screen.getByRole("button", { name: "Delete note" }));
    expect(screen.getByText("Delete note?")).toBeVisible();
    expect(onDelete).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("controlled: content changes flow through onChange", async () => {
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <QueryClientProvider client={queryClient}>
          <NoteEditor
            noteId="note-1"
            title="My Note"
            onTitleChange={vi.fn()}
            value={value}
            onChange={setValue}
            preview={false}
            onPreviewChange={vi.fn()}
            onDelete={vi.fn()}
            tags={[]}
            onAddTag={vi.fn()}
            onRemoveTag={vi.fn()}
            createdAt={new Date()}
            updatedAt={new Date()}
          />
        </QueryClientProvider>
      );
    }
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText("Note content"), "hi");
    expect(screen.getByLabelText("Note content")).toHaveValue("hi");
  });
});

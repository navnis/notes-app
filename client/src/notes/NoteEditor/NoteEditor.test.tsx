import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { toast } from "@/components";
import { NoteEditor } from "./NoteEditor";
import type { NoteEditorProps } from "./NoteEditor";

const TAGS = [{ id: "1", name: "frontend" }];

function renderEditor(overrides: Partial<NoteEditorProps> = {}) {
  return render(
    <NoteEditor
      title="My Note"
      onTitleChange={vi.fn()}
      value="hello"
      onChange={vi.fn()}
      preview={false}
      onPreviewChange={vi.fn()}
      onDelete={vi.fn()}
      tags={TAGS}
      onAddTag={vi.fn()}
      onRemoveTag={vi.fn()}
      createdAt={new Date("2026-01-01T10:00:00")}
      updatedAt={new Date("2026-01-02T12:00:00")}
      {...overrides}
    />,
  );
}

describe("NoteEditor", () => {
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

  it("shows the Saved indicator only when saved is true", () => {
    const { rerender } = renderEditor({ saved: false });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();

    rerender(
      <NoteEditor
        title="My Note"
        onTitleChange={vi.fn()}
        value="hello"
        onChange={vi.fn()}
        preview={false}
        onPreviewChange={vi.fn()}
        onDelete={vi.fn()}
        tags={TAGS}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        createdAt={new Date()}
        updatedAt={new Date()}
        saved
      />,
    );
    expect(screen.getByText("Saved")).toBeInTheDocument();
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
        <NoteEditor
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
      );
    }
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText("Note content"), "hi");
    expect(screen.getByLabelText("Note content")).toHaveValue("hi");
  });
});

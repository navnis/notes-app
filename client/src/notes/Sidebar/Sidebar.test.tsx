import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

const TAGS = [
  { id: "1", name: "frontend", count: 2 },
  { id: "2", name: "backend", count: 1 },
];

function renderSidebar(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  return render(
    <Sidebar
      allNotesCount={3}
      trashCount={0}
      activeView="notes"
      onViewChange={vi.fn()}
      tags={TAGS}
      onNewNote={vi.fn()}
      {...overrides}
    />,
  );
}

describe("Sidebar", () => {
  it("renders the app name, view counts and tags", () => {
    renderSidebar({ appName: "My Notes" });
    expect(screen.getByText("My Notes")).toBeInTheDocument();
    expect(screen.getByText("All Notes")).toBeInTheDocument();
    expect(screen.getByText("Trash")).toBeInTheDocument();
    expect(screen.getByText("#frontend")).toBeInTheDocument();
    expect(screen.getByText("#backend")).toBeInTheDocument();
  });

  it("calls onNewNote when the New Note button is clicked", async () => {
    const onNewNote = vi.fn();
    renderSidebar({ onNewNote });
    await userEvent.click(screen.getByRole("button", { name: /new note/i }));
    expect(onNewNote).toHaveBeenCalledTimes(1);
  });

  it("calls onViewChange with the clicked view", async () => {
    const onViewChange = vi.fn();
    renderSidebar({ onViewChange });
    await userEvent.click(screen.getByRole("button", { name: /trash/i }));
    expect(onViewChange).toHaveBeenCalledWith("trash");
  });

  it("selects a tag on click and deselects it on a second click", async () => {
    const onTagSelect = vi.fn();
    renderSidebar({ onTagSelect, selectedTagId: null });
    await userEvent.click(screen.getByRole("button", { name: /frontend/ }));
    expect(onTagSelect).toHaveBeenCalledWith("1");

    onTagSelect.mockClear();
    renderSidebar({ onTagSelect, selectedTagId: "1" });
    await userEvent.click(screen.getAllByRole("button", { name: /frontend/ })[1]);
    expect(onTagSelect).toHaveBeenCalledWith(null);
  });

  it("shows Synced or Offline based on the synced prop", () => {
    const { rerender } = renderSidebar({ synced: true });
    expect(screen.getByText("Synced")).toBeInTheDocument();

    rerender(
      <Sidebar
        allNotesCount={3}
        trashCount={0}
        activeView="notes"
        onViewChange={vi.fn()}
        tags={TAGS}
        onNewNote={vi.fn()}
        synced={false}
      />,
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });
});

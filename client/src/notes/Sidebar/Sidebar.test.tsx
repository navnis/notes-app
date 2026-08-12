import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

vi.mock("@/api/auth", () => ({
  logoutRequest: vi.fn().mockResolvedValue(undefined),
}));

const TAGS = [
  { id: "1", name: "frontend", count: 2 },
  { id: "2", name: "backend", count: 1 },
];

function renderSidebar(overrides: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  return render(
    <MemoryRouter>
      <Sidebar
        allNotesCount={3}
        trashCount={0}
        activeView="notes"
        onViewChange={vi.fn()}
        tags={TAGS}
        onNewNote={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>,
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

  it("renders a log out button at the bottom", () => {
    renderSidebar();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });
});

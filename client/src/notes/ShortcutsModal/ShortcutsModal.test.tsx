import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ShortcutsModal } from "./ShortcutsModal";

describe("ShortcutsModal", () => {
  it("lists all supported shortcuts when open", () => {
    render(<ShortcutsModal open onClose={vi.fn()} />);
    expect(screen.getByText("Create New Note")).toBeVisible();
    expect(screen.getByText("Ctrl+N")).toBeVisible();
    expect(screen.getByText("Focus Search")).toBeVisible();
    expect(screen.getByText("Toggle Preview")).toBeVisible();
    expect(screen.getByText("Ctrl+P")).toBeVisible();
  });

  it("calls onClose when dismissed", async () => {
    const onClose = vi.fn();
    render(<ShortcutsModal open onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});

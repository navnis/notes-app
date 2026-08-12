import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("is not visible when open is false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Delete note?">
        content
      </Modal>,
    );
    expect(screen.queryByText("Delete note?")).not.toBeVisible();
  });

  it("shows the title and description when open", () => {
    render(
      <Modal open onClose={vi.fn()} title="Delete note?" description="This can't be undone.">
        content
      </Modal>,
    );
    expect(screen.getByText("Delete note?")).toBeVisible();
    expect(screen.getByText("This can't be undone.")).toBeVisible();
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Delete note?">
        content
      </Modal>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders children instead of the default footer when given", () => {
    render(
      <Modal open onClose={vi.fn()} title="Delete note?" onConfirm={vi.fn()}>
        <button type="button">Custom action</button>
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Custom action" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm" })).not.toBeInTheDocument();
  });

  it("renders a default Cancel/Confirm footer when onConfirm is given and no children", () => {
    render(<Modal open onClose={vi.fn()} title="Delete note?" onConfirm={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("supports custom confirm/cancel labels", () => {
    render(
      <Modal
        open
        onClose={vi.fn()}
        title="Delete note?"
        onConfirm={vi.fn()}
        confirmLabel="Delete"
        cancelLabel="Keep it"
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep it" })).toBeInTheDocument();
  });

  it("calls onConfirm when the confirm button is clicked, and onClose (not onConfirm) when cancel is clicked", async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <Modal open onClose={onClose} title="Delete note?" onConfirm={onConfirm} confirmLabel="Delete" />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

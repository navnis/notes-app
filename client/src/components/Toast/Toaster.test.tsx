import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toaster } from "./Toaster";
import { toast, __resetToastStoreForTests } from "./toastStore";

describe("Toaster", () => {
  beforeEach(() => {
    __resetToastStoreForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when there are no toasts", () => {
    render(<Toaster />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a success toast, announced politely", () => {
    render(<Toaster />);
    act(() => {
      toast.success("Note deleted");
    });
    expect(screen.getByRole("status")).toHaveTextContent("Note deleted");
  });

  it("shows an error toast, announced assertively", () => {
    render(<Toaster />);
    act(() => {
      toast.error("Failed to save");
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to save");
  });

  it("dismisses a toast when its close button is clicked", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Note deleted");
    });
    expect(screen.getByText("Note deleted")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Note deleted")).not.toBeInTheDocument();
  });

  it("auto-dismisses after its duration elapses", () => {
    vi.useFakeTimers();
    render(<Toaster />);
    act(() => {
      toast.success("Note deleted");
    });
    expect(screen.getByText("Note deleted")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText("Note deleted")).not.toBeInTheDocument();
  });

  it("stacks multiple toasts", () => {
    render(<Toaster />);
    act(() => {
      toast.success("First");
      toast.error("Second");
    });
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileText } from "lucide-react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title and description", () => {
    render(<EmptyState icon={<FileText />} title="No notes yet" description="Create your first note." />);
    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(screen.getByText("Create your first note.")).toBeInTheDocument();
  });

  it("omits the action button when no actionLabel/onAction is given", () => {
    render(<EmptyState icon={<FileText />} title="No notes yet" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onAction when the action button is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <EmptyState icon={<FileText />} title="No notes yet" actionLabel="+ New Note" onAction={onAction} />,
    );
    await user.click(screen.getByRole("button", { name: "+ New Note" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

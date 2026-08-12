import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders as a plain span with no interaction props", () => {
    render(<Tag>work</Tag>);
    const tag = screen.getByText("work");
    expect(tag.closest("span")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the usage count badge when given", () => {
    render(<Tag count={3}>work</Tag>);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders as a button and calls onClick when clickable", async () => {
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>work</Tag>);
    await userEvent.click(screen.getByRole("button", { name: /work/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders a remove button that calls onRemove without triggering onClick", async () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    render(
      <Tag onClick={onClick} onRemove={onRemove}>
        work
      </Tag>,
    );
    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});

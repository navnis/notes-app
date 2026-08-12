import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./Select";
import type { SelectOption } from "./types";

const sortOptions: SelectOption[] = [
  { value: "updatedAt", label: "Recently updated" },
  { value: "createdAt", label: "Date created" },
  { value: "title", label: "Title" },
];

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    render(<Select aria-label="Sort by" options={sortOptions} placeholder="Choose..." />);
    expect(screen.getByText("Choose...")).toBeInTheDocument();
  });

  it("opens and lists the options", async () => {
    render(<Select aria-label="Sort by" options={sortOptions} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Title" })).toBeInTheDocument();
  });

  it("uncontrolled: selecting an option updates the trigger and calls onChange", async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Sort by" options={sortOptions} onChange={onChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Title" }));

    expect(onChange).toHaveBeenCalledWith("title");
    expect(screen.getByRole("combobox")).toHaveTextContent("Title");
  });

  it("controlled: value stays driven by the parent even after a selection", async () => {
    function Controlled() {
      const [value] = useState("updatedAt");
      return (
        <Select aria-label="Sort by" options={sortOptions} value={value} onChange={vi.fn()} />
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Title" }));

    // Parent never updated `value`, so the trigger still shows the original selection.
    expect(screen.getByRole("combobox")).toHaveTextContent("Recently updated");
  });

  it("controlled: updates when the parent's value prop changes", async () => {
    function Controlled() {
      const [value, setValue] = useState("updatedAt");
      return (
        <Select aria-label="Sort by" options={sortOptions} value={value} onChange={setValue} />
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Title" }));

    expect(screen.getByRole("combobox")).toHaveTextContent("Title");
  });

  it("shows the error message and marks the trigger invalid", () => {
    render(<Select aria-label="Sort by" options={sortOptions} error="Pick a sort order" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Pick a sort order");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });

  it("renders a visible label associated with the trigger", () => {
    render(<Select label="Sort by" options={sortOptions} />);
    expect(screen.getByLabelText("Sort by")).toBe(screen.getByRole("combobox"));
  });
});

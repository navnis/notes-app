import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MarkdownEditor } from "./MarkdownEditor";

function Controlled({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return (
    <MarkdownEditor aria-label="Note" value={value} onChange={(e) => setValue(e.target.value)} />
  );
}

describe("MarkdownEditor", () => {
  it("renders the textarea and accepts typed input", async () => {
    render(<Controlled />);
    const textarea = screen.getByLabelText("Note");
    await userEvent.type(textarea, "hello");
    expect(textarea).toHaveValue("hello");
  });

  it("shows word and char counts based on the value", () => {
    render(<Controlled initialValue="hello world" />);
    expect(screen.getByText("2 words • 11 chars")).toBeInTheDocument();
  });

  it("forwards the ref to the underlying textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor aria-label="Note" value="" onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("shows the error message and marks the field invalid", () => {
    render(<MarkdownEditor aria-label="Note" value="" onChange={() => {}} error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.getByLabelText("Note")).toHaveAttribute("aria-invalid", "true");
  });

  it("renders markdown in preview mode instead of the textarea", () => {
    render(
      <MarkdownEditor aria-label="Note" value="# Heading" onChange={() => {}} preview />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Heading" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Note")).not.toBeInTheDocument();
  });

  it("shows a placeholder message in preview mode when there's nothing to show", () => {
    render(<MarkdownEditor aria-label="Note" value="" onChange={() => {}} preview />);
    expect(screen.getByText("Nothing to preview yet.")).toBeInTheDocument();
  });

  it("bold button wraps the selected text with **", async () => {
    render(<Controlled initialValue="hello world" />);
    const textarea = screen.getByLabelText("Note") as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(0, 5);
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(textarea).toHaveValue("**hello** world");
  });

  it("italic button inserts a placeholder when nothing is selected", async () => {
    render(<Controlled />);
    const textarea = screen.getByLabelText("Note") as HTMLTextAreaElement;
    await userEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(textarea).toHaveValue("_italic text_");
  });

  it("list button continues on a new line instead of stacking prefixes", async () => {
    render(<Controlled initialValue="- item" />);
    const textarea = screen.getByLabelText("Note") as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(6, 6);
    await userEvent.click(screen.getByRole("button", { name: "Bulleted list" }));
    expect(textarea).toHaveValue("- item\n- ");
  });

  it("disables the textarea and every toolbar button when disabled", () => {
    render(<MarkdownEditor aria-label="Note" value="hello" onChange={() => {}} disabled />);
    expect(screen.getByLabelText("Note")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Italic" })).toBeDisabled();
  });
});

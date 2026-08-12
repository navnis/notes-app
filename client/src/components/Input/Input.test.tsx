import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders and accepts typed input", async () => {
    render(<Input aria-label="Search notes" />);
    const input = screen.getByLabelText("Search notes");
    await userEvent.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("renders the given icon", () => {
    render(<Input aria-label="Search" icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders trailing content", () => {
    render(<Input aria-label="Search" trailing={<span data-testid="trailing" />} />);
    expect(screen.getByTestId("trailing")).toBeInTheDocument();
  });

  it("shows the error message and marks the input invalid", () => {
    render(<Input aria-label="Email" error="Enter a valid email" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards the ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input aria-label="Search" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("renders a visible label associated with the input via htmlFor/id", () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText("Email");
    expect(input.tagName).toBe("INPUT");
    expect(screen.getByText("Email").tagName).toBe("LABEL");
  });

  it("associates a visible label even without an explicit id", () => {
    render(<Input label="Email" />);
    const label = screen.getByText("Email");
    const input = screen.getByLabelText("Email");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("shows a required asterisk after the label and sets the native required attribute", () => {
    const { container } = render(<Input label="Email" required />);
    expect(container.querySelector("label")?.textContent).toBe("Email *");
    expect(screen.getByLabelText("Email *")).toBeRequired();
  });

  it("omits the required asterisk when not required", () => {
    const { container } = render(<Input label="Email" />);
    expect(container.querySelector("label")?.textContent).toBe("Email");
    expect(screen.getByLabelText("Email")).not.toBeRequired();
  });

  it("toggles password visibility internally when togglePasswordVisibility is set", async () => {
    render(<Input label="Password" type="password" togglePasswordVisibility />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    await userEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });
});

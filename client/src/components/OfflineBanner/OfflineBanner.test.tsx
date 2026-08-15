import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfflineBanner } from "./OfflineBanner";

describe("OfflineBanner", () => {
  afterEach(() => {
    vi.spyOn(navigator, "onLine", "get").mockRestore();
    // Some tests dispatch a real "offline" window event — reset it so state doesn't leak into other files.
    window.dispatchEvent(new Event("online"));
  });

  it("is hidden while online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    render(<OfflineBanner />);
    expect(screen.queryByText(/Offline Mode Detected/)).not.toBeInTheDocument();
  });

  it("shows the banner when the browser goes offline, and hides it again when back online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    render(<OfflineBanner />);

    act(() => window.dispatchEvent(new Event("offline")));
    expect(screen.getByText(/Offline Mode Detected/)).toBeInTheDocument();

    act(() => window.dispatchEvent(new Event("online")));
    expect(screen.queryByText(/Offline Mode Detected/)).not.toBeInTheDocument();
  });

  it("dismisses the banner on click, and re-shows it next time it goes offline", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    render(<OfflineBanner />);
    expect(screen.getByText(/Offline Mode Detected/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText(/Offline Mode Detected/)).not.toBeInTheDocument();

    act(() => window.dispatchEvent(new Event("online")));
    act(() => window.dispatchEvent(new Event("offline")));
    expect(screen.getByText(/Offline Mode Detected/)).toBeInTheDocument();
  });
});

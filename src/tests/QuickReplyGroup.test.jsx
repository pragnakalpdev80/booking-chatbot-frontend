import { render, screen, fireEvent } from "@testing-library/react";
import QuickReplyGroup from "../components/QuickReplyGroup";
import { describe, it, expect, vi } from "vitest";

describe("QuickReplyGroup", () => {
  it("renders time ranges correctly", () => {
    const mockReply = vi.fn();
    render(<QuickReplyGroup messageContent="Available: 10:00 AM – 10:30 AM" onReply={mockReply} />);
    const btn = screen.getByText("10:00 AM – 10:30 AM");
    expect(btn).toBeInTheDocument();
  });

  it("renders boolean intents correctly", () => {
    const mockReply = vi.fn();
    render(
      <QuickReplyGroup messageContent="Would you like to proceed? Yes or No" onReply={mockReply} />
    );
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("disables buttons when disabled prop is true", () => {
    render(<QuickReplyGroup messageContent="10:00 AM" disabled={true} onReply={vi.fn()} />);
    const btn = screen.getByText("10:00 AM");
    expect(btn).toBeDisabled();
  });

  it("disables buttons immediately after click and calls onReply", () => {
    const mockReply = vi.fn();
    render(<QuickReplyGroup messageContent="10:00 AM" onReply={mockReply} />);
    const btn = screen.getByText("10:00 AM");

    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);

    expect(mockReply).toHaveBeenCalledWith("10:00 AM");
    // Button disables itself optimistically
    expect(btn).toBeDisabled();
  });
});

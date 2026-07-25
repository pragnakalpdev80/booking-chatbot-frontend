import { render, screen, fireEvent } from "@testing-library/react";
import QuickReplyGroup from "../components/QuickReplyGroup";
import { describe, it, expect, vi } from "vitest";

describe("QuickReplyGroup", () => {
  it("renders parsed slots correctly", () => {
    const mockReply = vi.fn();
    render(
      <QuickReplyGroup messageContent="" parsedSlots={["2026-07-27 10:00"]} onReply={mockReply} />
    );
    const btn = screen.getByText("10:00");
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
    render(
      <QuickReplyGroup
        messageContent=""
        parsedSlots={["2026-07-27 10:00"]}
        disabled={true}
        onReply={vi.fn()}
      />
    );
    const btn = screen.getByText("10:00");
    expect(btn).toBeDisabled();
  });

  it("disables buttons immediately after click and calls onReply", () => {
    const mockReply = vi.fn();
    render(
      <QuickReplyGroup messageContent="" parsedSlots={["2026-07-27 10:00"]} onReply={mockReply} />
    );
    const btn = screen.getByText("10:00");

    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);

    expect(mockReply).toHaveBeenCalledWith("2026-07-27 10:00");
    // Button disables itself optimistically
    expect(btn).toBeDisabled();
  });

  it("renders nothing when message contains a [PAY: tag", () => {
    const mockReply = vi.fn();
    const { container } = render(
      <QuickReplyGroup
        messageContent="Your appointment is all set. [PAY:mock_ord_123|http://localhost:5173/mock-pay/mock_ord_123] Reason: Follow-up"
        onReply={mockReply}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});

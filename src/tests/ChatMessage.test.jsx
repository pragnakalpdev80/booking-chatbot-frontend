import { render, screen } from "@testing-library/react";
import ChatMessage from "../components/ChatMessage";

describe("ChatMessage", () => {
  it("renders ChatMessage correctly", () => {
    render(<ChatMessage role="user" content="Hello" />);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
  });

  it("renders markdown correctly", () => {
    render(<ChatMessage role="assistant" content="**bold text**" />);
    const boldEl = screen.getByText(/bold text/i);
    expect(boldEl.tagName).toBe("STRONG");
  });
});

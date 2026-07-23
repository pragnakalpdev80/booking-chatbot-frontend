import { render, screen } from "@testing-library/react";
import ChatMessage from "../components/ChatMessage";

test("renders ChatMessage correctly", () => {
  render(<ChatMessage role="user" content="Hello" />);
  expect(screen.getByText(/Hello/i)).toBeInTheDocument();
});

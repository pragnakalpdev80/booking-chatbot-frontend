import { render } from "@testing-library/react";
import TypingIndicator from "../components/TypingIndicator";

test("renders TypingIndicator", () => {
  const { container } = render(<TypingIndicator />);
  expect(container.firstChild).toHaveClass("message-wrapper");
});

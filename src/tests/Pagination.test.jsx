import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Pagination from "../components/dashboard/Pagination";

describe("Pagination", () => {
  it("renders nothing when count is 0", () => {
    const { container } = render(
      <Pagination count={0} pageSize={10} currentPage={1} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when there is only 1 page", () => {
    const { container } = render(
      <Pagination count={5} pageSize={10} currentPage={1} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders correctly for a small number of pages without ellipses", () => {
    const mockOnPageChange = vi.fn();
    render(<Pagination count={30} pageSize={10} currentPage={1} onPageChange={mockOnPageChange} />);

    // Should have 1, 2, 3 pages and prev/next buttons
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("...")).not.toBeInTheDocument();

    // Previous button should be disabled on page 1
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();

    // Click page 2
    fireEvent.click(screen.getByText("2"));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);

    // Click next button
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it("renders correctly with left and right ellipses", () => {
    const mockOnPageChange = vi.fn();
    render(
      <Pagination count={100} pageSize={10} currentPage={5} onPageChange={mockOnPageChange} />
    );

    // Should show 1, ..., 3, 4, 5, 6, 7, ..., 10
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBe(2);

    // Click previous button
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(mockOnPageChange).toHaveBeenCalledWith(4);
  });

  it("disables next button on the last page", () => {
    const mockOnPageChange = vi.fn();
    render(<Pagination count={50} pageSize={10} currentPage={5} onPageChange={mockOnPageChange} />);

    const buttons = screen.getAllByRole("button");
    // Next button is the last button
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });
});

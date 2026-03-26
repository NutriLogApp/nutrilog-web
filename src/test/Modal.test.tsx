import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "@/components/Modal";

describe("Modal", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("renders children when open", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("returns null when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(container.innerHTML).toBe("");
  });

  it("locks body scroll when open", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll to previous value on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores body scroll when open changes to false", () => {
    const { rerender } = render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender(
      <Modal open={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    await userEvent.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when X button is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>
    );
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("displays the title", () => {
    render(
      <Modal open={true} onClose={() => {}} title="My Title">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NumericInput from "@/components/NumericInput";

describe("NumericInput", () => {
  it("shows the current value", () => {
    const onChange = vi.fn();
    render(<NumericInput value={42} onChange={onChange} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(42);
  });

  it("does not call onChange while typing", () => {
    const onChange = vi.fn();
    render(<NumericInput value={100} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("calls onChange with parsed number on blur", () => {
    const onChange = vi.fn();
    render(<NumericInput value={100} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "150" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(150);
  });

  it("defaults to 0 when blurred empty", () => {
    const onChange = vi.fn();
    render(<NumericInput value={50} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("defaults to min when blurred empty if min is set", () => {
    const onChange = vi.fn();
    render(<NumericInput value={50} onChange={onChange} min={10} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("clamps to max on blur", () => {
    const onChange = vi.fn();
    render(<NumericInput value={50} onChange={onChange} max={100} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "200" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(100);
  });
});

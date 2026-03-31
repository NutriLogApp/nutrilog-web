import { useState, useEffect, useRef, type InputHTMLAttributes } from "react";

interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

export default function NumericInput({ value, onChange, min, max, step, ...rest }: NumericInputProps) {
  const [raw, setRaw] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setRaw(String(value));
    }
  }, [value]);

  function handleBlur() {
    let n = parseFloat(raw);
    if (isNaN(n)) n = min ?? 0;
    if (min !== undefined && n < min) n = min;
    if (max !== undefined && n > max) n = max;
    setRaw(String(n));
    onChange(n);
  }

  function handleFocus() {
    ref.current?.select();
  }

  return (
    <input
      {...rest}
      ref={ref}
      type="number"
      step={step}
      value={raw}
      onChange={(e) => setRaw(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
    />
  );
}

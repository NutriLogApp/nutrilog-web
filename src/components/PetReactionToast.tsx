import { useEffect, useState, useCallback } from "react";

interface Props {
  message: string | null;
  onDone: () => void;
}

export default function PetReactionToast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  const stableOnDone = useCallback(onDone, []);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(stableOnDone, 300);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [message, stableOnDone]);

  if (!message) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-300 ${
      visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
    }`}>
      <div
        className="px-6 py-3 rounded-2xl text-white text-base font-medium shadow-2xl pointer-events-auto"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        {message}
      </div>
    </div>
  );
}

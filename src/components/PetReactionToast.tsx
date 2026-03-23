import { useEffect, useState } from "react";

interface Props {
  message: string | null;
  onDone: () => void;
}

export default function PetReactionToast({ message, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-16 inset-x-0 z-50 flex justify-center transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className="px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
      >
        {message}
      </div>
    </div>
  );
}

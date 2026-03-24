import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 60, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 16px)) 24px",
          background: "var(--bg-elevated)",
          backdropFilter: "var(--blur)",
          WebkitBackdropFilter: "var(--blur)",
          borderRadius: "var(--radius) var(--radius) 0 0",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-elevated)",
          animation: "scaleIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

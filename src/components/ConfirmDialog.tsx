import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, message, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 80, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div className="w-72 rounded-2xl p-5" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)", boxShadow: "var(--shadow-elevated)", animation: "scaleIn 0.15s ease-out" }} onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-medium text-center mb-5" style={{ color: "var(--text-primary)" }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}>
            {t("profile.cancel")}
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
            style={{ backgroundColor: "#ef4444" }}>
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

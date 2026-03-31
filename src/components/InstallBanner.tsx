import { X, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface Props {
  onShowIosInstructions: () => void;
}

export default function InstallBanner({ onShowIosInstructions }: Props) {
  const { t } = useTranslation();
  const { install, dismiss, showBanner, isIos } = useInstallPrompt();

  if (!showBanner) return null;

  async function handleInstall() {
    if (isIos) {
      onShowIosInstructions();
    } else {
      await install();
    }
  }

  return (
    <div className="mx-4 mb-3 rounded-2xl p-3.5 flex items-center gap-3"
      style={{ backgroundColor: "var(--bg-card-solid)", border: "1px solid var(--border)" }}>
      <Download size={18} style={{ color: "var(--theme-accent)", flexShrink: 0 }} />
      <p className="flex-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        {t("install.banner")}
      </p>
      <button onClick={handleInstall}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
        style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}>
        {t("install.bannerButton")}
      </button>
      <button onClick={dismiss} className="p-1 shrink-0" style={{ color: "var(--text-muted)" }}>
        <X size={14} />
      </button>
    </div>
  );
}

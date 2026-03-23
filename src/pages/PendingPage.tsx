import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

export default function PendingPage() {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="text-5xl mb-6">⏳</div>
      <h2 className="text-2xl font-extrabold mb-2" style={{ color: "var(--text-primary)" }}>
        {t("pending.title")}
      </h2>
      <p className="mb-8" style={{ color: "var(--text-muted)" }}>{t("pending.subtitle")}</p>
      <button onClick={() => signOut()} className="text-sm underline" style={{ color: "var(--text-muted)" }}>
        {t("profile.signOut")}
      </button>
    </div>
  );
}

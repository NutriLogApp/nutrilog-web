import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

export default function PendingPage() {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-5xl mb-6">⏳</div>
      <h2 className="text-2xl font-extrabold mb-2 text-slate-900 dark:text-white">
        {t("pending.title")}
      </h2>
      <p className="text-slate-500 mb-8">{t("pending.subtitle")}</p>
      <button onClick={() => signOut()} className="text-sm text-slate-400 underline">
        {t("profile.signOut")}
      </button>
    </div>
  );
}

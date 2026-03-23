import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-center mb-2" style={{ color: "var(--text-primary)" }}>
          {t("login.title")}
        </h1>
        <p className="text-center mb-10" style={{ color: "var(--text-muted)" }}>{t("login.subtitle")}</p>
        <button
          onClick={() => signInWithGoogle()}
          className="w-full py-3 rounded-2xl font-bold text-white text-base shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))" }}
        >
          {t("login.signIn")}
        </button>
      </div>
    </div>
  );
}

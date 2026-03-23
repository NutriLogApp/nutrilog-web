import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { t } = useTranslation();
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="w-full max-w-sm text-center">
        <div
          className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl"
          style={{ background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))", boxShadow: "0 8px 24px color-mix(in srgb, var(--theme-start) 30%, transparent)" }}
        >
          🐱
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
          {t("login.title")}
        </h1>
        <p className="text-sm mb-10 font-medium" style={{ color: "var(--text-muted)" }}>{t("login.subtitle")}</p>
        <button
          onClick={() => signInWithGoogle()}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
            boxShadow: "0 4px 16px color-mix(in srgb, var(--theme-start) 35%, transparent)",
          }}
        >
          {t("login.signIn")}
        </button>
      </div>
    </div>
  );
}

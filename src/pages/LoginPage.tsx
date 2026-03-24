import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const IS_DEV = import.meta.env.DEV;

export default function LoginPage() {
  const { t } = useTranslation();
  const { session, signInWithGoogle, devLogin } = useAuth();
  const navigate = useNavigate();
  const [devEmail, setDevEmail] = useState("test@nutrilog.dev");
  const [devLoading, setDevLoading] = useState(false);

  // Redirect if already authenticated
  if (session) return <Navigate to="/" replace />;

  async function handleDevLogin() {
    setDevLoading(true);
    try {
      await devLogin(devEmail);
      navigate("/");
    } catch {
      alert("Dev login failed — is backend running with DEV_MODE=true?");
    } finally {
      setDevLoading(false);
    }
  }

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

        {/* Dev login — only in development */}
        {IS_DEV && (
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Dev Login
            </p>
            <input
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm mb-2"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={handleDevLogin}
              disabled={devLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ backgroundColor: "var(--bg-input)", color: "var(--text-secondary)" }}
            >
              {devLoading ? "..." : "Dev Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

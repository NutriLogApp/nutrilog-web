import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email ?? "";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) return;
    setLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setResent(true);
    setLoading(false);
    setTimeout(() => setResent(false), 3000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
         style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="w-full max-w-sm text-center">
        <div className="text-5xl mb-6">📧</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {t("verifyEmail.title")}
        </h1>
        <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
          {t("verifyEmail.subtitle")}
        </p>
        {email && (
          <p className="text-sm font-semibold mb-8" style={{ color: "var(--text-secondary)" }}>
            {email}
          </p>
        )}
        <button
          onClick={handleResend}
          disabled={loading || resent}
          className="w-full py-3 rounded-2xl font-bold text-sm mb-4 transition-all active:scale-[0.97]"
          style={{
            background: resent ? "var(--bg-input)" : "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
            color: resent ? "var(--text-muted)" : "white",
          }}
        >
          {resent ? t("verifyEmail.resent") : t("verifyEmail.resend")}
        </button>
        <button
          onClick={() => navigate("/login")}
          className="text-sm font-semibold"
          style={{ color: "var(--theme-accent)" }}
        >
          {t("verifyEmail.backToLogin")}
        </button>
      </div>
    </div>
  );
}

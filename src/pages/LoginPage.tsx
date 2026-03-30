import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const IS_DEV = import.meta.env.DEV;

export default function LoginPage() {
  const { t } = useTranslation();
  const { session, signInWithGoogle, signUp, signInWithPassword, devLogin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devEmail, setDevEmail] = useState("test@nutrilog.dev");
  const [devLoading, setDevLoading] = useState(false);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError(t("login.emailRequired")); return; }
    if (!password) { setError(t("login.passwordRequired")); return; }

    if (mode === "signup") {
      if (password.length < 6) { setError(t("login.passwordHint")); return; }
      if (password !== confirmPassword) { setError(t("login.passwordsMustMatch")); return; }
      setLoading(true);
      const result = await signUp(email, password);
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      if (result.needsVerification) {
        navigate("/pending", { state: { email } });
        return;
      }
    } else {
      setLoading(true);
      const result = await signInWithPassword(email, password);
      setLoading(false);
      if (result.error) { setError(result.error); return; }
    }
  }

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
        {/* Gradient text title */}
        <h1
          className="text-4xl font-extrabold tracking-tight mb-2"
          style={{
            background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("login.title")}
        </h1>
        <p className="text-sm mb-10 font-medium" style={{ color: "var(--text-muted)" }}>
          {t("login.subtitle")}
        </p>

        {/* Google button */}
        <button
          onClick={() => signInWithGoogle()}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.97] mb-4"
          style={{
            backgroundColor: "var(--bg-input)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t("login.continueWithGoogle")}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            {t("login.orContinueWithEmail")}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.email")}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.password")}
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            {mode === "signup" && (
              <p className="text-xs mt-1 px-1" style={{ color: "var(--text-muted)" }}>{t("login.passwordHint")}</p>
            )}
          </div>
          {mode === "signup" && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("login.confirmPassword")}
              className="w-full rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          )}

          {/* Error */}
          {error && (
            <p className="text-xs font-medium px-1" style={{ color: "#ef4444" }}>{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.97] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
              boxShadow: "0 4px 16px color-mix(in srgb, var(--theme-start) 35%, transparent)",
            }}
          >
            {loading ? "..." : mode === "signup" ? t("login.createAccount") : t("login.signIn")}
          </button>
        </form>

        {/* Toggle sign-in / sign-up */}
        <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          {mode === "signin" ? t("login.newHere") : t("login.alreadyHaveAccount")}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            className="font-semibold"
            style={{ color: "var(--theme-accent)" }}
          >
            {mode === "signin" ? t("login.createAccountLink") : t("login.signInLink")}
          </button>
        </p>

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

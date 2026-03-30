import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import { submitFeedback } from "@/services/feedbackService";

export default function FeedbackFAB() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<Blob | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const pageUrlRef = useRef("");

  const captureScreenshot = useCallback(async () => {
    setCapturing(true);
    pageUrlRef.current = window.location.href;
    try {
      const canvas = await html2canvas(document.body, {
        ignoreElements: (el) => el.classList.contains("feedback-fab-ignore"),
        scale: 1,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (blob) {
        setScreenshot(blob);
        setScreenshotUrl(URL.createObjectURL(blob));
      }
    } catch {
      // Screenshot failed — continue without it
    }
    setCapturing(false);
    setOpen(true);
  }, []);

  const removeScreenshot = () => {
    if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
    setScreenshot(null);
    setScreenshotUrl(null);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await submitFeedback(message, screenshot, pageUrlRef.current);
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setMessage("");
        removeScreenshot();
      }, 2000);
    } catch {
      // Error toast handled by global mutation handler
    }
    setSending(false);
  };

  const handleClose = () => {
    setOpen(false);
    setMessage("");
    removeScreenshot();
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={captureScreenshot}
        disabled={capturing}
        className="feedback-fab-ignore fixed z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{
          bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
          right: "max(16px, calc(50% - 240px))",
          backgroundColor: "var(--bg-card)",
          boxShadow: "var(--shadow-fab)",
          border: "1px solid var(--border)",
        }}
      >
        {capturing ? (
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: "var(--theme-accent)", borderTopColor: "transparent" }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="var(--theme-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="feedback-fab-ignore fixed inset-0 z-[100] flex items-end justify-center"
             onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
          <div className="fixed inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg rounded-t-2xl p-5 pb-8"
               style={{
                 backgroundColor: "var(--bg-card-solid)",
                 boxShadow: "var(--shadow-elevated)",
               }}>
            <button onClick={handleClose} className="absolute top-4 right-4"
                    style={{ color: "var(--text-muted)" }}>
              ✕
            </button>

            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              {t("feedback.buttonLabel")}
            </h3>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              placeholder={t("feedback.placeholder")}
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none mb-3"
              style={{
                backgroundColor: "var(--bg-input)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />

            {screenshotUrl && (
              <div className="flex items-center gap-3 mb-4">
                <img src={screenshotUrl} alt="Screenshot" className="w-20 h-14 object-cover rounded-lg border"
                     style={{ borderColor: "var(--border)" }} />
                <span className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>
                  {t("feedback.screenshotAttached")}
                </span>
                <button onClick={() => { removeScreenshot(); setOpen(false); setTimeout(captureScreenshot, 100); }}
                        className="text-xs font-semibold" style={{ color: "var(--theme-accent)" }}>
                  {t("feedback.retake")}
                </button>
                <button onClick={removeScreenshot} className="text-xs font-semibold"
                        style={{ color: "#ef4444" }}>
                  {t("feedback.remove")}
                </button>
              </div>
            )}

            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.97] disabled:opacity-50"
              style={{
                background: sent
                  ? "#22c55e"
                  : "linear-gradient(135deg, var(--theme-start), var(--theme-end))",
                color: "white",
              }}
            >
              {sent ? t("feedback.sent") : sending ? t("feedback.sending") : t("feedback.send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

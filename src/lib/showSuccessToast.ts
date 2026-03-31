/**
 * Show a brief green success toast, mirroring the error toast pattern in queryConfig.ts.
 * Includes haptic feedback on Android via navigator.vibrate.
 */
export function showSuccessToast(message: string): void {
  if (navigator.vibrate) navigator.vibrate(50);

  const toast = document.createElement("div");
  toast.textContent = `\u2713 ${message}`;
  toast.style.cssText = `
    position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%);
    z-index: 100; padding: 12px 24px; border-radius: 16px;
    background: #22c55e; color: white; font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2); pointer-events: none;
    animation: fadeUp 0.3s ease-out;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
  }, 2000);
  setTimeout(() => toast.remove(), 2500);
}

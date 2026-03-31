import { QueryClient, focusManager } from "@tanstack/react-query";

// iOS PWA does not reliably fire visibilitychange on app resume.
// Use all three events to cover: tab switch, app background/foreground,
// iOS bfcache restore, and lock/unlock scenarios.
focusManager.setEventListener((handleFocus) => {
  if (typeof window === "undefined" || !window.addEventListener) return;

  const onVisible = () => handleFocus(document.visibilityState === "visible");
  const onFocus = () => handleFocus(true);
  const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) handleFocus(true); };

  document.addEventListener("visibilitychange", onVisible, false);
  window.addEventListener("focus", onFocus, false);
  window.addEventListener("pageshow", onPageShow, false);

  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("pageshow", onPageShow);
  };
});

/**
 * Global query client with mutation error handler.
 * Shows a brief toast when any mutation fails.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      onError: () => {
        const toast = document.createElement("div");
        toast.textContent = "Something went wrong. Please try again.";
        toast.style.cssText = `
          position: fixed; bottom: 120px; left: 50%; transform: translateX(-50%);
          z-index: 100; padding: 12px 24px; border-radius: 16px;
          background: #ef4444; color: white; font-size: 13px; font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2); pointer-events: none;
          animation: fadeUp 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = "0"; toast.style.transition = "opacity 0.3s"; }, 2500);
        setTimeout(() => toast.remove(), 3000);
      },
    },
  },
});

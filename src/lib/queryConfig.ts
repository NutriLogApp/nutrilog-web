import { QueryClient, focusManager } from "@tanstack/react-query";

// Use visibilitychange for PWA background/foreground detection.
// This ensures data refreshes when the app is reopened on iOS/Android PWA,
// when switching browser tabs, or when returning to the app on another device.
focusManager.setEventListener((handleFocus) => {
  if (typeof window === "undefined" || !window.addEventListener) return;
  const handler = () => handleFocus(document.visibilityState === "visible");
  window.addEventListener("visibilitychange", handler, false);
  return () => window.removeEventListener("visibilitychange", handler);
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

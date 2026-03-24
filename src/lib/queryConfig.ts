import { QueryClient } from "@tanstack/react-query";

/**
 * Global query client with mutation error handler.
 * Shows a brief toast when any mutation fails.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: {
      onError: () => {
        // Show a temporary error toast
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

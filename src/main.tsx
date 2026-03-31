import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App";

// Register SW with proactive update checks for iOS PWA standalone mode.
// The auto-injected registration only checks on page load, which iOS may
// skip for months. This forces checks when the app comes to foreground.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    // Check for updates when app comes to foreground (critical for iOS PWA)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update();
      }
    });

    // Safety net: check every hour
    setInterval(() => registration.update(), 60 * 60 * 1000);
  },
});

// Auto-reload when a new service worker takes control (after deployment)
if ("serviceWorker" in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { useState, useEffect, useCallback, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosSafari() {
  const ua = navigator.userAgent;
  return /iP(hone|od|ad)/.test(ua) && /WebKit/.test(ua) && !/(CriOS|FxiOS|OPiOS|mercury)/.test(ua);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone);
}

const DISMISS_KEY = "mealriot_install_dismissed";

export function useInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIsIos(isIosSafari());

    function handler(e: Event) {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    }
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") {
        setCanInstall(false);
        deferredPrompt.current = null;
      }
      return outcome;
    }
    return null;
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  }, []);

  const showButton = !standalone && (canInstall || isIos);
  const showBanner = showButton && !dismissed;

  return { install, dismiss, canInstall, isIos, standalone, showButton, showBanner };
}

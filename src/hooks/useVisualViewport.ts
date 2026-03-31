import { useEffect } from "react";

/**
 * Syncs window.visualViewport.height to a CSS variable --vvh on <html>.
 * On iOS PWA, this is the only value that actually changes when the
 * keyboard opens — dvh/svh/lvh all stay constant.
 *
 * Also resets scroll position on focusout to fix iOS leaving the page
 * scrolled up after keyboard dismissal.
 */
export function useVisualViewport() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      document.documentElement.style.setProperty("--vvh", `${vv!.height}px`);
    }

    vv.addEventListener("resize", update);
    update();

    // iOS sometimes leaves scroll offset after keyboard closes
    function handleFocusOut() {
      setTimeout(() => {
        if (vv && vv.offsetTop > 0) {
          window.scrollTo(0, 0);
        }
      }, 100);
    }
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      vv.removeEventListener("resize", update);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);
}

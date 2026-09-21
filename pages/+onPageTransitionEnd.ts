import type { OnPageTransitionEndAsync } from "vike/types";
import { releaseProgress } from "@/lib/progressBar";
import { clearOverlayBackNavigation } from "@/hooks/use-close-on-back";

export const onPageTransitionEnd: OnPageTransitionEndAsync = async () => {
  const wasOverlayBack = clearOverlayBackNavigation();

  // releaseProgress is a no-op when this owner never took a hold, which is the case
  // for a suppressed transition (and when the system-error overlay skipped the start
  // hook), so this stays correct without mirroring that condition here.
  releaseProgress("navigation");
  document.querySelector("body")?.classList.remove("page-is-transitioning");

  // SPA navigations don't trigger a full page load, so Analytics' automatic
  // page_view (fired once on init) needs a manual follow-up per route change.
  // Closing a modal isn't a page view.
  if (wasOverlayBack) return;
  const { trackPageView } = await import("@/lib/firebase");
  trackPageView(window.location.pathname);
};

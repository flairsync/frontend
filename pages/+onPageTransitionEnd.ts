import type { OnPageTransitionEndAsync } from "vike/types";
import nprogress from "nprogress";

export const onPageTransitionEnd: OnPageTransitionEndAsync = async () => {
  nprogress.done();
  document.querySelector("body")?.classList.remove("page-is-transitioning");

  // SPA navigations don't trigger a full page load, so Analytics' automatic
  // page_view (fired once on init) needs a manual follow-up per route change.
  const { trackPageView } = await import("@/lib/firebase");
  trackPageView(window.location.pathname);
};

import NProgress from "nprogress";

NProgress.configure({ showSpinner: false });

/**
 * Single owner of the nprogress bar at the top of the screen.
 *
 * Two independent things want that bar: Vike page transitions
 * (+onPageTransitionStart/End) and flairapi's in-flight request counter. NProgress
 * itself is a singleton with no reference counting, so when both used it directly they
 * fought each other in both directions:
 *
 *   - whichever finished first called NProgress.done() and hid the bar while the other
 *     was still working, so the bar vanished mid-navigation; and
 *   - if a hold was never released — a page transition whose end hook never fires
 *     because the navigation is stuck — nothing else could ever clear the bar, which
 *     left it sitting at the top of the screen indefinitely.
 *
 * So both go through here instead. The bar is visible while at least one owner holds
 * it, and a watchdog force-clears it so a leaked hold degrades to "bar disappears a bit
 * early" rather than "bar never goes away".
 */
export type ProgressOwner = "requests" | "navigation";

const holders = new Set<ProgressOwner>();
let watchdog: ReturnType<typeof setTimeout> | null = null;

/**
 * A bar still on screen after this long is not telling the user anything they can act
 * on. flairapi's own ceiling is Timeouts.UPLOAD (300s), but an upload that long shows
 * its own progress UI; the case this bound exists for — a hold that is never released —
 * otherwise has no ceiling at all.
 */
const MAX_VISIBLE_MS = 30_000;

const clearWatchdog = () => {
  if (watchdog) {
    clearTimeout(watchdog);
    watchdog = null;
  }
};

const armWatchdog = () => {
  clearWatchdog();
  watchdog = setTimeout(() => {
    watchdog = null;
    if (holders.size === 0) return;
    // Don't silently paper over it: a leak here means some owner has a path that
    // never releases, and that's worth seeing in a bug report.
    console.warn(
      `[progressBar] force-clearing after ${MAX_VISIBLE_MS}ms; still held by:`,
      [...holders].join(", ")
    );
    holders.clear();
    NProgress.done();
  }, MAX_VISIBLE_MS);
};

export function holdProgress(owner: ProgressOwner): void {
  if (typeof window === "undefined") return;
  const wasIdle = holders.size === 0;
  holders.add(owner);
  if (wasIdle) NProgress.start();
  armWatchdog();
}

export function releaseProgress(owner: ProgressOwner): void {
  if (typeof window === "undefined") return;
  if (!holders.delete(owner)) return;
  if (holders.size === 0) {
    clearWatchdog();
    NProgress.done();
  }
}

/** Test/debug helper — which owners are currently keeping the bar on screen. */
export function getProgressHolders(): ProgressOwner[] {
  return [...holders];
}

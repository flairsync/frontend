import { useEffect } from "react";

// B5 (QA Test Report, 2026-11-18): the header avatar dropdown sometimes stopped responding
// entirely with no console error — "failed on /profile/settings after reload, and later on
// /manage", with no way to log out. This is a known Radix UI failure mode, not specific to
// the avatar menu: when a Dialog/Sheet/Popover/DropdownMenu is interrupted (most commonly a
// client-side route change while it's still open) instead of closing normally, Radix's own
// cleanup never runs — and it leaves `pointer-events: none` stuck on <body> forever, silently
// blocking clicks on every element on every later page, including completely unrelated ones
// like this avatar menu's trigger. Nothing legitimate should outlive every overlay closing,
// so this watches for exactly that stuck state and clears it.
export default function RadixPointerEventsGuard() {
  useEffect(() => {
    const clearIfStuck = () => {
      if (document.body.style.pointerEvents !== "none") return;
      const hasOpenOverlay = document.querySelector('[data-state="open"]');
      if (!hasOpenOverlay) document.body.style.pointerEvents = "";
    };

    const observer = new MutationObserver(clearIfStuck);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    // Covers the case where it was already stuck before this mounted (e.g. carried over
    // from a page that got interrupted mid-navigation on its very first load).
    clearIfStuck();

    return () => observer.disconnect();
  }, []);

  return null;
}

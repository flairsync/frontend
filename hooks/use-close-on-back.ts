import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Makes the device/browser back gesture close an open overlay instead of leaving the
 * page — what people expect from a phone, where "back" is the universal dismiss.
 *
 * How it works: while the overlay is open we push one extra history entry at the *same*
 * URL. Back then pops that entry instead of navigating, and we close the overlay.
 *
 * Why the same URL rather than a `#modal` hash: Vike's popstate handler computes
 * `isUserPushStateNavigation` from `history.state.triggeredBy === 'user'`, which its
 * pushState monkey-patch sets for app-initiated pushes, and passes
 * `doNotRenderIfSamePage` — so popping our entry re-renders nothing. A hash would work
 * too but leaves `#modal` sitting in the URL bar and in anything the user shares.
 *
 * Vike's monkey-patch spreads our state object into its own, so OVERLAY_KEY survives
 * and we can tell our sentinel entries apart from real navigation.
 */
const OVERLAY_KEY = "flairOverlay";

type Entry = { id: number; close: () => void };

// A stack, not a flag: a modal can open another modal (a confirm inside a form), and
// back must close only the topmost one. Each open overlay pushes exactly one history
// entry, so one back press maps to one close, innermost first.
const stack: Entry[] = [];
let nextId = 1;
let listening = false;

// Set while we're handling a back press that closes an overlay, so the page-transition
// hooks can tell this apart from a real navigation. Closing a modal must not flash the
// loading bar at the top of the screen — Vike still starts a transition for our sentinel
// pop even though `doNotRenderIfSamePage` means it renders nothing.
let backClosingOverlay = false;
let backClosingTimer: ReturnType<typeof setTimeout> | null = null;

export function isOverlayBackNavigation(): boolean {
  // `stack.length > 0` matters as much as the flag: Vike registers its popstate
  // listener at init, long before ours exists, so on a back press Vike's transition
  // has already started by the time our handler could set the flag. While an overlay
  // still holds a sentinel entry, any transition is either that sentinel being popped
  // or a navigation the user started from inside a modal — neither is worth a loading
  // bar. The flag covers the other direction: closing via Escape/X, where our cleanup
  // pops the sentinel itself after removing the entry from the stack.
  return backClosingOverlay || stack.length > 0;
}

/**
 * Called by the page-transition hooks once the transition we suppressed is over.
 * Returns whether the transition that just ended was an overlay back-close, so the
 * caller can skip the things that only make sense for a real navigation.
 */
export function clearOverlayBackNavigation(): boolean {
  const was = backClosingOverlay;
  backClosingOverlay = false;
  if (backClosingTimer) {
    clearTimeout(backClosingTimer);
    backClosingTimer = null;
  }
  return was;
}

const markOverlayBackNavigation = () => {
  backClosingOverlay = true;
  // Belt and braces: if no page transition follows (Vike can skip it entirely), the
  // flag must not stay set and swallow the bar for the next real navigation.
  if (backClosingTimer) clearTimeout(backClosingTimer);
  backClosingTimer = setTimeout(clearOverlayBackNavigation, 1000);
};

const onPopState = () => {
  const top = stack[stack.length - 1];
  if (!top) return;
  markOverlayBackNavigation();
  // The entry we just popped was ours, so close the overlay that pushed it. The
  // closing overlay's cleanup removes it from the stack and knows not to call
  // history.back() again.
  top.close();
};

const ensureListening = () => {
  if (listening || typeof window === "undefined") return;
  window.addEventListener("popstate", onPopState);
  listening = true;
};

export function useCloseOnBack(open: boolean, close: () => void): void {
  // Kept in a ref so re-renders with a new inline callback don't tear down and
  // re-push the history entry mid-interaction.
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    ensureListening();
    const id = nextId++;
    let closedByBack = false;

    const entry: Entry = {
      id,
      close: () => {
        closedByBack = true;
        closeRef.current();
      },
    };
    stack.push(entry);
    // Deliberately *not* spreading the current entry's state. Vike's pushState
    // monkey-patch only stamps `triggeredBy: 'user'` onto state it doesn't already
    // consider Vike-enhanced, and copying the current state would carry over
    // `_isVikeEnhanced` (plus a stale scrollPosition and timestamp) — leaving
    // `triggeredBy: 'vike'`. Vike's popstate handler then computes
    // `isUserPushStateNavigation === false`, skips `doNotRenderIfSamePage`, and
    // re-renders the whole page just to close a modal.
    window.history.pushState({ [OVERLAY_KEY]: id }, "", window.location.href);

    return () => {
      const i = stack.indexOf(entry);
      if (i !== -1) stack.splice(i, 1);

      // Closed some other way — Escape, the X, a backdrop click, or the overlay
      // unmounting. Our sentinel entry is still sitting in the history, so drop it;
      // otherwise the user's next back press would be silently swallowed by an
      // overlay that is no longer on screen.
      if (!closedByBack && window.history.state?.[OVERLAY_KEY] === id) {
        // Popping our own sentinel makes Vike run a transition too, so flag it before
        // going back — by now this entry is off the stack, so the length check in
        // isOverlayBackNavigation() no longer covers us.
        markOverlayBackNavigation();
        window.history.back();
      }
    };
  }, [open]);
}

/** Test helper — how many overlays currently hold a history entry. */
export function getOverlayBackStackSize(): number {
  return stack.length;
}

type OverlayRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Adapts a Radix overlay root (Dialog / Sheet / AlertDialog) to useCloseOnBack.
 *
 * Radix roots can be controlled (`open` + `onOpenChange`, which is how ~all of ours are
 * used) or uncontrolled (`defaultOpen` + a Trigger). The back gesture has to work for
 * both, so this mirrors the uncontrolled state locally and always hands the primitive a
 * controlled pair. Spread the result *after* the original props so it wins.
 */
export function useOverlayBackClose(props: OverlayRootProps) {
  const isControlled = props.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(!!props.defaultOpen);
  const open = isControlled ? !!props.open : uncontrolledOpen;

  const onOpenChangeRef = useRef(props.onOpenChange);
  onOpenChangeRef.current = props.onOpenChange;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChangeRef.current?.(next);
    },
    [isControlled]
  );

  useCloseOnBack(open, useCallback(() => handleOpenChange(false), [handleOpenChange]));

  // defaultOpen is deliberately dropped: Radix warns if it's passed alongside `open`,
  // and we've already folded it into the local state above.
  return { open, onOpenChange: handleOpenChange, defaultOpen: undefined };
}

import type { OnPageTransitionStartAsync } from "vike/types";
import { useSystemErrorStore } from "@/features/system-errors/SystemErrorStore";
import { holdProgress } from "@/lib/progressBar";
import { isOverlayBackNavigation } from "@/hooks/use-close-on-back";

export const onPageTransitionStart: OnPageTransitionStartAsync = async () => {
  if (useSystemErrorStore.getState().isLocked) {
    return;
  }
  // Back-to-close-a-modal pops a sentinel history entry at the current URL. Vike still
  // runs a transition for it (rendering nothing, since it's the same page), but to the
  // user that's just a modal closing — flashing the loading bar would make a local,
  // instant action look like a page load.
  if (isOverlayBackNavigation()) {
    return;
  }
  holdProgress("navigation");
  document.querySelector("body")?.classList.add("page-is-transitioning");
};

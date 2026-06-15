import type { OnPageTransitionStartAsync } from "vike/types";
import nprogress from "nprogress";
import { useSystemErrorStore } from "@/features/system-errors/SystemErrorStore";

export const onPageTransitionStart: OnPageTransitionStartAsync = async () => {
  if (useSystemErrorStore.getState().isLocked) {
    return;
  }
  nprogress.start();
  console.log("Page transition start");
  document.querySelector("body")?.classList.add("page-is-transitioning");
};

import type { OnPageTransitionStartAsync } from "vike/types";
import nprogress from "nprogress";

export const onPageTransitionStart: OnPageTransitionStartAsync = async () => {
  nprogress.start();
  console.log("Page transition start");
  document.querySelector("body")?.classList.add("page-is-transitioning");
};

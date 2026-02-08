import type { OnPageTransitionEndAsync } from "vike/types";
import nprogress from "nprogress";

export const onPageTransitionEnd: OnPageTransitionEndAsync = async () => {
  nprogress.done();
  console.log("Page transition end");
  document.querySelector("body")?.classList.remove("page-is-transitioning");
};

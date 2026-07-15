import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user, urlParsed } = pageContext;

  if (!user) {
    // Render the error page and show message to the user
    throw redirect("/login?origin=" + encodeURIComponent(urlParsed.pathname + (urlParsed.searchOriginal ?? "")));
  }

  if (!user.verified) {
    throw redirect(`/verify?origin=${encodeURIComponent(urlParsed.pathname + (urlParsed.searchOriginal ?? ""))}`);
  }

  if (!user.hasPP) {
    throw redirect(`/manage/join?origin=${encodeURIComponent(urlParsed.pathname + (urlParsed.searchOriginal ?? ""))}`);
  }

  // The professional-profile page hosts the OTP confirm UI itself — never
  // redirect away from it, or an unverified user could never reach it.
  if (!user.ppVerified && urlParsed.pathname !== "/manage/professional-profile") {
    throw redirect(`/manage/professional-profile?origin=${encodeURIComponent(urlParsed.pathname + (urlParsed.searchOriginal ?? ""))}`);
  }

  if (urlParsed.pathname === "/manage") {
    throw redirect("/manage/overview");
  }
};

import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";
import { modifyUrl } from "vike/modifyUrl";

export const guard = (pageContext: PageContext) => {
  const { user, urlParsed } = pageContext;

  if (!user) {
    // Render the error page and show message to the user
    throw redirect(`/login?returnUrl=${urlParsed.href}`);
  }
  if (!user.verified) {
    throw redirect("/verify");
  }
  if (!user.hasPP) {
    throw redirect("/manage/join");
  }
};

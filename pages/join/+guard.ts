import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";
import { modifyUrl } from "vike/modifyUrl";

export const guard = (pageContext: PageContext) => {
  const { user, urlParsed } = pageContext;

  console.log(user);

  if (!user) {
    // Render the error page and show message to the user
    throw redirect(`/login?returnUrl=${urlParsed.href}`);
  }
  if (!user.verified) {
    throw redirect(`/verify?returnUrl=${urlParsed.href}`);
  }
  if (!user.hasPP) {
    throw redirect(`/manage/join?invitation=${urlParsed.search["invitation"]}`);
  }
};

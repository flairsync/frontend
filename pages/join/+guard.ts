import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";
import { modifyUrl } from "vike/modifyUrl";

export const guard = (pageContext: PageContext) => {
  const { user, urlParsed } = pageContext;

  console.log("------------------------", user);

  if (!user) {
    // Render the error page and show message to the user
    throw redirect(`/login?origin=${encodeURIComponent(urlParsed.pathname + urlParsed.searchOriginal)}`);
  }
  if (!user.verified) {
    throw redirect(`/verify?origin=${encodeURIComponent(urlParsed.pathname + urlParsed.searchOriginal)}`);
  }
  if (!user.hasPP) {
    throw redirect(`/manage/join?invitation=${urlParsed.search["invitation"]}`);
  }
};

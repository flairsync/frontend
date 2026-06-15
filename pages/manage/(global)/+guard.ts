import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user } = pageContext;

  if (!user) {
    const { urlParsed } = pageContext;
    // Render the error page and show message to the user
    throw redirect("/login?origin=" + encodeURIComponent(urlParsed.pathname + urlParsed.searchOriginal));
  }

  if (!user.hasPP) {
    throw redirect("/manage/join");
  }
};

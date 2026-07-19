import { redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user, urlParsed } = pageContext;

  if (!user) {
    throw redirect(`/login?origin=${encodeURIComponent(urlParsed.pathname + (urlParsed.searchOriginal ?? ""))}`);
  }
};

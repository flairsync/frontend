import { redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user } = pageContext;
  if (user) {
    throw redirect("/feed");
  }
};

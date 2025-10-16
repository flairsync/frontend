import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user } = pageContext;
  if (user !== undefined) {
    // Render the error page and show message to the user
    throw redirect("/feed");
  }
};

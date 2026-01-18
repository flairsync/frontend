import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user, urlParsed } = pageContext;

  if (user) {
    console.log("-----------------------");
    console.log(urlParsed);
    console.log("-----------------------");

    if (urlParsed.search["returnUrl"]) {
      throw redirect(urlParsed.search["returnUrl"]);
    } else {
      // Render the error page and show message to the user
      throw redirect("/feed");
    }
  }
};

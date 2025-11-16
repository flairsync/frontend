import { render, redirect } from "vike/abort";
import { PageContext } from "vike/types";

export const guard = (pageContext: PageContext) => {
  const { user, session } = pageContext;

  if (!user) {
    // Render the error page and show message to the user
    throw redirect("/login");
  }

  console.log("RAW:", JSON.parse(JSON.stringify(user)));

  console.log("GUARD --- ", user);
  console.log("GUARD --- ", user["verified"]);

  if (user.verified) {
    throw redirect("/profile");
  }
};

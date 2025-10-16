import { render, redirect } from "vike/abort";

export const guard = (pageContext) => {
  const { user } = pageContext.headers.cookie;
  if (user === null) {
    // Render the login page while preserving the URL. (This is novel technique
    // which we explain down below.)
    throw render("/login");
    /* The more traditional way, redirect the user:
    throw redirect('/login')
    */
  }
  if (!user.verified) {
    // Render the error page and show message to the use
    throw redirect("/verify");
  }
};

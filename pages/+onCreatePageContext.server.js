export async function onCreatePageContext(pageContext) {
  // Prerendering (vike build) runs this hook with no live HTTP request, so
  // there's no Hono context to read cookies from — fall back to signed-out.
  if (!pageContext.hono) {
    pageContext.user = null;
    pageContext.tfa = null;
    pageContext.session = null;
    return {
      user: null,
      tfa: null,
      session: null
    };
  }

  const user = pageContext.hono.get("user");
  const tfa = pageContext.hono.get("tfa");
  const sess = pageContext.hono.get("session");

  pageContext.user = user;
  pageContext.tfa = tfa;
  pageContext.session = sess;
  return {
    user,
    tfa,
    session: sess
  };
}

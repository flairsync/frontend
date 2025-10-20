export async function onCreatePageContext(pageContext) {
  // pageContext.user = pageContext.globalContext.headers.cookies.user;
  const user = pageContext.hono.get("user");
  const tfa = pageContext.hono.get("tfa");
  pageContext.user = user;
  pageContext.tfa = tfa;
}

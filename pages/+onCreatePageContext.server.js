export async function onCreatePageContext(pageContext) {
  // pageContext.user = pageContext.globalContext.headers.cookies.user;
  const user = pageContext.hono.get("user");

  pageContext.user = user;
}

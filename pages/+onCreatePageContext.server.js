export async function onCreatePageContext(pageContext) {
  // pageContext.user = pageContext.globalContext.headers.cookies.user;
  /*  if (!pageContext.hono) {
     return {
       user: null,
       tfa: null,
       session: null
     };
   } */
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

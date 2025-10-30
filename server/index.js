// server/index.js

import { Hono } from "hono";
import { apply } from "vike-server/hono";
import { serve } from "vike-server/hono/serve";
import { getCookie, getSignedCookie } from "hono/cookie"; // 👈 You need this to read cookies
function startServer() {
  const app = new Hono();

  app.use("*", async (c, next) => {
    const userCookie = getCookie(c, "user"); // 👈 Your HttpOnly cookie name
    const tfaCookie = getCookie(c, "tfa");
    const sessionId = getCookie(c, "sid");

    let user = null;
    let tfa = null;

    let session = {
      id: sessionId,
    };
    if (userCookie) {
      user = userCookie;
    }
    if (tfaCookie) {
      tfa = tfaCookie;
    }
    c.set("user", user);
    c.set("tfa", tfa);
    c.set("session", session);
    await next();
  });

  apply(app);

  return serve(app, {});
}

export default startServer();

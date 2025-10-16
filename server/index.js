// server/index.js

import { Hono } from "hono";
import { apply } from "vike-server/hono";
import { serve } from "vike-server/hono/serve";
import { getCookie, getSignedCookie } from "hono/cookie"; // 👈 You need this to read cookies
function startServer() {
  const app = new Hono();

  app.use("*", async (c, next) => {
    const userCookie = getCookie(c, "user"); // 👈 Your HttpOnly cookie name
    let user = null;
    if (userCookie) {
      user = userCookie;
    }
    c.set("user", user);
    await next();
  });

  apply(app);

  return serve(app, {});
}

export default startServer();

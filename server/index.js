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
    // Which management shell to render (Easy View vs Full View). Read here so
    // the very first SSR paint already has it — reading it client-side instead
    // would flash the wrong shell on every manage page load.
    const uiModeCookie = getCookie(c, "fs_ui_mode");

    let user = null;
    let tfa = null;

    let session = {
      id: sessionId,
    };
    if (userCookie) {
      const clean = userCookie.replace(/^j:/, ""); // remove the leading 'J:'

      // A stale/oversized/malformed cookie (e.g. left over across a deploy that
      // changed the cookie's shape) must never crash this middleware — it runs on
      // every request, so an uncaught throw here previously meant every request
      // failed until the user manually cleared cookies. Treat it as signed-out
      // instead; the next successful login overwrites the cookie with a fresh one.
      try {
        user = JSON.parse(clean);
      } catch {
        user = null;
      }
    }
    if (tfaCookie) {
      tfa = tfaCookie;
    }

    c.set("user", user);
    c.set("tfa", tfa);
    c.set("session", session);
    c.set(
      "uiMode",
      uiModeCookie === "simple" || uiModeCookie === "advanced" ? uiModeCookie : null
    );
    await next();
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  apply(app);

  return serve(app, {});
}

export default startServer();

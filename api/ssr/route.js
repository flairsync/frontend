export const config = { runtime: "edge" };

import { renderPage } from "vike/server";

export default async function handler(req) {
  const pageContextInit = { urlOriginal: req.url };
  const pageContext = await renderPage(pageContextInit);

  const httpResponse = pageContext.httpResponse;
  if (!httpResponse) {
    return new Response("Not found", { status: 200 });
  }

  const { body, statusCode, headers } = httpResponse;
  return new Response(body, {
    status: statusCode,
    headers: Object.fromEntries(headers),
  });
}

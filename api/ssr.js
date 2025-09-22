import { renderPage } from "vike/server";

export default async function handler(req, res) {
  const pageContext = {
    urlOriginal: req.url,
  };
  const pageContextInit = await renderPage(pageContext);
  const { httpResponse } = pageContextInit;

  if (!httpResponse) {
    res.statusCode = 200;
    res.end("Vike page not found.");
    return;
  }

  const { body, statusCode, headers, earlyHints } = httpResponse;

  if (earlyHints) {
    res.writeEarlyHints(earlyHints);
  }

  res.statusCode = statusCode;
  headers.forEach(([name, value]) => res.setHeader(name, value));
  res.end(body);
}

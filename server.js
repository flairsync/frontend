import { renderPage } from "./.vercel_build_output/server/entry-server.js"; // placeholder, will adjust in vercel build

export default async function handler(req, res) {
  const pageContextInit = { urlOriginal: req.url };
  const pageContext = await renderPage(pageContextInit);

  if (pageContext.httpResponse) {
    const { body, statusCode, headers } = pageContext.httpResponse;
    headers.forEach(([name, value]) => res.setHeader(name, value));
    res.statusCode = statusCode;
    res.end(body);
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
}

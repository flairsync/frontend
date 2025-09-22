import express from "express";
import { renderPage } from "vike/server";

const app = express();

// Serve client assets from Vike build
app.use(express.static("dist/client"));

app.get("*", async (req, res, next) => {
  const pageContextInit = { urlOriginal: req.originalUrl };
  const pageContext = await renderPage(pageContextInit);

  const { httpResponse } = pageContext;
  if (!httpResponse) return next();

  const { body, statusCode, headers } = httpResponse;
  res.status(statusCode);
  headers.forEach(([name, value]) => res.setHeader(name, value));
  res.send(body);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

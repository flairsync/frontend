import express from "express";
import { renderPage } from "vike/server";

const app = express();

// Serve static client assets
app.use(express.static("dist/client"));

// Catch-all route for SSR
app.get("/:path(.*)*", async (req, res, next) => {
  try {
    const pageContextInit = { urlOriginal: req.originalUrl };
    const pageContext = await renderPage(pageContextInit);

    const { httpResponse } = pageContext;

    if (!httpResponse) {
      // No SSR page found, continue to next middleware (optional 404)
      return next();
    }

    const { body, statusCode, headers } = httpResponse;

    res.status(statusCode);
    headers.forEach(([name, value]) => res.setHeader(name, value));
    res.send(body);
  } catch (err) {
    console.error("SSR Error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Optional: 404 for any unmatched static assets
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Start server on Render’s PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Vike SSR server running at http://localhost:${port}`);
});

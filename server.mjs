// server.mjs
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { renderPage } from "vike/server";

const isProduction = process.env.NODE_ENV === "production";
const root = path.join(fileURLToPath(import.meta.url), "..");

async function createExpressServer() {
  const app = express();

  if (isProduction) {
    // Serve static assets first
    const distPath = path.join(root, "dist");
    const clientPath = path.join(distPath, "client");
    const serverPath = path.join(distPath, "server");

    // Import the Vike production entry

    app.use(express.static(clientPath));

    // Handle all other requests with Vike's SSR
    app.use(async (req, res, next) => {
      const pageContextInit = {
        urlOriginal: req.originalUrl,
      };
      try {
        const pageContext = await renderPage(pageContextInit);
        const { httpResponse } = pageContext;

        if (!httpResponse) {
          return next();
        }

        httpResponse.pipe(res);
      } catch (error) {
        next(error);
      }
    });
  } else {
    // In development, Vike's Vite plugin handles everything
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

createExpressServer();

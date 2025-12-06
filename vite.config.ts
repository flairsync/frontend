import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike(), react(), tailwindcss()],

  build: {
    target: "es2022",
    sourcemap: false,
  },

  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
  server: {
    host: "0.0.0.0", // Make sure the server is accessible outside the container
    watch: {
      usePolling: true, // Essential for Docker development environments
    },
    allowedHosts: ["flairsync.com"],
  },
  define: {
    "process.env": {},
  },
  ssr: {
    // Add problematic npm package here:
    noExternal: ["radar-sdk-js"],
  },
});

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import vike from "vike/plugin";
import vercel from "vite-plugin-vercel";

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike(), react(), tailwindcss(), vercel()],

  build: {
    target: "es2022",
  },

  resolve: {
    alias: {
      "@": new URL("./", import.meta.url).pathname,
    },
  },
});

import type { Config } from "vike/types";
import vikeReact from "vike-react/config";
import Layout from "../layouts/LayoutDefault.js";
import vikeReactQuery from "vike-react-query/config";
import vikeServer from "vike-server/config";
import React from "react";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "FlairSync",
  description: "Demo showcasing Vike",

  extends: [vikeReact, vikeReactQuery, vikeServer],
  server: "server/index.js",
} satisfies Config;

declare global {
  namespace Vike {
    interface PageContext {
      // Type of pageContext.user
      user?: {
        tfaEnabled: boolean;
        tfaSuccess: boolean;
        verified: boolean;
      };
      // Refine type of pageContext.Page
    }
  }
}

// If you define Vike.PageContext in a .d.ts file then
// make sure there is at least one export/import statement.
// Tell TypeScript this file isn't an ambient module:
export {};

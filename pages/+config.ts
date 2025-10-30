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
  description:
    "FlairSync is a modern platform that helps creators and businesses connect, manage their content, and streamline their workflow with powerful tools for collaboration, analytics, and payouts — all in one place.",

  extends: [vikeReact, vikeReactQuery, vikeServer],
  server: "server/index.js",

  passToClient: ["user", "tfa", "session"],
} satisfies Config;

declare global {
  namespace Vike {
    interface PageContext {
      // Type of pageContext.user
      user?: {
        verified: boolean;
      };
      tfa?: {
        tfaEnabled: boolean;
        tfaSuccess: boolean;
        trustedDevice: boolean;
      };
      session?: {
        id: string;
      };
      // Refine type of pageContext.Page
    }
  }
}

// If you define Vike.PageContext in a .d.ts file then
// make sure there is at least one export/import statement.
// Tell TypeScript this file isn't an ambient module:
export {};

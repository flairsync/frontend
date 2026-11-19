import type { Config } from "vike/types";
import vikeReact from "vike-react/config";
import Layout from "../layouts/LayoutDefault.js";
import vikeReactQuery from "vike-react-query/config";
import vikeServer from "vike-server/config";
import React from "react";
import { normalizeLang } from "../translations/supportedLanguages.js";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/Layout
  Layout,

  // https://vike.dev/head-tags
  title: "FlairSync",
  description:
    "FlairSync is a modern platform that helps creators and businesses connect, manage their content, and streamline their workflow with powerful tools for collaboration, analytics, and payouts — all in one place.",
  image: "https://flairsync.com/social-preview.png",

  // P1-6 (QA, 2026-11-18): <html lang> was always "en". `langCookie` is read server-side
  // from the fs_lang cookie (server/index.js), the same way uiMode already is — this sets
  // the real attribute from the very first SSR response. In-app language changes (no
  // navigation) are kept in sync separately, in translations/i18n.ts.
  lang: (pageContext) => normalizeLang(pageContext.langCookie ?? "en"),

  extends: [vikeReact, vikeReactQuery, vikeServer],
  // vike and vike-server each augment Vike.Config's `server` key with a different type,
  // and declaration merging intersects them into something a bare path can't satisfy —
  // this is the documented vike-server usage regardless.
  server: "server/index.js" as any,

  passToClient: ["user", "tfa", "session", "uiMode", "langCookie"],

  // Default TanStack Query staleTime: without this it's 0, so every query
  // refetches on mount/window-focus. Screens that need fresher data (KDS,
  // live orders) already override staleTime per-hook.
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  },
} satisfies Config;

declare global {
  namespace Vike {
    interface PageContext {
      // Type of pageContext.user
      user?: {
        verified: boolean;
        hasPP: boolean;
        ppVerified: boolean;
        passwordBreached: boolean;
      };
      tfa?: {
        tfaEnabled: boolean;
        tfaSuccess: boolean;
        trustedDevice: boolean;
      };
      session?: {
        id: string;
      };
      // "simple" (Easy View) | "advanced" (Full View), read from the fs_ui_mode
      // cookie server-side. null when the user has never chosen — the provider
      // then applies the default for their account age.
      uiMode?: "simple" | "advanced" | null;
      // Raw fs_lang cookie value, read server-side (server/index.js) — unnormalized
      // (may be a base subtag like "fr" from before this project used full BCP-47 tags),
      // hence `normalizeLang` in the `lang` config above rather than using it directly.
      langCookie?: string | null;
      // Refine type of pageContext.Page
    }
  }
}

// If you define Vike.PageContext in a .d.ts file then
// make sure there is at least one export/import statement.
// Tell TypeScript this file isn't an ambient module:
export {};

import i18n from "i18next";
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import { initReactI18next } from "react-i18next";
import { getLangCookie } from "@/utils/cookies";
import { SUPPORTED_LANGUAGES, normalizeLang } from "./supportedLanguages";

export { SUPPORTED_LANGUAGES, normalizeLang };

// vite.config.ts replaces __I18N_VERSION__ with a per-build stamp. The typeof
// guard keeps this import-safe in any context the define might not reach (a
// test runner, a tool importing this module directly) — a missing stamp would
// otherwise throw a ReferenceError here and take down every translation.
const I18N_CACHE_VERSION =
  typeof __I18N_VERSION__ !== "undefined" ? __I18N_VERSION__ : "dev";

function detectLang(): string {
  const cookie = getLangCookie();
  if (cookie) return normalizeLang(cookie);
  return normalizeLang(navigator.language ?? "en");
}

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    ns: [
      "common",
      "landing",
      "auth",
      "feed",
      "management",
      "tutorials",
      "pos",
      "station",
      "diner",
      "profile",
      "jobs",
      "marketplace",
      "business",
      "menu_board",
    ],
    defaultNS: "common",
    fallbackNS: "common",
    lng: typeof window !== "undefined" ? detectLang() : "en",
    fallbackLng: "en",
    backend: {
      // LocalStorageBackend goes first: ChainedBackend tries each backend in
      // order and stops at the first hit, and writes back into any backend
      // before the one that actually served the data — so a cache hit here
      // skips the HTTP round trip entirely, and a miss falls through to the
      // static JSON and gets cached for next time. Tolgee is intentionally
      // not in this chain (see Known Doc Drift in CLAUDE.md / memory) — the
      // static JSON in public/locales is the single source of truth now.
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 24 * 60 * 60 * 1000,
          // Stamped fresh by vite.config.ts on every build. LocalStorageBackend
          // treats a cached entry whose stored version differs from this as a
          // miss, so a deploy that adds or edits copy shows up immediately
          // instead of waiting out the 24h expiry on every warm browser.
          defaultVersion: I18N_CACHE_VERSION,
        },
        { loadPath: "/locales/{{lng}}/{{ns}}.json" },
      ],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// P1-6 (QA, 2026-11-18): <html lang> was always "en" — this keeps it correct on every
// in-app language change (vike-react's own `lang` config in pages/+config.ts handles the
// SSR/first-render case from the request cookie, since this i18n instance is a
// server-shared singleton and can't safely hold one request's language across others).
if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
  i18n.on("languageChanged", (lng) => {
    document.documentElement.lang = lng;
  });
}

export default i18n;

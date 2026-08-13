import i18n from "i18next";
import ChainedBackend from "i18next-chained-backend";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { DevBackend, FormatSimple, I18nextPlugin, Tolgee, tolgeeBackend } from "@tolgee/i18next";
import { getLangCookie } from "@/utils/cookies";

function detectLang(): string {
  const cookie = getLangCookie();
  if (cookie) return cookie;
  const browser = navigator.language?.split("-")[0] ?? "en";
  return ["en", "fr", "es", "cat"].includes(browser) ? browser : "en";
}

// DevBackend is registered explicitly (instead of via Tolgee's DevTools() helper) so live
// fetching from the Tolgee API works the same in dev and prod builds — DevTools() only wires
// up fetching in dev builds by default, since it's meant to gate the in-context editing overlay.
const tolgee = Tolgee()
  .use(DevBackend())
  .use(I18nextPlugin())
  .use(FormatSimple())
  .init({
    apiUrl: import.meta.env.VITE_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_TOLGEE_API_KEY,
  });

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
      backends: [tolgeeBackend(tolgee), HttpBackend],
      backendOptions: [{}, { loadPath: "/locales/{{lng}}/{{ns}}.json" }],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

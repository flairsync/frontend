import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DevBackend, FormatSimple, I18nextPlugin, Tolgee, tolgeeBackend } from "@tolgee/i18next";
import { getLangCookie } from "@/utils/cookies";

export const SUPPORTED_LANGUAGES = ["en", "fr-FR", "es-ES", "ca"] as const;

// Maps a base subtag (from a browser Accept-Language value, or a cookie set before this
// project switched to full BCP-47 tags matching Tolgee's project languages) to the supported
// tag it corresponds to.
const BASE_LANG_MAP: Record<string, (typeof SUPPORTED_LANGUAGES)[number]> = {
  en: "en",
  fr: "fr-FR",
  es: "es-ES",
  ca: "ca",
  cat: "ca",
};

function normalizeLang(lang: string): (typeof SUPPORTED_LANGUAGES)[number] {
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    return lang as (typeof SUPPORTED_LANGUAGES)[number];
  }
  const base = lang.split("-")[0].toLowerCase();
  return BASE_LANG_MAP[base] ?? "en";
}

function detectLang(): string {
  const cookie = getLangCookie();
  if (cookie) return normalizeLang(cookie);
  return normalizeLang(navigator.language ?? "en");
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
  .use(tolgeeBackend(tolgee))
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
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

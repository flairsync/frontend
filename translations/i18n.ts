import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import { getLangCookie } from "@/utils/cookies";

function detectLang(): string {
  const cookie = getLangCookie();
  if (cookie) return cookie;
  const browser = navigator.language?.split("-")[0] ?? "en";
  return ["en", "fr", "es", "cat"].includes(browser) ? browser : "en";
}

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    ns: ["common", "landing", "auth", "feed", "management", "tutorials"],
    defaultNS: "common",
    fallbackNS: "common",
    lng: typeof window !== "undefined" ? detectLang() : "en",
    fallbackLng: "en",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

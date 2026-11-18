// Pure, side-effect-free (no i18next import) on purpose — safe to import from
// translations/i18n.ts (the stateful i18next singleton) AND from pages/+config.ts, which
// Vike may statically analyse/evaluate outside a normal runtime, where importing a module
// that calls i18next.init() at import time would be unsafe.
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

export function normalizeLang(lang: string): (typeof SUPPORTED_LANGUAGES)[number] {
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    return lang as (typeof SUPPORTED_LANGUAGES)[number];
  }
  const base = lang.split("-")[0].toLowerCase();
  return BASE_LANG_MAP[base] ?? "en";
}

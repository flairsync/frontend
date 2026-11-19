import type { PageContext } from "vike/types";
import { normalizeLang } from "../translations/supportedLanguages.js";

// P1-6 (QA, 2026-11-18): <html lang> was always "en". `langCookie` is read server-side
// from the fs_lang cookie (server/index.js), the same way uiMode already is — this sets
// the real attribute from the very first SSR response. In-app language changes (no
// navigation) are kept in sync separately, in translations/i18n.ts.
//
// Defined in its own file (rather than inline in +config.ts) because Vike requires any
// function-valued config to live in a separate +<name>.js file — see
// https://vike.dev/error/runtime-in-config
export const lang = (pageContext: PageContext) => normalizeLang(pageContext.langCookie ?? "en");

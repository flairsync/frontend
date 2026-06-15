import { parse, serialize } from "cookie";

const CONSENT_KEY = "fs_cookie_consent";
const LANG_KEY = "fs_lang";
const MAX_AGE = 60 * 60 * 24 * 365;

export type CookieConsent = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function getCookieConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  if (!cookies[CONSENT_KEY]) return null;
  try {
    return JSON.parse(cookies[CONSENT_KEY]) as CookieConsent;
  } catch {
    return null;
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(CONSENT_KEY, JSON.stringify(consent), {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export function getLangCookie(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  return cookies[LANG_KEY] ?? null;
}

export function setLangCookie(lang: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(LANG_KEY, lang, {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

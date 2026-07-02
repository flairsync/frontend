import { parse, serialize } from "cookie";

const CONSENT_KEY = "fs_cookie_consent";
const LANG_KEY = "fs_lang";
const TABLE_KEY = "fs_table";
const MAX_AGE = 60 * 60 * 24 * 365;
// A scanned table represents one dining visit, not a lasting preference — expire it
// well before it could realistically bleed into a future, unrelated visit.
const TABLE_MAX_AGE = 60 * 60 * 6;

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

export type ScannedTable = { businessId: string; tableId: string };

export function getTableCookie(): ScannedTable | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  if (!cookies[TABLE_KEY]) return null;
  try {
    return JSON.parse(cookies[TABLE_KEY]) as ScannedTable;
  } catch {
    return null;
  }
}

export function setTableCookie(businessId: string, tableId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(TABLE_KEY, JSON.stringify({ businessId, tableId }), {
    maxAge: TABLE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

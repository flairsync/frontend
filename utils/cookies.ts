import { parse, serialize } from "cookie";

const CONSENT_KEY = "fs_cookie_consent";
const LANG_KEY = "fs_lang";
const TABLE_KEY = "fs_table";
const ORDER_KEY = "fs_order";
const EMAIL_PROMPT_SEEN_KEY = "fs_email_prompt_seen";
const FEEDBACK_PROMPT_SEEN_KEY = "fs_feedback_prompt_seen";
const PW_BREACH_DISMISSED_KEY = "fs_pw_breach_dismissed";
const UI_MODE_KEY = "fs_ui_mode";
const HIDDEN_TILES_KEY = "fs_hidden_tiles";
const MAX_AGE = 60 * 60 * 24 * 365;
// A scanned table represents one dining visit, not a lasting preference — expire it
// well before it could realistically bleed into a future, unrelated visit.
const TABLE_MAX_AGE = 60 * 60 * 6;
// A guest order is only trackable for the same dining visit as the table scan.
const ORDER_MAX_AGE = 60 * 60 * 6;

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

// qrToken proves this table's QR code was actually scanned — it's the `qt` query
// param FlairSync signs into every table's /tbl/... link server-side (see the API's
// table-qr-token.util.ts) — as opposed to a businessId/tableId pair typed in or
// copied from somewhere else. Optional only so a link scanned before this existed
// (or with the param stripped) still resolves to *a* table; it just won't be able
// to place an order or occupy that table without rescanning (see usages).
export type ScannedTable = { businessId: string; tableId: string; qrToken?: string };

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

export function setTableCookie(businessId: string, tableId: string, qrToken?: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(TABLE_KEY, JSON.stringify({ businessId, tableId, qrToken }), {
    maxAge: TABLE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export type GuestOrder = { businessId: string; orderId: string };

// Lets an unauthenticated diner keep track of the order they just placed —
// the backend has no guest identity, so this cookie is the only thing
// that lets them find it again after a page reload.
export function getGuestOrderCookie(): GuestOrder | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  if (!cookies[ORDER_KEY]) return null;
  try {
    return JSON.parse(cookies[ORDER_KEY]) as GuestOrder;
  } catch {
    return null;
  }
}

export function setGuestOrderCookie(businessId: string, orderId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(ORDER_KEY, JSON.stringify({ businessId, orderId }), {
    maxAge: ORDER_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export function clearGuestOrderCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(ORDER_KEY, "", {
    maxAge: 0,
    path: "/",
    sameSite: "lax",
  });
}

// Tracks which order the guest email prompt has already been shown/dismissed
// for, so a refresh doesn't re-annoy them with it for the same order.
export function getEmailPromptSeenOrderId(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  return cookies[EMAIL_PROMPT_SEEN_KEY] ?? null;
}

export function setEmailPromptSeenOrderId(orderId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(EMAIL_PROMPT_SEEN_KEY, orderId, {
    maxAge: ORDER_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

// Tracks which order the feedback prompt has already been shown/dismissed
// for, so a refresh doesn't re-annoy the guest for the same order.
export function getFeedbackPromptSeenOrderId(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  return cookies[FEEDBACK_PROMPT_SEEN_KEY] ?? null;
}

export function setFeedbackPromptSeenOrderId(orderId: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(FEEDBACK_PROMPT_SEEN_KEY, orderId, {
    maxAge: ORDER_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

// Stores the passwordBreachedAt value the user dismissed the breach banner
// for, so the dismissal survives reloads/re-logins without needing a DB
// column. Keyed to that timestamp (not a bare boolean) so if the password
// is fixed and later shows up breached again with a new timestamp, the
// banner reappears instead of staying silenced forever.
export function getPasswordBreachDismissedAt(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  return cookies[PW_BREACH_DISMISSED_KEY] ?? null;
}

export function setPasswordBreachDismissedAt(breachedAt: string): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(PW_BREACH_DISMISSED_KEY, breachedAt, {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export type UiMode = "simple" | "advanced";

export function isUiMode(value: unknown): value is UiMode {
  return value === "simple" || value === "advanced";
}

// Which management shell the user gets: "simple" is the icon/tile-driven Easy
// View, "advanced" is the original sidebar. A cookie (not localStorage) so the
// Hono middleware can read it and hand it to the first SSR render — otherwise
// every manage page would flash the wrong shell before hydration.
//
// Deliberately per-device: a shared floor tablet and the owner's laptop are
// different users in practice even when they're the same account.
export function getUiModeCookie(): UiMode | null {
  if (typeof document === "undefined") return null;
  const cookies = parse(document.cookie);
  const value = cookies[UI_MODE_KEY];
  return isUiMode(value) ? value : null;
}

export function setUiModeCookie(mode: UiMode): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(UI_MODE_KEY, mode, {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

// Tile keys the user has chosen to hide from their Easy View launcher, stored
// per-device alongside the mode itself. Hiding is presentation-only: a hidden
// tile stays reachable through search, Full View and direct links, so this can
// never lock anyone out of a feature they still have permission for.
export function getHiddenTiles(): string[] {
  if (typeof document === "undefined") return [];
  const cookies = parse(document.cookie);
  if (!cookies[HIDDEN_TILES_KEY]) return [];
  try {
    const parsed = JSON.parse(cookies[HIDDEN_TILES_KEY]);
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

export function setHiddenTiles(keys: string[]): void {
  if (typeof document === "undefined") return;
  document.cookie = serialize(HIDDEN_TILES_KEY, JSON.stringify(keys), {
    maxAge: MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

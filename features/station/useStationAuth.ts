import { getSecureItem, saveSecureItem, removeSecureItem } from "@/misc/SecureStorage";

const DEVICE_UUID_KEY = "flairsync_device_uuid";
const TOKEN_KEYS = {
  pos: "flairsync_station_token_pos",
  kds: "flairsync_station_token_kds",
} as const;

// Active type is set by StationBootstrap before any API calls are made.
// Each browser tab runs its own module instance, so concurrent pos+kds tabs are safe.
let _activeType: "pos" | "kds" = "pos";

export function setActiveStationType(type: "pos" | "kds"): void {
  _activeType = type;
}

export function getOrCreateDeviceUuid(): string {
  let uuid = localStorage.getItem(DEVICE_UUID_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(DEVICE_UUID_KEY, uuid);
  }
  return uuid;
}

export function getStationToken(): string | null {
  const key = TOKEN_KEYS[_activeType];
  const secureToken = getSecureItem(key);
  if (secureToken) return secureToken;

  // One-time migration: devices paired before tokens moved to SecureStorage
  // still have their token in plain localStorage under the same key. Move it
  // over so already-paired stations don't get bounced back to the pairing screen.
  const legacyToken = localStorage.getItem(key);
  if (legacyToken) {
    saveSecureItem(key, legacyToken);
    localStorage.removeItem(key);
    return legacyToken;
  }

  return null;
}

export function saveStationToken(token: string): void {
  saveSecureItem(TOKEN_KEYS[_activeType], token);
}

export function clearStationToken(): void {
  removeSecureItem(TOKEN_KEYS[_activeType]);
}

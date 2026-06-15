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
  return localStorage.getItem(TOKEN_KEYS[_activeType]);
}

export function saveStationToken(token: string): void {
  localStorage.setItem(TOKEN_KEYS[_activeType], token);
}

export function clearStationToken(): void {
  localStorage.removeItem(TOKEN_KEYS[_activeType]);
}

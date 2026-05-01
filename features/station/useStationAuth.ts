const DEVICE_UUID_KEY = "flairsync_device_uuid";
const STATION_TOKEN_KEY = "flairsync_station_token";

export function getOrCreateDeviceUuid(): string {
  let uuid = localStorage.getItem(DEVICE_UUID_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(DEVICE_UUID_KEY, uuid);
  }
  return uuid;
}

export function getStationToken(): string | null {
  return localStorage.getItem(STATION_TOKEN_KEY);
}

export function saveStationToken(token: string): void {
  localStorage.setItem(STATION_TOKEN_KEY, token);
}

export function clearStationToken(): void {
  localStorage.removeItem(STATION_TOKEN_KEY);
}

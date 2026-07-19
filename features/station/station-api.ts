import axios from "axios";
import { getStationToken, clearStationToken } from "./useStationAuth";
import { useStaffSession } from "@/features/pos/useStaffSession";
import { attachRequestDedupe, attachNetworkErrorToast } from "@/lib/flairapi";

// These three clients intentionally do NOT share the app-wide `flairapi` instance.
// Station/POS/KDS devices authenticate with a Bearer device token (+ a staff short
// token for write ops) instead of flairapi's cookie session, and they recover from
// a 401 by re-pairing/re-PIN-ing rather than flairapi's cookie-refresh flow — the
// backend's station/staff guards throw plain UnauthorizedExceptions with no
// `auth.token.expired` code, so flairapi's refresh branch would never even fire for
// them. What they were missing was the *shared* baseline behavior every axios client
// in this app should have — request dedupe and a visible toast on network/5xx
// failures — so that's wired in explicitly below instead of being silently absent.
const STATION_TIMEOUT_MS = 30_000; // shorter than flairapi's 60s default: fail fast on a flaky restaurant WiFi/kiosk connection

// Station-authenticated requests (uses device token via Bearer header)
export const stationApi = axios.create({
  baseURL: 'https://api.flairsync.com/api/v1',
  timeout: STATION_TIMEOUT_MS,
});
attachRequestDedupe(stationApi);

stationApi.interceptors.request.use((config) => {
  const token = getStationToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

stationApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      clearStationToken();
      window.location.reload(); // triggers PairingScreen on next load
    }
    return Promise.reject(err);
  }
);
attachNetworkErrorToast(stationApi);

// Staff-authenticated requests: device token in Authorization + staff short token in X-Staff-Token
// Both headers are required for all write operations per the station API spec
export const staffApi = axios.create({
  baseURL: 'https://api.flairsync.com/api/v1',
  timeout: STATION_TIMEOUT_MS,
});
attachRequestDedupe(staffApi);

staffApi.interceptors.request.use((config) => {
  const deviceToken = getStationToken();
  if (deviceToken) config.headers["Authorization"] = `Bearer ${deviceToken}`;
  const session = useStaffSession.getState().session;
  if (session) config.headers["X-Staff-Token"] = session.shortToken;
  return config;
});

staffApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // Staff short token expired — clear session to trigger PIN pad
      useStaffSession.getState().clearSession();
    }
    return Promise.reject(err);
  }
);
attachNetworkErrorToast(staffApi);

// Public endpoint for the pairing link call (no auth)
export const publicApi = axios.create({
  baseURL: 'https://api.flairsync.com/api/v1',
  timeout: STATION_TIMEOUT_MS,
});
attachRequestDedupe(publicApi);
attachNetworkErrorToast(publicApi);

// Calls POST /station/staff/pin-logout with both the device token (via Bearer) and the
// staff short token (via X-Staff-Token, added automatically by staffApi interceptor).
// The backend denylists the short token immediately so it cannot be reused.
export async function pinLogout(): Promise<void> {
  await staffApi.post('/station/staff/pin-logout');
}

// Lives here (not features/orders/service.ts) so callers can import it statically without
// pulling this station-only endpoint into the general orders module's dependency graph —
// that module is imported by the plain web admin dashboard too, which never needs a
// station device token.
export const reorderStationOrderApiCall = (
  orderId: string,
  data?: { type?: "dine_in" | "takeaway"; tableId?: string },
) => staffApi.patch(`/station/orders/${orderId}/reorder`, data ?? {});

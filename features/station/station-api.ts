import axios from "axios";
import { getStationToken, clearStationToken } from "./useStationAuth";
import { useStaffSession } from "@/features/pos/useStaffSession";

// Station-authenticated requests (uses device token via Bearer header)
export const stationApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
  timeout: 30000,
});

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

// Staff-authenticated requests: device token in Authorization + staff short token in X-Staff-Token
// Both headers are required for all write operations per the station API spec
export const staffApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
  timeout: 30000,
});

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

// Public endpoint for the pairing link call (no auth)
export const publicApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
  timeout: 30000,
});

// Calls POST /station/staff/pin-logout with both the device token (via Bearer) and the
// staff short token (via X-Staff-Token, added automatically by staffApi interceptor).
// The backend denylists the short token immediately so it cannot be reused.
export async function pinLogout(): Promise<void> {
  await staffApi.post('/station/staff/pin-logout');
}

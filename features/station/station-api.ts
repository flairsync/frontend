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

// Staff-authenticated requests (uses short PIN token for business routes)
// Reads from Zustand store via getState() — safe outside React components
export const staffApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
  timeout: 30000,
});

staffApi.interceptors.request.use((config) => {
  const session = useStaffSession.getState().session;
  if (session) config.headers["Authorization"] = `Bearer ${session.shortToken}`;
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

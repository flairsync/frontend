import axios, { type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import i18n from "@/translations/i18n";
import { useSystemErrorStore } from "@/features/system-errors/SystemErrorStore";
import { useSubscriptionStore } from "@/features/subscriptions/SubscriptionStore";
const baseUrl = `${import.meta.env.BASE_URL}/auth/refresh`;

import NProgress from "nprogress";

// Configure NProgress (optional tweak)
NProgress.configure({ showSpinner: false });

// Use these when a specific endpoint needs a tighter or looser bound than the default.
// e.g. flairapi.get('/search', { timeout: Timeouts.SHORT })
export const Timeouts = {
  SHORT: 10_000,    // simple reads, autocomplete
  DEFAULT: 60_000,  // general API calls (matches axios.create default below)
  UPLOAD: 300_000,  // file / image uploads, bulk operations
} as const;

const flairapi = axios.create({
  withCredentials: true,
  timeout: Timeouts.DEFAULT,
  headers: {
    "x-client-type": "web",
  },
});

// Deduplicate identical in-flight GET/HEAD requests so concurrent callers share one network call.
const inflightRequests = new Map<string, Promise<any>>();

const getDedupeKey = (config: InternalAxiosRequestConfig): string | null => {
  const method = (config.method ?? "get").toLowerCase();
  if (!["get", "head"].includes(method)) return null;
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${method}:${config.url ?? ""}:${params}`;
};

const capturedAdapter = flairapi.defaults.adapter;
flairapi.defaults.adapter = (config) => {
  const base: Function =
    typeof capturedAdapter === "function"
      ? capturedAdapter
      : (axios as any).getAdapter(capturedAdapter ?? ["fetch", "xhr", "http"]);

  const key = getDedupeKey(config);
  if (!key) return base(config);

  const existing = inflightRequests.get(key);
  if (existing) return existing;

  const promise = base(config).finally(() => inflightRequests.delete(key));
  inflightRequests.set(key, promise);
  return promise;
};

// To avoid multiple refreshes in parallel
let isRefreshing = false;
let failedQueue: any[] = [];
let activeRequests = 0;
let slowNetworkToastId: any = null;

const startRequest = () => {
  if (activeRequests === 0) {
    NProgress.start();
    // Set a timer to show a hint if requests are taking too long (> 2s to be safe/responsive, or 4s as requested)
    // Using 4s to avoid flashing on merely "kind of slow" 3G
    showSlowNetworkHint();
  }
  activeRequests++;
};

const endRequest = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    NProgress.done();
    clearSlowNetworkHint();
  }
};

const showSlowNetworkHint = () => {
  // Clear any existing timer to avoid duplicates
  if (slowNetworkToastId) clearTimeout(slowNetworkToastId);

  slowNetworkToastId = setTimeout(() => {
    if (activeRequests > 0) {
      toast.info(i18n.t("errors.network.slow_loading", "Taking longer than expected..."), {
        id: "slow-network-hint", // Use ID to prevent duplicates if multiple requests trigger it
        duration: 5000,
      });
    }
  }, 4000); // 4 seconds threshold
};

const clearSlowNetworkHint = () => {
  if (slowNetworkToastId) {
    clearTimeout(slowNetworkToastId);
    slowNetworkToastId = null;
  }
  // Optional: Dismiss the toast if it's still showing? 
  // Usually better to let it fade or user dismiss it, otherwise it might flash too quickly.
  // toast.dismiss("slow-network-hint"); 
};


const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor
flairapi.interceptors.request.use(
  (config) => {
    startRequest();
    return config;
  },
  (error) => {
    endRequest();
    return Promise.reject(error);
  }
);

// Add response interceptor
flairapi.interceptors.response.use(
  (response) => {
    endRequest();
    return response;
  },
  async (error) => {
    endRequest();
    const originalRequest = error.config;

    // If backend sends a specific error code (ex: 'auth.token.expired')
    const errorCode = error.response?.data?.code;

    if (errorCode === "auth.token.expired" && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return flairapi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await flairapi.post(baseUrl);

        processQueue(null, null);
        return flairapi(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          if (refreshError?.response?.data?.code === "auth.session.expired") {
            localStorage.setItem('auth_logout_reason', 'inactivity');
            window.location.href = '/login';
          } else {
            window.location.reload();
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle Subscription Limits (403 Forbidden with limit_reached code or explicit legacy business message)
    if (error.response?.status === 403) {
      if ((errorCode as string)?.includes("limit_reached") || error.response?.data?.message?.includes("Upgrade your subscription to access this business")) {
        useSubscriptionStore.getState().openUpgradeModal(
          error.response?.data?.message || i18n.t("subscriptions.errors.limit_reached")
        );
        return Promise.reject(error);
      } else {
        useSystemErrorStore.getState().openPermissionDenied();
        return Promise.reject(error);
      }
    }

    // Global Error Handling for UI Feedback
    if (typeof window !== "undefined") {
      console.error("API ERROR DETECTED:", error);

      if (!error.response) {
        // Network error (CORS, offline, timeout, etc.)
        // Ensure strictly 'timeout' or 'network error' logic if needed, but !response covers both usually
        console.warn("NETWORK/CORS/TIMEOUT ERROR DETECTED - LOCKING APP");
        useSystemErrorStore.getState().lock('network');

        // Use more specific message if it's a timeout
        if (error.code === 'ECONNABORTED') {
          toast.error(i18n.t("errors.technical.timeout_error", "Request timed out. Please try again."));
        } else {
          toast.error(i18n.t("errors.technical.network_error"));
        }
      } else if (error.response.status >= 500) {
        // Server error
        console.warn("SERVER ERROR DETECTED - LOCKING APP");
        useSystemErrorStore.getState().lock('server');
        toast.error(i18n.t("errors.technical.server_error"));
      }
    }

    return Promise.reject(error);
  }
);

export default flairapi;

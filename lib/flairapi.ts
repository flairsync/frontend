import axios from "axios";
import { toast } from "sonner";
import i18n from "@/translations/i18n";
import { useSystemErrorStore } from "@/features/system-errors/SystemErrorStore";
const baseUrl = `${import.meta.env.BASE_URL}/auth/refresh`;

import NProgress from "nprogress";

// Configure NProgress (optional tweak)
NProgress.configure({ showSpinner: false });

const flairapi = axios.create({
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout to handle slow cold starts
});

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
          .then((token) => {
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
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear session by reloading
        if (typeof window !== "undefined") {
          window.location.reload();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

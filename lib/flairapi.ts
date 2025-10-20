import axios from "axios";
const baseUrl = `${import.meta.env.BASE_URL}/auth/refresh`;

const flairapi = axios.create({
  withCredentials: true,
});

// To avoid multiple refreshes in parallel
let isRefreshing = false;
let failedQueue: any[] = [];

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

// Add response interceptor
flairapi.interceptors.response.use(
  (response) => response,
  async (error) => {
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

    return Promise.reject(error);
  }
);

export default flairapi;

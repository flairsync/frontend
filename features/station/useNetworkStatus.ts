import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/flairapi";

const HEALTH_CHECK_INTERVAL_MS = 15_000;
const HEALTH_CHECK_TIMEOUT_MS = 8_000;

// Deliberately bypasses flairapi: a failed health probe must update this hook's
// state quietly, not trigger flairapi's global network-lock screen and toast —
// those are for a real action the user took failing, not a background poll.
async function isBackendReachable(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

// True only when both the local network interface is up AND the backend
// actually answers. navigator.onLine alone misses the common real-world
// outage: WiFi stays "online" while the backend itself is unreachable.
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  const checkingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      const reachable = await isBackendReachable();
      checkingRef.current = false;
      if (!cancelled) setIsOnline(reachable);
    };

    const handleOffline = () => setIsOnline(false);
    // The NIC coming back doesn't mean the backend is reachable — confirm it.
    const handleOnline = () => runCheck();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    runCheck();
    const interval = setInterval(runCheck, HEALTH_CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}

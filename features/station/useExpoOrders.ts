import { useQuery } from "@tanstack/react-query";
import { fetchExpoOrdersApiCall, type ExpoOrder } from "./expo.service";

export const EXPO_ORDERS_QUERY_KEY = ["kds_orders", "expo"];

// Expo is read-heavy, so poll every 12s rather than relying on the KDS websocket.
export const useExpoOrders = () => {
  return useQuery({
    queryKey: EXPO_ORDERS_QUERY_KEY,
    queryFn: async (): Promise<ExpoOrder[]> => {
      const incoming = await fetchExpoOrdersApiCall();
      return [...incoming].sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    },
    refetchInterval: 12_000,
  });
};

import { useQuery } from "@tanstack/react-query";
import { fetchAlertsApiCall } from "./service";

export const useAlerts = (businessId?: string) => {
    const { data, isFetching: fetchingAlerts, refetch: refetchAlerts } = useQuery({
        queryKey: ["alerts", businessId],
        queryFn: () => fetchAlertsApiCall(businessId!),
        enabled: !!businessId,
        refetchInterval: 60_000,
    });

    return {
        alerts: data?.alerts ?? [],
        alertCount: data?.count ?? 0,
        fetchingAlerts,
        refetchAlerts,
    };
};

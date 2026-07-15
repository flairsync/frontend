import { useQuery } from "@tanstack/react-query";
import { regionsApi, RegionDashboard } from "./regions";

export const useRegionDashboard = (regionId: string, start: string, end: string) => {
    const { data, isFetching: loadingDashboard, refetch: refreshDashboard } = useQuery<RegionDashboard>({
        queryKey: ["region-dashboard", regionId, start, end],
        queryFn: () => regionsApi.dashboard(regionId, start, end),
        enabled: !!regionId && !!start && !!end,
    });

    return {
        dashboard: data,
        loadingDashboard,
        refreshDashboard,
    };
};

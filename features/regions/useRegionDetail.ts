import { useQuery } from "@tanstack/react-query";
import { regionsApi, RegionDetail } from "./regions";

export const useRegionDetail = (regionId: string) => {
    const { data, isFetching: loadingRegion, refetch: refreshRegion } = useQuery<RegionDetail>({
        queryKey: ["region", regionId],
        queryFn: () => regionsApi.detail(regionId),
        enabled: !!regionId,
    });

    return {
        region: data?.region,
        businesses: data?.businesses || [],
        organizationName: data?.organizationName ?? null,
        loadingRegion,
        refreshRegion,
    };
};

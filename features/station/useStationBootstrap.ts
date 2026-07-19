import { useQuery } from "@tanstack/react-query";
import { fetchStationBootstrapApiCall } from "./bootstrap.service";

// `enabled` should be false until the caller has confirmed a station token exists
// (see components/station/StationBootstrap.tsx) — there's nothing to fetch before that.
export const useStationBootstrap = (enabled: boolean) => {
  return useQuery({
    queryKey: ["station_bootstrap"],
    queryFn: fetchStationBootstrapApiCall,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

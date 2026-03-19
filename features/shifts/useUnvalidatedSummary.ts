import { useQuery } from "@tanstack/react-query";
import { fetchUnvalidatedShiftSummaryApiCall, UnvalidatedShiftSummary } from "./service";

export const useUnvalidatedSummary = (businessId: string, weeks: number = 4) => {
  return useQuery<UnvalidatedShiftSummary>({
    queryKey: ["unvalidated_summary", businessId, weeks],
    queryFn: async () => {
      const resp = await fetchUnvalidatedShiftSummaryApiCall(businessId, weeks);
      const resData = resp.data;
      return resData?.data !== undefined ? resData.data : resData;
    },
    enabled: !!businessId,
  });
};

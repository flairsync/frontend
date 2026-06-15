import { useQuery } from "@tanstack/react-query";
import { fetchUnvalidatedShiftSummaryApiCall, UnvalidatedShiftSummary } from "./service";

export const useUnvalidatedSummary = (businessId: string, weeks: number = 4) => {
  return useQuery<UnvalidatedShiftSummary>({
    queryKey: ["unvalidated_summary", businessId, weeks],
    queryFn: () => fetchUnvalidatedShiftSummaryApiCall(businessId, weeks),
    enabled: !!businessId,
  });
};

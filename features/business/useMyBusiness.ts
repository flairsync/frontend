import { useQuery } from "@tanstack/react-query";
import { fetchMyBuysinessFullDetailsApiCall } from "./service";
import { MyBusinessFullDetails } from "@/models/business/MyBusinessFullDetails";

export const useMyBusiness = (businessId: string | null = null) => {
  const {
    data: myBusinessFullDetails,
    isFetching: fetchingMyBusinessFullDetails,
  } = useQuery({
    queryKey: ["my_business", businessId],
    queryFn: async () => {
      if (!businessId) return;
      const res = await fetchMyBuysinessFullDetailsApiCall(businessId);
      return MyBusinessFullDetails.parseApiResponse(res.data.data);
    },
    enabled: businessId != null,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  return {
    myBusinessFullDetails,
    fetchingMyBusinessFullDetails,
  };
};

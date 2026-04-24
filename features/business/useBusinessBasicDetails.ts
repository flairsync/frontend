import { useQuery } from "@tanstack/react-query";
import { fetchBusinessBasicDetailsApiCall } from "./service";

export interface BusinessBasicDetails {
  id: string;
  name: string;
  logo: string | null;
  location: {
    type: string;
    coordinates: number[];
  } | null;
  timezone: string;
  currency: string;
  address: string | null;
  city: string | null;
  country?: {
    id: number;
    name: string;
  };
  requireGpsForAttendance?: boolean;
}

export const useBusinessBasicDetails = (businessId: string | null = null) => {
  const {
    data: businessBasicDetails,
    isFetching: fetchingBusinessBasicDetails,
  } = useQuery<BusinessBasicDetails | undefined>({
    queryKey: ["business_basic_details", businessId],
    queryFn: async () => {
      if (!businessId) return undefined;
      const res = await fetchBusinessBasicDetailsApiCall(businessId);
      return res.data?.data;
    },
    enabled: !!businessId,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  return {
    businessBasicDetails,
    fetchingBusinessBasicDetails,
  };
};

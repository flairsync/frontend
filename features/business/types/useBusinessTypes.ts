import { useQuery } from "@tanstack/react-query";
import { getBusinessTypesApiCall } from "../service";
import { BusinessType } from "@/models/business/BusinessType";

export const useBusinessTypes = () => {
  const { data: businessTypes } = useQuery({
    queryKey: ["business_types"],
    queryFn: async () => {
      const d = await getBusinessTypesApiCall();
      return BusinessType.parseApiArrayResponse(d.data.data);
    },
  });

  return {
    businessTypes,
  };
};

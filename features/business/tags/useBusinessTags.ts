import { useQuery } from "@tanstack/react-query";
import { getBusinessTagsApiCall } from "../service";
import { BusinessTag } from "@/models/business/BusinessTag";

export const useBusinessTags = () => {
  const { data: businessTags } = useQuery({
    queryKey: ["business_tags"],
    queryFn: async () => {
      const d = await getBusinessTagsApiCall();
      return BusinessTag.parseApiArrayResponse(Array.isArray(d) ? d : []);
    },
  });

  return {
    businessTags,
  };
};

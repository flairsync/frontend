import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyBusinessesApiCall } from "./service";
import { MyBusiness } from "@/models/business/MyBusiness";

export const useMyBusinesses = (page: number = 1, limit: number = 10) => {
  const queryClient = useQueryClient();

  const {
    data: myBusinesses,
    isFetching: loadingMyBussinesses,
    refetch: refreshMyBusinesses,
  } = useQuery({
    queryKey: ["my_businesses", page, limit],
    queryFn: async () => {
      const res = await fetchMyBusinessesApiCall(page, limit);
      const data = res.data.data;

      if (data.usage) {
        queryClient.setQueryData(["user_usage"], data.usage);
      }

      return {
        myBusinesses: MyBusiness.parseApiArrayResponse(data.businesses || []),
        usage: data.usage
      };
    },
  });

  return {
    myBusinesses: myBusinesses?.myBusinesses || [],
    usage: myBusinesses?.usage,
    loadingMyBussinesses,
    refreshMyBusinesses,
  };
};

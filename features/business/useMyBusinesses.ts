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
    staleTime: Infinity,
    queryFn: async () => {
      const res = await fetchMyBusinessesApiCall(page, limit) as any;

      if (res.usage) {
        queryClient.setQueryData(["user_usage"], res.usage);
      }

      return {
        myBusinesses: MyBusiness.parseApiArrayResponse(res.businesses || res.data || []),
        usage: res.usage
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

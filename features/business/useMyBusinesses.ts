import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchMyBusinessesApiCall } from "./service";
import { MyBusiness } from "@/models/business/MyBusiness";

export const useMyBusinesses = (page: number = 1, limit: number = 10) => {
  const {
    data: myBusinesses,
    isFetching: loadingMyBussinesses,
    refetch: refreshMyBusinesses,
  } = useQuery({
    queryKey: ["my_businesses", page, limit],
    queryFn: async () => {
      const res = await fetchMyBusinessesApiCall(page, limit);
      return MyBusiness.parseApiArrayResponse(res.data.data);
    },
  });

  return {
    myBusinesses,
    loadingMyBussinesses,
    refreshMyBusinesses,
  };
};

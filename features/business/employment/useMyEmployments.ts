import { useQuery } from "@tanstack/react-query";
import { fetchMyEmploymentsApiCall } from "../service";
import { MyEmployment } from "@/models/business/MyEmployment";

export const useMyEmployments = (page: number = 1, limit: number = 10) => {
    const {
        data: myEmployments,
        isFetching: loadingMyEmployments,
        refetch: refreshMyEmployments,
    } = useQuery({
        queryKey: ["my_employments", page, limit],
        queryFn: async () => {
            const res = await fetchMyEmploymentsApiCall(page, limit);
            // The API returns a paginated object in res.data.data, 
            // and the actual array is in res.data.data.data
            return MyEmployment.parseApiArrayResponse(res.data.data.data || []);
        },
    });

    return {
        myEmployments,
        loadingMyEmployments,
        refreshMyEmployments,
    };
};

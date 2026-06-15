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
            return MyEmployment.parseApiArrayResponse(res.data || []);
        },
    });

    return {
        myEmployments,
        loadingMyEmployments,
        refreshMyEmployments,
    };
};

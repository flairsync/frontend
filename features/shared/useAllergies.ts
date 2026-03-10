import { useQuery } from "@tanstack/react-query";
import { fetchAllergiesApiCall } from "./service";
import { Allergy } from "@/models/shared/Allergy";

export const useAllergies = () => {
    const { data: allergies, isFetching: fetchingAllergies } = useQuery({
        queryKey: ["allergies"],
        queryFn: async () => {
            const res = await fetchAllergiesApiCall();
            return Allergy.parseApiArrayResponse(res.data.data);
        },
        staleTime: Infinity,
        gcTime: Infinity,
    });

    return { allergies, fetchingAllergies };
};

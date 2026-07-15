import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { regionsApi, Region } from "./regions";

export const useRegions = () => {
    const queryClient = useQueryClient();

    const { data: regions = [], isFetching: loadingRegions } = useQuery<Region[]>({
        queryKey: ["regions"],
        queryFn: () => regionsApi.listMine(),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => regionsApi.create(name),
        onSuccess: () => {
            toast.success("Region created");
            queryClient.invalidateQueries({ queryKey: ["regions"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create region");
        },
    });

    return {
        regions,
        loadingRegions,
        createRegion: createMutation.mutate,
        isCreatingRegion: createMutation.isPending,
    };
};

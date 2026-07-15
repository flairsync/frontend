import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationsApi, Organization } from "./organizations";

export const useOrganizations = () => {
    const queryClient = useQueryClient();

    const { data: organizations = [], isFetching: loadingOrganizations } = useQuery<Organization[]>({
        queryKey: ["organizations"],
        queryFn: () => organizationsApi.listMine(),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => organizationsApi.create(name),
        onSuccess: () => {
            toast.success("Organization created");
            queryClient.invalidateQueries({ queryKey: ["organizations"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create organization");
        },
    });

    return {
        organizations,
        loadingOrganizations,
        createOrganization: createMutation.mutate,
        isCreatingOrganization: createMutation.isPending,
    };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchInventoryGroupsApiCall,
    createInventoryGroupApiCall,
    updateInventoryGroupApiCall,
    deleteInventoryGroupApiCall,
    CreateInventoryGroupDto
} from "./service";
import { InventoryGroup } from "@/models/inventory/InventoryGroup";
import { toast } from "sonner";

export const useInventoryGroups = (businessId: string) => {
    const queryClient = useQueryClient();

    const {
        data: inventoryGroups,
        isFetching: fetchingInventoryGroups,
        refetch: refreshInventoryGroups,
    } = useQuery({
        queryKey: ["inventory_groups", businessId],
        queryFn: async () => {
            const resp = await fetchInventoryGroupsApiCall(businessId);
            if (resp.data.success) {
                // Support both flat and paginated structures
                const groupsData = resp.data.data.data || resp.data.data;
                return InventoryGroup.parseApiArrayResponse(groupsData);
            }
            return [];
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const createGroupMutation = useMutation({
        mutationFn: (data: CreateInventoryGroupDto) => createInventoryGroupApiCall(businessId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_groups", businessId] });
            toast.success("Group created successfully");
        },
        onError: () => {
            toast.error("Failed to create group");
        }
    });

    const updateGroupMutation = useMutation({
        mutationFn: ({ groupId, data }: { groupId: string, data: CreateInventoryGroupDto }) =>
            updateInventoryGroupApiCall(businessId, groupId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_groups", businessId] });
            toast.success("Group updated successfully");
        },
        onError: () => {
            toast.error("Failed to update group");
        }
    });

    const deleteGroupMutation = useMutation({
        mutationFn: (groupId: string) => deleteInventoryGroupApiCall(businessId, groupId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory_groups", businessId] });
            toast.success("Group deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete group");
        }
    });

    return {
        inventoryGroups,
        fetchingInventoryGroups,
        refreshInventoryGroups,
        createGroup: createGroupMutation.mutateAsync,
        isCreatingGroup: createGroupMutation.isPending,
        updateGroup: updateGroupMutation.mutateAsync,
        isUpdatingGroup: updateGroupMutation.isPending,
        deleteGroup: deleteGroupMutation.mutateAsync,
        isDeletingGroup: deleteGroupMutation.isPending,
    };
};

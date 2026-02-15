import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchFloorsApiCall,
    createFloorApiCall,
    updateFloorApiCall,
    deleteFloorApiCall,
    fetchTablesApiCall,
    createTableApiCall,
    updateTableApiCall,
    deleteTableApiCall,
    CreateFloorDto,
    UpdateFloorDto,
    CreateTableDto,
    UpdateTableDto
} from "./service";

export const useFloors = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: floors, isFetching: fetchingFloors, refetch } = useQuery({
        queryKey: ["floors", businessId],
        queryFn: async () => {
            try {
                const resp = await fetchFloorsApiCall(businessId);
                const resData = resp.data;
                // Defensive extraction: look for data in resData.data or resData
                const actualData = resData?.data !== undefined ? resData.data : resData;

                if (actualData && actualData.data && Array.isArray(actualData.data)) return actualData.data;
                return Array.isArray(actualData) ? actualData : [];
            } catch (error) {
                console.warn("Failed to fetch floors:", error);
                return [];
            }
        },
        enabled: !!businessId,
    });

    const createFloorMutation = useMutation({
        mutationFn: (data: CreateFloorDto) => createFloorApiCall(businessId, data),
        onSuccess: () => {
            toast.success("Floor created successfully");
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    const updateFloorMutation = useMutation({
        mutationFn: ({ floorId, data }: { floorId: string; data: UpdateFloorDto }) =>
            updateFloorApiCall(businessId, floorId, data),
        onSuccess: () => {
            toast.success("Floor updated successfully");
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    const deleteFloorMutation = useMutation({
        mutationFn: (floorId: string) => deleteFloorApiCall(businessId, floorId),
        onSuccess: () => {
            toast.success("Floor deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    return {
        floors,
        fetchingFloors,
        refetchFloors: refetch,
        createFloor: createFloorMutation.mutate,
        isCreatingFloor: createFloorMutation.isPending,
        updateFloor: updateFloorMutation.mutate,
        isUpdatingFloor: updateFloorMutation.isPending,
        deleteFloor: deleteFloorMutation.mutate,
        isDeletingFloor: deleteFloorMutation.isPending,
    };
};

export const useTables = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: tables, isFetching: fetchingTables, refetch } = useQuery({
        queryKey: ["tables", businessId],
        queryFn: async () => {
            try {
                const resp = await fetchTablesApiCall(businessId);
                const resData = resp.data;
                const actualData = resData?.data !== undefined ? resData.data : resData;

                if (actualData && actualData.data && Array.isArray(actualData.data)) return actualData.data;
                return Array.isArray(actualData) ? actualData : [];
            } catch (error) {
                console.warn("Failed to fetch tables:", error);
                return [];
            }
        },
        enabled: !!businessId,
    });

    const createTableMutation = useMutation({
        mutationFn: (data: CreateTableDto) => createTableApiCall(businessId, data),
        onSuccess: () => {
            toast.success("Table created successfully");
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] }); // Floors might include tables
        },
    });

    const updateTableMutation = useMutation({
        mutationFn: ({ tableId, data }: { tableId: string; data: UpdateTableDto }) =>
            updateTableApiCall(businessId, tableId, data),
        onSuccess: () => {
            toast.success("Table updated successfully");
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    const deleteTableMutation = useMutation({
        mutationFn: (tableId: string) => deleteTableApiCall(businessId, tableId),
        onSuccess: () => {
            toast.success("Table deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["tables", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    return {
        tables,
        fetchingTables,
        refetchTables: refetch,
        createTable: createTableMutation.mutate,
        isCreatingTable: createTableMutation.isPending,
        updateTable: updateTableMutation.mutate,
        isUpdatingTable: updateTableMutation.isPending,
        deleteTable: deleteTableMutation.mutate,
        isDeletingTable: deleteTableMutation.isPending,
    };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchFloorsApiCall,
    fetchFloorStatsApiCall,
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
    UpdateTableDto,
    BatchCreateTableDto,
    batchCreateTablesApiCall,
    BatchCreateElementsDto,
    UpdateElementDto,
    batchCreateElementsApiCall,
    updateElementApiCall,
    deleteElementApiCall,
} from "./service";

export const useFloorStats = (businessId: string) => {
    const { data: stats, isFetching: fetchingStats } = useQuery({
        queryKey: ["floor-stats", businessId],
        queryFn: async () => {
            try {
                return await fetchFloorStatsApiCall(businessId);
            } catch (error) {
                console.warn("Failed to fetch floor stats:", error);
                return null;
            }
        },
        enabled: !!businessId,
    });

    return { stats, fetchingStats };
};

export const useFloors = (businessId: string, publishedOnly?: boolean) => {
    const queryClient = useQueryClient();

    const { data: floors, isFetching: fetchingFloors, refetch } = useQuery({
        queryKey: ["floors", businessId, publishedOnly],
        queryFn: async () => {
            try {
                const data = await fetchFloorsApiCall(businessId, publishedOnly);
                return Array.isArray(data) ? data : [];
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
            queryClient.invalidateQueries({ queryKey: ["floor-stats", businessId] });
        },
    });

    const updateFloorMutation = useMutation({
        mutationFn: ({ floorId, data }: { floorId: string; data: UpdateFloorDto }) =>
            updateFloorApiCall(businessId, floorId, data),
        onSuccess: () => {
            toast.success("Floor updated successfully");
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floor-stats", businessId] });
        },
    });

    const deleteFloorMutation = useMutation({
        mutationFn: (floorId: string) => deleteFloorApiCall(businessId, floorId),
        onSuccess: () => {
            toast.success("Floor deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
            queryClient.invalidateQueries({ queryKey: ["floor-stats", businessId] });
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

export const useTables = (businessId: string, publishedOnly?: boolean) => {
    const queryClient = useQueryClient();

    const { data: tables, isFetching: fetchingTables, refetch } = useQuery({
        queryKey: ["tables", businessId, publishedOnly],
        queryFn: async () => {
            try {
                const data = await fetchTablesApiCall(businessId, publishedOnly);
                return Array.isArray(data) ? data : [];
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

    const batchCreateTableMutation = useMutation({
        mutationFn: (data: BatchCreateTableDto) => batchCreateTablesApiCall(businessId, data),
        onSuccess: () => {
            toast.success("Tables created successfully");
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
        updateTableAsync: updateTableMutation.mutateAsync,
        isUpdatingTable: updateTableMutation.isPending,
        deleteTable: deleteTableMutation.mutate,
        isDeletingTable: deleteTableMutation.isPending,
        batchCreateTables: batchCreateTableMutation.mutate,
        isBatchCreatingTables: batchCreateTableMutation.isPending,
    };
};

export const useElements = (businessId: string) => {
    const queryClient = useQueryClient();

    const batchCreateMutation = useMutation({
        mutationFn: (data: BatchCreateElementsDto) => batchCreateElementsApiCall(businessId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ elementId, data }: { elementId: string; data: UpdateElementDto }) =>
            updateElementApiCall(businessId, elementId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (elementId: string) => deleteElementApiCall(businessId, elementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["floors", businessId] });
        },
    });

    return {
        batchCreateElements: batchCreateMutation.mutateAsync,
        updateElement: updateMutation.mutateAsync,
        deleteElement: deleteMutation.mutateAsync,
    };
};

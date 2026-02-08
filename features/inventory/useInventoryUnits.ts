import { useQuery } from "@tanstack/react-query";
import { fetchInventoryUnitsApiCall } from "./service";
import { InventoryUnit } from "@/models/inventory/InventoryUnit";

/**
 * Hook to fetch inventory units with optional system filtering
 * @param system 'metric' | 'imperial' | 'other' | 'all'
 */
export const useInventoryUnits = (system: string = "metric") => {
    const {
        data: inventoryUnits,
        isFetching: fetchingInventoryUnits,
        error: inventoryUnitsError,
        refetch: refreshInventoryUnits,
    } = useQuery({
        queryKey: ["inventory_units", system],
        queryFn: async () => {
            const resp = await fetchInventoryUnitsApiCall(system);
            if (resp.data.success) {
                return InventoryUnit.parseApiArrayResponse(resp.data.data);
            }
            return [];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    return {
        inventoryUnits,
        fetchingInventoryUnits,
        inventoryUnitsError,
        refreshInventoryUnits,
    };
};

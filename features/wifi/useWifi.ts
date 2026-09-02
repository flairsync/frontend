import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchWifiNetworksApiCall,
    createWifiNetworkApiCall,
    updateWifiNetworkApiCall,
    deleteWifiNetworkApiCall,
    CreateWifiNetworkDto,
    UpdateWifiNetworkDto,
} from "./service";

export const useWifiNetworks = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: wifiNetworks, isFetching: fetchingWifiNetworks } = useQuery({
        queryKey: ["wifi-networks", businessId],
        queryFn: () => fetchWifiNetworksApiCall(businessId),
        enabled: !!businessId,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["wifi-networks", businessId] });

    const createMutation = useMutation({
        mutationFn: (data: CreateWifiNetworkDto) => createWifiNetworkApiCall(businessId, data),
        onSuccess: () => {
            toast.success("WiFi network created");
            invalidate();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWifiNetworkDto }) =>
            updateWifiNetworkApiCall(businessId, id, data),
        onSuccess: () => {
            toast.success("WiFi network updated");
            invalidate();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteWifiNetworkApiCall(businessId, id),
        onSuccess: () => {
            toast.success("WiFi network deleted");
            invalidate();
        },
    });

    return {
        wifiNetworks,
        fetchingWifiNetworks,
        createWifiNetwork: createMutation.mutate,
        isCreatingWifiNetwork: createMutation.isPending,
        updateWifiNetwork: updateMutation.mutate,
        isUpdatingWifiNetwork: updateMutation.isPending,
        deleteWifiNetwork: deleteMutation.mutate,
        isDeletingWifiNetwork: deleteMutation.isPending,
    };
};

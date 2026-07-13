import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { discountsApi, Discount, CreateDiscountPayload } from "./discounts";

export const useDiscounts = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: discounts = [], isFetching: fetchingDiscounts } = useQuery<Discount[]>({
        queryKey: ["discounts", businessId],
        queryFn: () => discountsApi.list(businessId),
        enabled: !!businessId,
    });

    const createMutation = useMutation({
        mutationFn: (payload: CreateDiscountPayload) => discountsApi.create(businessId, payload),
        onSuccess: () => {
            toast.success("Discount created");
            queryClient.invalidateQueries({ queryKey: ["discounts", businessId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create discount");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateDiscountPayload> }) =>
            discountsApi.update(businessId, id, payload),
        onSuccess: () => {
            toast.success("Discount updated");
            queryClient.invalidateQueries({ queryKey: ["discounts", businessId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update discount");
        },
    });

    const removeMutation = useMutation({
        mutationFn: (id: string) => discountsApi.remove(businessId, id),
        onSuccess: () => {
            toast.success("Discount removed");
            queryClient.invalidateQueries({ queryKey: ["discounts", businessId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to remove discount");
        },
    });

    return {
        discounts,
        fetchingDiscounts,
        createDiscount: createMutation.mutate,
        isCreatingDiscount: createMutation.isPending,
        updateDiscount: updateMutation.mutate,
        isUpdatingDiscount: updateMutation.isPending,
        removeDiscount: removeMutation.mutate,
        isRemovingDiscount: removeMutation.isPending,
    };
};

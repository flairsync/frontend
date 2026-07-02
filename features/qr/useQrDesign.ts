import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchQrDesignApiCall,
    updateQrDesignApiCall,
    uploadQrLogoApiCall,
    deleteQrLogoApiCall,
    UpdateQrDesignDto,
} from "./service";

export const useQrDesign = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: design, isFetching: fetchingDesign } = useQuery({
        queryKey: ["qr-design", businessId],
        queryFn: () => fetchQrDesignApiCall(businessId),
        enabled: !!businessId,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["qr-design", businessId] });

    // Mutations are silent (no per-call toast) — the design editor bundles all of
    // these into a single explicit "Save" action and reports one toast for the
    // whole batch, rather than one per field/upload.
    const updateDesignMutation = useMutation({
        mutationFn: (data: UpdateQrDesignDto) => updateQrDesignApiCall(businessId, data),
        onSuccess: invalidate,
    });

    const uploadLogoMutation = useMutation({
        mutationFn: (file: File) => uploadQrLogoApiCall(businessId, file),
        onSuccess: invalidate,
    });

    const deleteLogoMutation = useMutation({
        mutationFn: () => deleteQrLogoApiCall(businessId),
        onSuccess: invalidate,
    });

    return {
        design,
        fetchingDesign,
        updateDesignAsync: updateDesignMutation.mutateAsync,
        uploadLogoAsync: uploadLogoMutation.mutateAsync,
        deleteLogoAsync: deleteLogoMutation.mutateAsync,
        isSaving: updateDesignMutation.isPending || uploadLogoMutation.isPending || deleteLogoMutation.isPending,
    };
};

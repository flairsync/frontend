import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchNfcTagsApiCall,
    fetchNfcTagByIdApiCall,
    assignNfcTagEmploymentApiCall,
    assignNfcTagActionApiCall,
    selfRevokeNfcTagApiCall,
    createNfcCardRequestApiCall,
    fetchNfcCardRequestsApiCall,
    NfcTagFilters,
    NfcTagActionType,
    NfcTagPosAccessMode,
    SelfRevokeNfcTagDto,
    CreateNfcCardRequestDto,
    NfcCardRequestFilters,
} from "./service";
import { NfcTag } from "@/models/nfc/NfcTag";
import { NfcCardRequest } from "@/models/nfc/NfcCardRequest";
import { toast } from "sonner";

export const useNfcTags = (businessId: string, filters: NfcTagFilters = {}) => {
    const {
        data: nfcTagsData,
        isFetching: fetchingNfcTags,
        refetch: refreshNfcTags,
    } = useQuery({
        queryKey: ["nfc_tags", businessId, filters],
        queryFn: async () => {
            const paged = await fetchNfcTagsApiCall(businessId, {
                limit: 20,
                ...filters,
            });
            return {
                tags: NfcTag.parseApiArrayResponse(paged.data),
                pagination: { current: paged.current, pages: paged.pages },
            };
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 2,
    });

    return {
        nfcTags: nfcTagsData?.tags,
        pagination: nfcTagsData?.pagination,
        fetchingNfcTags,
        refreshNfcTags,
    };
};

export const useNfcTag = (businessId: string, id: string) => {
    const {
        data: nfcTag,
        isFetching: fetchingNfcTag,
        refetch: refreshNfcTag,
    } = useQuery({
        queryKey: ["nfc_tag", businessId, id],
        queryFn: async () => NfcTag.parseApiResponse(await fetchNfcTagByIdApiCall(businessId, id)),
        enabled: !!businessId && !!id,
    });

    return {
        nfcTag,
        fetchingNfcTag,
        refreshNfcTag,
    };
};

export const useAssignNfcTagEmployment = (businessId: string) => {
    const queryClient = useQueryClient();

    const assignEmploymentMutation = useMutation({
        mutationFn: ({ id, assignedEmploymentId }: { id: string; assignedEmploymentId: string | null }) =>
            assignNfcTagEmploymentApiCall(businessId, id, assignedEmploymentId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["nfc_tags", businessId] });
            queryClient.invalidateQueries({ queryKey: ["nfc_tag", businessId, variables.id] });
            toast.success("Card assignment updated");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to update card assignment";
            toast.error(msg);
        },
    });

    return {
        assignNfcTagEmployment: assignEmploymentMutation.mutateAsync,
        isAssigningNfcTagEmployment: assignEmploymentMutation.isPending,
    };
};

export const useAssignNfcTagAction = (businessId: string) => {
    const queryClient = useQueryClient();

    const assignActionMutation = useMutation({
        mutationFn: ({
            id,
            actionType,
            posAccessMode,
        }: {
            id: string;
            actionType: NfcTagActionType | null;
            posAccessMode?: NfcTagPosAccessMode | null;
        }) => assignNfcTagActionApiCall(businessId, id, actionType, posAccessMode),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["nfc_tags", businessId] });
            queryClient.invalidateQueries({ queryKey: ["nfc_tag", businessId, variables.id] });
            toast.success("Card action updated");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to update card action";
            toast.error(msg);
        },
    });

    return {
        assignNfcTagAction: assignActionMutation.mutateAsync,
        isAssigningNfcTagAction: assignActionMutation.isPending,
    };
};

export const useSelfRevokeNfcTag = (businessId: string) => {
    const queryClient = useQueryClient();

    const selfRevokeMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: SelfRevokeNfcTagDto }) =>
            selfRevokeNfcTagApiCall(businessId, id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["nfc_tags", businessId] });
            queryClient.invalidateQueries({ queryKey: ["nfc_tag", businessId, variables.id] });
            queryClient.invalidateQueries({ queryKey: ["nfc_card_requests", businessId] });
            toast.success("Card deactivated");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to deactivate card";
            toast.error(msg);
        },
    });

    return {
        selfRevokeNfcTag: selfRevokeMutation.mutateAsync,
        isSelfRevokingNfcTag: selfRevokeMutation.isPending,
    };
};

export const useCreateNfcCardRequest = (businessId: string) => {
    const queryClient = useQueryClient();

    const createRequestMutation = useMutation({
        mutationFn: (data: CreateNfcCardRequestDto) => createNfcCardRequestApiCall(businessId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["nfc_card_requests", businessId] });
            toast.success("Request submitted");
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || "Failed to submit request";
            toast.error(msg);
        },
    });

    return {
        createNfcCardRequest: createRequestMutation.mutateAsync,
        isCreatingNfcCardRequest: createRequestMutation.isPending,
    };
};

export const useNfcCardRequests = (businessId: string, filters: NfcCardRequestFilters = {}) => {
    const {
        data: nfcCardRequestsData,
        isFetching: fetchingNfcCardRequests,
        refetch: refreshNfcCardRequests,
    } = useQuery({
        queryKey: ["nfc_card_requests", businessId, filters],
        queryFn: async () => {
            const paged = await fetchNfcCardRequestsApiCall(businessId, {
                limit: 20,
                ...filters,
            });
            return {
                requests: NfcCardRequest.parseApiArrayResponse(paged.data),
                pagination: { current: paged.current, pages: paged.pages },
            };
        },
        enabled: !!businessId,
        staleTime: 1000 * 60 * 2,
    });

    return {
        nfcCardRequests: nfcCardRequestsData?.requests,
        pagination: nfcCardRequestsData?.pagination,
        fetchingNfcCardRequests,
        refreshNfcCardRequests,
    };
};

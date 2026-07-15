import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    joinRequestsApi,
    JoinRequest,
    CreateJoinRequestPayload,
    JoinRequestChildType,
} from "./join-requests";

export const useJoinRequests = () => {
    const queryClient = useQueryClient();

    const { data: incoming = [], isFetching: loadingIncoming } = useQuery<JoinRequest[]>({
        queryKey: ["join-requests", "incoming"],
        queryFn: () => joinRequestsApi.incoming(),
    });

    const { data: outgoing = [], isFetching: loadingOutgoing } = useQuery<JoinRequest[]>({
        queryKey: ["join-requests", "outgoing"],
        queryFn: () => joinRequestsApi.outgoing(),
    });

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["join-requests"] });
        queryClient.invalidateQueries({ queryKey: ["organizations"] });
        queryClient.invalidateQueries({ queryKey: ["organization"] });
        queryClient.invalidateQueries({ queryKey: ["regions"] });
        queryClient.invalidateQueries({ queryKey: ["region"] });
        queryClient.invalidateQueries({ queryKey: ["my_business"] });
        queryClient.invalidateQueries({ queryKey: ["my_businesses"] });
    };

    const createMutation = useMutation({
        mutationFn: (payload: CreateJoinRequestPayload) => joinRequestsApi.create(payload),
        onSuccess: (data) => {
            toast.success(data.status === "APPROVED" ? "Linked" : "Request sent");
            invalidateAll();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send request");
        },
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => joinRequestsApi.approve(id),
        onSuccess: () => {
            toast.success("Request approved");
            invalidateAll();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to approve request");
        },
    });

    const declineMutation = useMutation({
        mutationFn: (id: string) => joinRequestsApi.decline(id),
        onSuccess: () => {
            toast.success("Request declined");
            invalidateAll();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to decline request");
        },
    });

    const cancelMutation = useMutation({
        mutationFn: (id: string) => joinRequestsApi.cancel(id),
        onSuccess: () => {
            toast.success("Request cancelled");
            invalidateAll();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel request");
        },
    });

    const unlinkMutation = useMutation({
        mutationFn: ({ childType, childId }: { childType: JoinRequestChildType; childId: string }) =>
            joinRequestsApi.unlink(childType, childId),
        onSuccess: () => {
            toast.success("Unlinked");
            invalidateAll();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to unlink");
        },
    });

    const requestLeaveMutation = useMutation({
        mutationFn: ({ childType, childId }: { childType: JoinRequestChildType; childId: string }) =>
            joinRequestsApi.requestLeave(childType, childId),
        onSuccess: () => {
            toast.success("Leave request sent");
            invalidateAll();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send leave request");
        },
    });

    return {
        incoming,
        loadingIncoming,
        outgoing,
        loadingOutgoing,
        sendJoinRequest: createMutation.mutate,
        isSendingJoinRequest: createMutation.isPending,
        approveJoinRequest: approveMutation.mutate,
        isApprovingJoinRequest: approveMutation.isPending,
        declineJoinRequest: declineMutation.mutate,
        isDecliningJoinRequest: declineMutation.isPending,
        cancelJoinRequest: cancelMutation.mutate,
        isCancellingJoinRequest: cancelMutation.isPending,
        unlink: unlinkMutation.mutate,
        isUnlinking: unlinkMutation.isPending,
        requestLeave: requestLeaveMutation.mutate,
        isRequestingLeave: requestLeaveMutation.isPending,
    };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitationApiCall,
  fetchInvitationDetailsApiCall,
  refuseInvitationApiCall,
} from "../service";
import { BusinessEmployeeInvitation } from "@/models/business/BusinessEmployeeInvitation";
import { toast } from "sonner";

export const useBusinessInvitation = (inviteId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: invitationDetails,
    isPending: loadingInvitationDetails,
    refetch: refreshInvitation,
  } = useQuery({
    queryKey: ["business_invitation_details", inviteId],
    queryFn: async () => {
      if (!inviteId) return;
      const resp = await fetchInvitationDetailsApiCall(inviteId);
      return BusinessEmployeeInvitation.parseApiResponse(resp.data.data);
    },
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const { mutate: acceptInvitation, isPending: acceptingInvitation } =
    useMutation({
      mutationKey: ["business_invitation_accept", inviteId],
      mutationFn: async () => {
        if (!inviteId) return;

        toast.loading("Accepting invitation", {
          id: "invitation_accept_toast",
          toasterId: "invitation_accept_toast",
        });

        return acceptInvitationApiCall(inviteId);
      },
      onSuccess(data, variables, context) {
        toast.dismiss("invitation_accept_toast");
        toast.success("Invitation accepted");
        refreshInvitation();
      },
      onError(error, variables, context) {
        toast.dismiss("invitation_accept_toast");
        toast.error("Error accepting invitation");
        refreshInvitation();
      },
    });
  const { mutate: refuseInvitation, isPending: refuseingInvitation } =
    useMutation({
      mutationKey: ["business_invitation_refuse", inviteId],
      mutationFn: async () => {
        if (!inviteId) return;

        toast.loading("Refusing invitation", {
          id: "invitation_refuse_toast",
          toasterId: "invitation_refuse_toast",
        });

        return refuseInvitationApiCall(inviteId);
      },
      onSuccess(data, variables, context) {
        toast.dismiss("invitation_refuse_toast");
        toast.success("Invitation refused");
        refreshInvitation();
      },
      onError(error, variables, context) {
        toast.dismiss("invitation_refuse_toast");
        toast.error("Error refusing invitation");
        refreshInvitation();
      },
    });

  return {
    invitationDetails,
    loadingInvitationDetails,
    acceptInvitation,
    acceptingInvitation,
    refuseInvitation,
    refuseingInvitation,
  };
};

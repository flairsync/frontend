import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitationApiCall,
  fetchInvitationDetailsApiCall,
  refuseInvitationApiCall,
} from "../service";
import { BusinessEmployeeInvitation } from "@/models/business/BusinessEmployeeInvitation";
import { toast } from "sonner";
import { navigate } from "vike/client/router";

export const useBusinessInvitation = (inviteId?: string) => {
  const queryClient = useQueryClient();

  const {
    data: invitationDetails,
    isPending: loadingInvitationDetails,
    isError: invitationError,
    error: invitationFetchError,
    refetch: refreshInvitation,
  } = useQuery({
    queryKey: ["business_invitation_details", inviteId],
    queryFn: async () => {
      if (!inviteId) return;
      const resp = await fetchInvitationDetailsApiCall(inviteId);
      return BusinessEmployeeInvitation.parseApiResponse(resp as any);
    },
    enabled: !!inviteId,
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
      onError(error: any, variables, context) {
        toast.dismiss("invitation_accept_toast");

        // Flow audit (QA Test Report follow-up, 2026-11-24): this used to compare
        // error.response.data.message against the literal strings "PROFILE_NOT_VERIFIED" —
        // but the backend's `message` field is always the translated sentence (e.g. "Your
        // professional profile is not verified"), never that raw constant name, and
        // PROFILE_REQUIRED (no professional profile at all yet) had no handling here either.
        // Both cases silently fell through to the generic toast below. The stable,
        // untranslated identifier is ApiResponse's own `code` field
        // (src/constants/errors/invitation-error-codes.ts), not `message`.
        const errorCode = error.response?.data?.code;

        if (errorCode === "invitation.profile_not_verified") {
          toast.error("Please verify your email address to accept this invitation. Check your inbox and try again.");
        } else if (errorCode === "invitation.profile_required") {
          toast.error("Create your professional profile first to accept this invitation.", {
            action: {
              label: "Create profile",
              onClick: () => navigate("/manage/professional-profile"),
            },
          });
        } else {
          toast.error("Error accepting invitation");
        }

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
    invitationError,
    invitationFetchError,
    acceptInvitation,
    acceptingInvitation,
    refuseInvitation,
    refuseingInvitation,
  };
};

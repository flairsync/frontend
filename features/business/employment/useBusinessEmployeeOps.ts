import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cancelInvitationToEmployeeApiCall,
  inviteEmployeeApiCall,
  resendInvitationToEmployeeApiCall,
  resyncInvitationsApiCall,
} from "../service";
import { toast } from "sonner";

export const useBusinessEmployeeOps = (businessId: string) => {
  const queryClient = useQueryClient();

  //#region  Invitations to business
  const { mutate: inviteNewEmployee, isPending: invitingNewEmployee } =
    useMutation({
      mutationFn: (email: string) => {
        toast.loading("Sending invitation", {
          id: "invitation_send_toast",
          toasterId: "invitation_send_toast",
        });

        return inviteEmployeeApiCall(businessId, email);
      },
      onSuccess: () => {
        toast.dismiss("invitation_send_toast");
        toast.success("Invitation sent");
        queryClient.invalidateQueries({
          queryKey: ["business_emps_invits", businessId],
        });
      },
      onError(error, variables, context) {
        toast.dismiss("invitation_send_toast");
        toast.error("Error sending invitation");
      },
    });

  const { mutate: resendInvitation, isPending: resendingInvitation } =
    useMutation({
      mutationKey: ["resend_emp_invite"],
      mutationFn: (inviteId: string) => {
        toast.loading("Resending invitation", {
          id: "invitation_resend_toast",
          toasterId: "invitation_resend_toast",
        });
        return resendInvitationToEmployeeApiCall(businessId, inviteId);
      },
      onSuccess: () => {
        toast.dismiss("invitation_resend_toast");
        toast.success("Invitation resent");
        queryClient.invalidateQueries({
          queryKey: ["business_emps_invits", businessId],
        });
      },
      onError(error, variables, context) {
        toast.dismiss("invitation_resend_toast");
        toast.error("Error resending invitation");
      },
    });

  const { mutate: cancelInvitation, isPending: cancelingInvitation } =
    useMutation({
      mutationKey: ["cancel_emp_invite"],
      mutationFn: (inviteId: string) => {
        toast.loading("Canceling invitation", {
          id: "invitation_cancel_toast",
          toasterId: "invitation_cancel_toast",
        });
        return cancelInvitationToEmployeeApiCall(businessId, inviteId);
      },
      onSuccess: () => {
        toast.dismiss("invitation_cancel_toast");
        toast.success("Invitation canceled");
        queryClient.invalidateQueries({
          queryKey: ["business_emps_invits", businessId],
        });
      },
      onError(error, variables, context) {
        toast.dismiss("invitation_cancel_toast");
        toast.error("Error canceling invitation");
      },
    });

  const { mutate: resyncInvitations } = useMutation({
    mutationKey: ["resync_invitationsa", businessId],
    mutationFn: () => {
      return resyncInvitationsApiCall(businessId);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["business_emps", businessId],
      });
    },
  });

  //#endregion

  return {
    inviteNewEmployee,
    invitingNewEmployee,
    resendInvitation,
    resendingInvitation,
    cancelInvitation,
    cancelingInvitation,
    resyncInvitations,
  };
};

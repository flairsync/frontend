import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BusinessEmployeeInvitation } from "@/models/business/BusinessEmployeeInvitation";
import {
  fetchMyInvitationsApiCall,
  acceptInvitationApiCall,
  refuseInvitationApiCall,
} from "../service";

export const useMyInvitations = () => {
  const queryClient = useQueryClient();

  const { data: invitations, isPending: loadingInvitations } = useQuery<BusinessEmployeeInvitation[]>({
    queryKey: ["my_invitations"],
    queryFn: async () => {
      const data = await fetchMyInvitationsApiCall();
      return BusinessEmployeeInvitation.parseApiArrayResponse(data);
    },
  });

  const { mutate: acceptInvitation, isPending: accepting } = useMutation({
    mutationFn: (token: string) => acceptInvitationApiCall(token),
    onSuccess: () => {
      toast.success("Invitation accepted! You can now join the team.");
      queryClient.invalidateQueries({ queryKey: ["my_invitations"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      if (msg === "PROFILE_NOT_VERIFIED") {
        toast.error("Please verify your email address before accepting this invitation.");
      } else {
        toast.error("Failed to accept invitation. Please try again.");
      }
    },
  });

  const { mutate: declineInvitation, isPending: declining } = useMutation({
    mutationFn: (token: string) => refuseInvitationApiCall(token),
    onSuccess: () => {
      toast.success("Invitation declined.");
      queryClient.invalidateQueries({ queryKey: ["my_invitations"] });
    },
    onError: () => {
      toast.error("Failed to decline invitation. Please try again.");
    },
  });

  return {
    invitations: invitations ?? [],
    loadingInvitations,
    acceptInvitation,
    accepting,
    declineInvitation,
    declining,
  };
};

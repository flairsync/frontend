import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  requestAccountDeletionApiCall,
  cancelAccountDeletionApiCall,
} from "@/features/profile/service";
import { navigate } from "vike/client/router";
import { toast } from "sonner";

export const useAccountDeletion = () => {
  const queryClient = useQueryClient();

  const { mutate: requestDeletion, isPending: requestingDeletion } = useMutation({
    mutationKey: ["request_account_deletion"],
    mutationFn: requestAccountDeletionApiCall,
    onSuccess() {
      const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      toast.success(
        `Your account is scheduled for deletion on ${deletionDate.toLocaleDateString()}. You can cancel this within 30 days by logging back in.`,
        { duration: 8000 }
      );
      navigate("/login");
    },
    onError(error: any) {
      const message =
        error?.response?.data?.message ?? "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  const { mutate: cancelDeletion, isPending: cancellingDeletion } = useMutation({
    mutationKey: ["cancel_account_deletion"],
    mutationFn: cancelAccountDeletionApiCall,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["user_profile"] });
      toast.success("Account deletion cancelled. Welcome back!");
      navigate("/feed");
    },
    onError(error: any) {
      const message =
        error?.response?.data?.message ?? "Something went wrong. Please try again.";
      toast.error(message);
    },
  });

  return {
    requestDeletion,
    requestingDeletion,
    cancelDeletion,
    cancellingDeletion,
  };
};

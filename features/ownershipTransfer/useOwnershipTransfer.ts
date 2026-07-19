import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  InitiateOwnershipTransferData,
  cancelOwnershipTransferApiCall,
  confirmOwnershipTransferApiCall,
  getActiveOwnershipTransferApiCall,
  getOwnershipTransferByTokenApiCall,
  initiateOwnershipTransferApiCall,
} from "./service";
import { OwnershipTransfer } from "@/models/OwnershipTransfer";

// Used by the business owner's Danger Zone page.
export const useOwnershipTransfer = (businessId: string | null = null) => {
  const queryClient = useQueryClient();

  const {
    data: activeTransfer,
    isLoading: fetchingActiveTransfer,
  } = useQuery({
    queryKey: ["active_ownership_transfer", businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const data = await getActiveOwnershipTransferApiCall(businessId) as any;
      return data ? OwnershipTransfer.parseApiResponse(data) : null;
    },
    enabled: businessId != null,
  });

  const {
    mutate: initiateOwnershipTransfer,
    isPending: initiatingOwnershipTransfer,
    error: initiateOwnershipTransferError,
    reset: resetInitiateOwnershipTransferError,
  } = useMutation({
    mutationKey: ["initiate_ownership_transfer", businessId],
    mutationFn: async (data: InitiateOwnershipTransferData) => {
      if (!businessId) return;
      toast.loading("Sending transfer request...", { id: "initiate_transfer_toast" });
      return initiateOwnershipTransferApiCall(businessId, data);
    },
    onSuccess() {
      toast.dismiss("initiate_transfer_toast");
      toast.success("Transfer requested", {
        description: "The new owner has been emailed a confirmation link.",
      });
      queryClient.refetchQueries({ queryKey: ["active_ownership_transfer", businessId] });
    },
    onError() {
      toast.dismiss("initiate_transfer_toast");
    },
  });

  const {
    mutate: cancelOwnershipTransfer,
    isPending: cancellingOwnershipTransfer,
  } = useMutation({
    mutationKey: ["cancel_ownership_transfer", businessId],
    mutationFn: async (token: string) => {
      toast.loading("Cancelling transfer...", { id: "cancel_transfer_toast" });
      return cancelOwnershipTransferApiCall(token);
    },
    onSuccess() {
      toast.dismiss("cancel_transfer_toast");
      toast.success("Transfer cancelled");
      queryClient.refetchQueries({ queryKey: ["active_ownership_transfer", businessId] });
    },
    onError() {
      toast.dismiss("cancel_transfer_toast");
      toast.error("Error cancelling transfer");
    },
  });

  return {
    activeTransfer,
    fetchingActiveTransfer,
    initiateOwnershipTransfer,
    initiatingOwnershipTransfer,
    initiateOwnershipTransferError,
    resetInitiateOwnershipTransferError,
    cancelOwnershipTransfer,
    cancellingOwnershipTransfer,
  };
};

// Used by the standalone /ownership-transfer confirmation page.
export const useOwnershipTransferByToken = (token: string | null = null) => {
  const queryClient = useQueryClient();

  const {
    data: transfer,
    isLoading: fetchingTransfer,
    isError: transferLoadError,
    error: transferError,
  } = useQuery({
    queryKey: ["ownership_transfer", token],
    queryFn: async () => {
      if (!token) return null;
      const data = await getOwnershipTransferByTokenApiCall(token) as any;
      return OwnershipTransfer.parseApiResponse(data);
    },
    enabled: token != null,
    retry: false,
  });

  const {
    mutate: confirmOwnershipTransfer,
    isPending: confirmingOwnershipTransfer,
  } = useMutation({
    mutationKey: ["confirm_ownership_transfer", token],
    mutationFn: async () => {
      if (!token) return;
      toast.loading("Confirming transfer...", { id: "confirm_transfer_toast" });
      return confirmOwnershipTransferApiCall(token);
    },
    onSuccess() {
      toast.dismiss("confirm_transfer_toast");
      toast.success("Transfer confirmed");
      queryClient.refetchQueries({ queryKey: ["ownership_transfer", token] });
    },
    onError() {
      toast.dismiss("confirm_transfer_toast");
      toast.error("Error confirming transfer");
    },
  });

  const {
    mutate: cancelOwnershipTransfer,
    isPending: cancellingOwnershipTransfer,
  } = useMutation({
    mutationKey: ["cancel_ownership_transfer_by_token", token],
    mutationFn: async () => {
      if (!token) return;
      toast.loading("Cancelling transfer...", { id: "cancel_transfer_toast" });
      return cancelOwnershipTransferApiCall(token);
    },
    onSuccess() {
      toast.dismiss("cancel_transfer_toast");
      toast.success("Transfer cancelled");
      queryClient.refetchQueries({ queryKey: ["ownership_transfer", token] });
    },
    onError() {
      toast.dismiss("cancel_transfer_toast");
      toast.error("Error cancelling transfer");
    },
  });

  return {
    transfer,
    fetchingTransfer,
    transferLoadError,
    transferError,
    confirmOwnershipTransfer,
    confirmingOwnershipTransfer,
    cancelOwnershipTransfer,
    cancellingOwnershipTransfer,
  };
};

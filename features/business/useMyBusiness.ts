import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteMyBusinessApiCall,
  fetchMyBuysinessFullDetailsApiCall,
  UpdateBusinessGalleryDataType,
  updateMyBusienssGalleryApiCall,
  updateMyBusinessDetailsApiCall,
  updateMyBusinessLogoApiCall,
  updateMyBusinessOpenHoursApiCall,
  updateMyBusinessStatusApiCall,
} from "./service";
import {
  MyBusinessFullDetails,
  OpeningHours,
  UpdateBusinessDetailsDto,
} from "@/models/business/MyBusinessFullDetails";
import { toast } from "sonner";

export const useMyBusiness = (businessId: string | null = null) => {
  const queryClient = useQueryClient();

  const {
    data: myBusinessFullDetails,
    isLoading: fetchingMyBusinessFullDetails,
    isError: businessLoadError,
  } = useQuery({
    queryKey: ["my_business", businessId],
    queryFn: async () => {
      if (!businessId) return;
      const res = await fetchMyBuysinessFullDetailsApiCall(businessId) as any;

      // res.usage here is this one business's own per-business usage (see
      // UsageService.getBusinessUsage) — a different shape than the
      // account-wide ["user_usage"] cache (useUsage), so it must not be
      // written there. Per-business usage/plan data has its own hook and
      // cache key: useBusinessPlan, ["business_plan", businessId].
      return {
        business: MyBusinessFullDetails.parseApiResponse(res.business) || undefined,
      };
    },
    enabled: businessId != null,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const { mutate: updateMyBusinessDetails, isPending: updatingMyBusiness } =
    useMutation({
      mutationKey: ["update_my_business", businessId],
      mutationFn: async (data: UpdateBusinessDetailsDto) => {
        toast.loading("Updating business", { id: "update_business_toast" });
        if (!businessId) return;
        return updateMyBusinessDetailsApiCall(businessId, data);
      },
      onSuccess(data, variables, context) {
        // TODO: update insead of doing a full server refetch
        queryClient.refetchQueries({
          queryKey: ["my_business", businessId],
        });
        toast.dismiss("update_business_toast");
        toast.success("Updated", {
          description: "Business details updated ...",
        });
      },
      onError(error: any, variables, context) {
        toast.dismiss("update_business_toast");
        toast.error("Error updating", {
          description: error?.response?.data?.message || "An error occured while updating your business",
        });
      },
    });

  //#region Media handling
  const { mutate: updateBusinessLogo, isPending: updatingBusinessLogo } =
    useMutation({
      mutationKey: ["update_my_business_logo", businessId],
      mutationFn: async (data: { file: File }) => {
        toast.loading("Updating logo", { id: "update_logo_toast" });
        if (!businessId) return;
        return updateMyBusinessLogoApiCall(businessId, data.file);
      },
      onSuccess(data, variables, context) {
        queryClient.refetchQueries({
          queryKey: ["my_business", businessId],
        });
        toast.dismiss("update_logo_toast");
        toast.success("Updated", {
          description: "Business details updated ...",
        });
      },
      onError(error, variables, context) {
        toast.dismiss("update_logo_toast");
        toast.error("Error updating", {
          description: "An error occured while updating your logo",
        });
      },
    });

  const {
    mutate: updateMyBusinessGallery,
    isPending: updatingMyBusinessGallery,
  } = useMutation({
    mutationKey: ["my_business_update_glr", businessId],
    mutationFn: async (data: UpdateBusinessGalleryDataType) => {
      if (!businessId) return;
      toast.loading("Updating gallery", {
        id: "gallery_update_toast",
        toasterId: "gallery_update_toast",
      });

      return updateMyBusienssGalleryApiCall(businessId, data);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["my_business", businessId],
        stale: true,
      });
      toast.dismiss("gallery_update_toast");
      toast.success("Updated", {
        description: "Business gallery updated ...",
      });
    },
    onError(error, variables, context) {
      alert("Errorrr");
      //    toast.dismiss(toastId);
      toast.error("Error updating", {
        description: "An error occured while updating your gallery",
      });
    },
  });

  //#endregion

  const {
    mutate: updateMyBusinessOpenHours,
    isPending: updatingMyBusinessOpenHours,
  } = useMutation({
    mutationKey: ["update_my_business_oh", businessId],
    mutationFn: async (data: {
      openHours: OpeningHours[];
    }) => {
      if (!businessId) return;
      const payload = OpeningHours.toUpdateDtoArray(data.openHours);
      toast.loading("Updating business open hours", {
        id: "oh_update_toast",
        toasterId: "oh_update_toast",
      });
      return updateMyBusinessOpenHoursApiCall(businessId, payload);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["my_business", businessId],
        stale: true,
      });
      toast.dismiss("oh_update_toast");
      toast.success("Updated", {
        description: "Open hours updated ...",
      });
    },
    onError(error, variables, context) {
      toast.dismiss("oh_update_toast");
      toast.error("Error updating", {
        description: "An error occured while updating your opening hours",
      });
    },
  });

  const {
    mutate: updateMyBusinessStatus,
    isPending: updatingMyBusinessStatus,
  } = useMutation({
    mutationKey: ["update_my_business_status", businessId],
    mutationFn: async (status: string) => {
      if (!businessId) return;
      toast.loading("Updating business status", {
        id: "status_update_toast",
        toasterId: "status_update_toast",
      });
      return updateMyBusinessStatusApiCall(businessId, status);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["my_business", businessId],
        stale: true,
      });
      queryClient.refetchQueries({
        queryKey: ["business_status", businessId],
        stale: true,
      });
      toast.dismiss("status_update_toast");
      toast.success("Updated", {
        description: "Business status updated ...",
      });
    },
    onError(error, variables, context) {
      toast.dismiss("status_update_toast");
      toast.error("Error updating", {
        description: "An error occured while updating your business status",
      });
    },
  });

  const { mutate: deleteBusiness, isPending: deletingBusiness } = useMutation({
    mutationKey: ["delete_my_business", businessId],
    mutationFn: async () => {
      if (!businessId) return;
      toast.loading("Deleting business...", { id: "delete_business_toast" });
      return deleteMyBusinessApiCall(businessId);
    },
    onSuccess() {
      toast.dismiss("delete_business_toast");
      toast.success("Business deleted", {
        description: "Your business has been permanently deleted.",
      });
      queryClient.removeQueries({ queryKey: ["my_business", businessId] });
      queryClient.invalidateQueries({ queryKey: ["my_businesses"] });
    },
    onError() {
      toast.dismiss("delete_business_toast");
    },
  });

  return {
    myBusinessFullDetails: myBusinessFullDetails?.business,
    fetchingMyBusinessFullDetails,
    businessLoadError,
    updatingMyBusiness,
    updateMyBusinessDetails,
    updateBusinessLogo,
    updatingBusinessLogo,
    updateMyBusinessGallery,
    updatingMyBusinessGallery,
    updateMyBusinessOpenHours,
    updatingMyBusinessOpenHours,
    updateMyBusinessStatus,
    updatingMyBusinessStatus,
    deleteBusiness,
    deletingBusiness,
  };
};

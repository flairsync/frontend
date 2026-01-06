import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchMyBuysinessFullDetailsApiCall,
  UpdateBusinessGalleryDataType,
  updateMyBusienssGalleryApiCall,
  updateMyBusinessDetailsApiCall,
  updateMyBusinessLogoApiCall,
  updateMyBusinessOpenHoursApiCall,
} from "./service";
import {
  MyBusinessFullDetails,
  OpeningHours,
  UpdateBusinessDetailsDto,
} from "@/models/business/MyBusinessFullDetails";
import { toast } from "sonner";

export const useMyBusiness = (businessId: string | null = null) => {
  const queryClient = useQueryClient();
  let toastId: string | number = "";

  const {
    data: myBusinessFullDetails,
    isFetching: fetchingMyBusinessFullDetails,
  } = useQuery({
    queryKey: ["my_business", businessId],
    queryFn: async () => {
      if (!businessId) return;
      const res = await fetchMyBuysinessFullDetailsApiCall(businessId);
      return MyBusinessFullDetails.parseApiResponse(res.data.data) || undefined;
    },
    enabled: businessId != null,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const { mutate: updateMyBusinessDetails, isPending: updatingMyBusiness } =
    useMutation({
      mutationKey: ["update_my_business", businessId],
      mutationFn: async (data: UpdateBusinessDetailsDto) => {
        toastId = toast.loading("Updating business");
        if (!businessId) return;
        return updateMyBusinessDetailsApiCall(businessId, data);
      },
      onSuccess(data, variables, context) {
        // TODO: update insead of doing a full server refetch
        queryClient.refetchQueries({
          queryKey: ["my_business", businessId],
        });
        setTimeout(() => {
          toast.dismiss(toastId);
          toast.success("Updated", {
            description: "Business details updated ...",
          });
        }, 3000);
      },
    });

  //#region Media handling
  const { mutate: updateBusinessLogo, isPending: updatingBusinessLogo } =
    useMutation({
      mutationKey: ["update_my_business_logo", businessId],
      mutationFn: async (data: { file: File }) => {
        toastId = toast.loading("Updating logo");
        if (!businessId) return;
        return updateMyBusinessLogoApiCall(businessId, data.file);
      },
      onSuccess(data, variables, context) {
        queryClient.refetchQueries({
          queryKey: ["my_business", businessId],
        });
        toast.dismiss(toastId);
        toast.success("Updated", {
          description: "Business details updated ...",
        });
      },
      onError(error, variables, context) {
        toast.dismiss(toastId);
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
      autoOpen: boolean;
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

  return {
    myBusinessFullDetails,
    fetchingMyBusinessFullDetails,
    updatingMyBusiness,
    updateMyBusinessDetails,
    updateBusinessLogo,
    updatingBusinessLogo,
    updateMyBusinessGallery,
    updatingMyBusinessGallery,
    updateMyBusinessOpenHours,
    updatingMyBusinessOpenHours,
  };
};

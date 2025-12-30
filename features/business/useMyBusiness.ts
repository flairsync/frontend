import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchMyBuysinessFullDetailsApiCall,
  updateMyBusinessDetailsApiCall,
  updateMyBusinessLogoApiCall,
} from "./service";
import {
  MyBusinessFullDetails,
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

  const { mutate: updateBusinessLogo, isPending: updatingBusinessLogo } =
    useMutation({
      mutationKey: ["update_my_business_logo", businessId],
      mutationFn: async (data: { file: File }) => {
        toastId = toast.loading("Updating logo");
        if (!businessId) return;
        return updateMyBusinessLogoApiCall(businessId, data.file);
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
      onError(error, variables, context) {
        setTimeout(() => {
          toast.dismiss(toastId);
          toast.error("Error updating", {
            description: "An error occured while updating your logo",
          });
        }, 3000);
      },
    });

  return {
    myBusinessFullDetails,
    fetchingMyBusinessFullDetails,
    updatingMyBusiness,
    updateMyBusinessDetails,
    updateBusinessLogo,
    updatingBusinessLogo,
  };
};

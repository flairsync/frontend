import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMyProfessionalProfileApiCall,
  CreateProProfileDto,
  getMyProfessionalProfileApiCall,
  updateMyProfessionalProfileApiCall,
  UpdateProProfileDto,
} from "./service";
import { toast } from "sonner";
import { ProfessionalProfile } from "@/models/professional/ProfessionalProfile";
import { navigate } from "vike/client/router";

export const useProfessionalProfile = () => {
  const queryClient = useQueryClient();

  const {
    data: userProfessionalProfile,
    isPending: loadingProfessionalProfile,
  } = useQuery({
    queryKey: ["user_pro_profile"],
    queryFn: async () => {
      const data = await getMyProfessionalProfileApiCall();
      return ProfessionalProfile.parseApiResponse(data);
    },
  });

  const { mutate: createProProfile, isPending: creatingProProfile } =
    useMutation({
      mutationKey: ["user_create_pro_profile"],
      mutationFn: (data: CreateProProfileDto) => {
        toast.loading("Creating professional profile", {
          id: "pro_profile_create_toast",
          toasterId: "pro_profile_create_toast",
        });
        return createMyProfessionalProfileApiCall(data);
      },
      onSuccess(data, variables, context) {
        toast.dismiss("pro_profile_create_toast");
        toast.success("Created", {
          description: "You professional profile was created!",
        });
        queryClient.refetchQueries({
          queryKey: ["user_pro_profile"],
        });

        // refresh to hydrate ssr and get new permissions/hasPP state
        navigate(window.location.href, {
          keepScrollPosition: true,
          overwriteLastHistoryEntry: true,
        });
      },
    });

  const { mutate: updateProProfile, isPending: updatingProProfile } =
    useMutation({
      mutationKey: ["user_update_pro_profile"],
      mutationFn: (data: UpdateProProfileDto) => {
        toast.loading("Saving changes", {
          id: "pro_profile_update_toast",
          toasterId: "pro_profile_update_toast",
        });
        return updateMyProfessionalProfileApiCall(data);
      },
      onSuccess() {
        toast.dismiss("pro_profile_update_toast");
        toast.success("Saved", {
          description: "Your professional profile was updated.",
        });
        queryClient.refetchQueries({ queryKey: ["user_pro_profile"] });
      },
      onError() {
        toast.dismiss("pro_profile_update_toast");
      },
    });

  return {
    userProfessionalProfile,
    loadingProfessionalProfile,

    createProProfile,
    creatingProProfile,

    updateProProfile,
    updatingProProfile,
  };
};

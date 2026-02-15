import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageContext } from "vike-react/usePageContext";
import { getUserProfileApiCall, updateUserProfileApiCall } from "./service";
import { UserProfile } from "@/models/UserProfile";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user } = usePageContext();

  const { t } = useTranslation();

  const { data: userProfile, isPending: loadingUserProfile } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const userData = await getUserProfileApiCall();
      if (userData.data.success) {
        return UserProfile.parseApiResponse(userData.data.data);
      }
    },
    enabled: user != null,
    meta: {
      onError: (error: any) => {
        // If we are supposed to be logged in but profile fetch fails
        if (user) {
          toast.error(t("errors.technical.session_expired"));
        }
      }
    }
  });

  const {
    mutate: updateUserProfile,
    isPending: updatingUserProfile,
    isSuccess: updatedUserProfile,
  } = useMutation({
    mutationKey: ["update_user_profile"],
    mutationFn: updateUserProfileApiCall,
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["user_profile"],
      });
    },
  });

  return {
    userProfile,
    loadingUserProfile,

    updateUserProfile,
    updatingUserProfile,
    updatedUserProfile,
  };
};

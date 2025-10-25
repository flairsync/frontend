import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageContext } from "vike-react/usePageContext";
import { getUserProfileApiCall, updateUserProfileApiCall } from "./service";
import { UserProfile } from "@/models/UserProfile";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { user } = usePageContext();

  const { data: userProfile, isPending: loadingUserProfile } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const userData = await getUserProfileApiCall();
      if (userData.data.success) {
        return UserProfile.parseApiResponse(userData.data.data);
      }
    },
    enabled: user != null,
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

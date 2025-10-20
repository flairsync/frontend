import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageContext } from "vike-react/usePageContext";
import { getUserProfileApiCall } from "./service";
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

  return {
    userProfile,
    loadingUserProfile,
  };
};

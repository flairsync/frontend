import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageContext } from "vike-react/usePageContext";
import { getUserProfileApiCall, updateUserProfileApiCall } from "./service";
import { UserProfile } from "@/models/UserProfile";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useProfile = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const { user } = usePageContext();

  const { t } = useTranslation();

  // Callers on prerendered/static pages have no reliable pageContext.user
  // (it's frozen at build time) and pass enabled explicitly to force a live check.
  const enabled = options?.enabled ?? user != null;

  const { data: userProfile, isPending: loadingUserProfile } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const userData = await getUserProfileApiCall();
      return userData ? UserProfile.parseApiResponse(userData as any) : undefined;
    },
    enabled,
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageContext } from "vike-react/usePageContext";
import { getPublicUserDisplayName, getUserProfileApiCall, updateUserProfileApiCall } from "./service";
import { UserProfile } from "@/models/UserProfile";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const usePublicProfile = (userId?: string) => {
    const queryClient = useQueryClient();
    const { user } = usePageContext();

    const { t } = useTranslation();

    const { data: publicUserDispalyName, isPending: loadingPublicUserDispalyName } = useQuery({
        queryKey: ["public_user_display_name", userId],
        queryFn: async () => {
            if (!userId) return;
            const userData = await getPublicUserDisplayName(userId);
            if (userData.data.success) {
                return userData.data.data;
            }
        },
        enabled: userId != null,
        meta: {
            onError: (error: any) => {
                // If we are supposed to be logged in but profile fetch fails
                if (user) {
                    toast.error(t("errors.technical.session_expired"));
                }
            }
        }
    });


    return {
        publicUserDispalyName,
        loadingPublicUserDispalyName,
    };
};

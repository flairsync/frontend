import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUserApiCall,
  loginUserWithGoogleApiCall,
  logoutUserApiCall,
  signupUserApiCall,
} from "./service";
import { UserAuthProfile } from "@/models/UserAuthProfile";
import { UserProfile } from "@/models/UserProfile";
import { saveJwtToken, clearJwtToken } from "@/misc/SecureStorage";
import { navigate } from "vike/client/router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { disconnectNotificationChannel } from "@/features/notifications/useNotificationSocket";
import { usePageContext } from "vike-react/usePageContext";
import { PageContext } from "vike/types";
import { useTranslation } from "react-i18next";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const pageContext = usePageContext();

  const { t } = useTranslation("auth");

  const {
    mutate: loginUser,
    isPending: loggingIn,
    error: loginError,
  } = useApiMutation({
    mutationKey: ["login_user"],
    mutationFn: (data: { email: string; password: string; stayConnected?: boolean }) => {
      return loginUserApiCall(data);
    },
    onSuccess(data, variables, context) {
      // refresh to hydrate ssr
      hydrateSSR();
    },
  });

  const {
    mutate: loginUserWithGoogle,
    isPending: loggingInWithGoogle,
    error: loginErrorWithGoogle,
  } = useApiMutation({
    mutationKey: ["login_user_google"],
    mutationFn: (data: { tokenId: string }) => {
      return loginUserWithGoogleApiCall(data.tokenId);
    },
    onError(error, variables, context) {
      console.log("ERROR LOGGING WITH GOOGLE ", error);
    },
    onSuccess(data, variables, context) {
      // refresh to hydrate ssr
      hydrateSSR();
    },
  });

  const { mutate: logoutUser, isPending: loggingOut } = useMutation({
    mutationKey: ["logout_user"],
    mutationFn: async () => {
      // Unregister this device's push token / close the notification stream
      // while the session is still authenticated, before the auth cookie is cleared.
      await disconnectNotificationChannel().catch(() => {});
      return logoutUserApiCall();
    },
    onSuccess(data, variables, context) {
      // Wipe cached server state (e.g. user_profile) so components reading
      // from the query cache (like the landing header) don't keep showing
      // the logged-in user until this soft nav's SSR round-trip lands.
      queryClient.clear();
      clearJwtToken();
      // refresh to hydrate ssr
      hydrateSSR();
    },
    onError(error, variables, context) {
      queryClient.clear();
      clearJwtToken();
      hydrateSSR();
    },
  });

  const {
    mutate: signupUser,
    isPending: signingUp,
    error: signupError,
  } = useApiMutation({
    mutationKey: ["signup_user"],
    mutationFn: signupUserApiCall,
    onSuccess(data, variables, context) {
      toast(t("auth_page.register.account_created_toast"));
      hydrateSSR();
    },
  });

  const hydrateSSR = () => {
    //window.location.reload();
    navigate(window.location.href, {
      keepScrollPosition: true,
    });
  };
  return {
    loginUser,
    loggingIn,
    loginError,

    loginUserWithGoogle,
    loginErrorWithGoogle,
    loggingInWithGoogle,

    signupUser,
    signingUp,

    logoutUser,
    loggingOut,
    signupError,
  };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUserApiCall,
  loginUserWithGoogleApiCall,
  logoutUserApiCall,
  signupUserApiCall,
} from "./service";
import { UserAuthProfile } from "@/models/UserAuthProfile";
import { UserProfile } from "@/models/UserProfile";
import { saveJwtToken } from "@/misc/SecureStorage";
import { navigate } from "vike/client/router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const {
    mutate: loginUser,
    isPending: loggingIn,
    error: loginError,
  } = useApiMutation({
    mutationKey: ["login_user"],
    mutationFn: (data: { email: string; password: string }) => {
      return loginUserApiCall(data);
    },
    onSuccess(data, variables, context) {
      navigate("/feed");
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
      navigate("/feed");
    },
  });

  const { mutate: logoutUser, isPending: loggingOut } = useMutation({
    mutationKey: ["logout_user"],
    mutationFn: logoutUserApiCall,
    onSuccess(data, variables, context) {
      // refresh to hydrate ssr
      navigate(window.location.pathname, { keepScrollPosition: true });
    },
  });

  const {
    mutate: signupUser,
    isPending: signingUp,
    error: signupError,
  } = useMutation({
    mutationKey: ["signup_user"],
    mutationFn: signupUserApiCall,
    onSuccess(data, variables, context) {
      toast("Account created");
      navigate("/login");
    },
  });

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

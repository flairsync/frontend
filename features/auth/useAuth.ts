import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  loginUserApiCall,
  logoutUserApiCall,
  signupUserApiCall,
} from "./service";
import { UserAuthProfile } from "@/models/UserAuthProfile";
import { UserProfile } from "@/models/UserProfile";
import { saveJwtToken } from "@/misc/SecureStorage";
import { navigate } from "vike/client/router";
import { toast } from "sonner";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { mutate: loginUser, isPending: loggingIn } = useMutation({
    mutationKey: ["login_user"],
    mutationFn: (data: { email: string; password: string }) => {
      return loginUserApiCall(data);
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

    signupUser,
    signingUp,

    logoutUser,
    loggingOut,
    signupError,
  };
};

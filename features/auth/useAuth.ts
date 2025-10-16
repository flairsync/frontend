import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginUserApiCall } from "./service";
import { UserAuthProfile } from "@/models/UserAuthProfile";
import { UserProfile } from "@/models/UserProfile";
import { saveJwtToken } from "@/misc/SecureStorage";
export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: authProfile, isLoading: loadingUserAuthProfile } = useQuery({
    queryKey: ["user_auth_profile"],
    queryFn: () => {
      return undefined;
    },
  });

  const { mutate: loginUser, isPending: loggingIn } = useMutation({
    mutationKey: ["login_user"],
    mutationFn: (data: { email: string; password: string }) => {
      return loginUserApiCall(data);
    },
    onSuccess(data, variables, context) {
      const ap = UserAuthProfile.parseApiResponse(data.data);
      const up = UserProfile.parseApiResponse(data.data.user);
      saveJwtToken(data.data.accessToken);
      queryClient.setQueryData(["user_auth_profile"], ap);
    },
  });

  const { mutate: signupUser, isPending: signingUp } = useMutation({
    mutationKey: ["signup_user"],
    mutationFn: (data: { email: string; password: string }) => {
      return new Promise((resolve) => {
        /* setTimeout(() => {
          resolve(AuthUserProfile.generateDummyProfile());
        }, 2000); */
      });
    },
    onSuccess(data, variables, context) {},
  });

  return {
    loginUser,
    loggingIn,
    authProfile,
    loadingUserAuthProfile,
    signupUser,
    signingUp,
  };
};

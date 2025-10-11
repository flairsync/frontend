import { AuthUserProfile } from "@/models/UserAuthProfile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: userAuthProfile, isLoading: loadingUserAuthProfile } = useQuery(
    {
      queryKey: ["user_auth_profile"],
      queryFn: () => {
        return undefined;
      },
    }
  );

  const { mutate: loginUser, isPending: loggingIn } = useMutation({
    mutationKey: ["login_user"],
    mutationFn: (data: { email: string; password: string }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(AuthUserProfile.generateDummyProfile());
        }, 2000);
      });
    },
    onSuccess(data, variables, context) {
      console.log("Done login with ", data);

      queryClient.setQueryData(["user_auth_profile"], data);
    },
  });

  const { mutate: signupUser, isPending: signingUp } = useMutation({
    mutationKey: ["signup_user"],
    mutationFn: (data: { email: string; password: string }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(AuthUserProfile.generateDummyProfile());
        }, 2000);
      });
    },
    onSuccess(data, variables, context) {},
  });

  return {
    loginUser,
    loggingIn,
    userAuthProfile,
    loadingUserAuthProfile,
    signupUser,
    signingUp,
  };
};

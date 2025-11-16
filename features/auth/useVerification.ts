import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resendVerificationOtpApiCall, verifyEmailOtpApiCall } from "./service";
import { navigate } from "vike/client/router";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const useVerification = () => {
  const queryClient = useQueryClient();

  const {
    mutate: resendOtpCode,
    isPending: resendingOtpCode,
    error: errorResendingOtpCode,
  } = useApiMutation({
    mutationKey: ["resend_verification_email"],
    mutationFn: resendVerificationOtpApiCall,
  });

  const {
    mutate: verifyEmailOtp,
    isPending: verifyingEmailOtp,
    error: errorVerifyingEmailOtp,
  } = useApiMutation({
    mutationKey: ["verify_user_email"],
    mutationFn: verifyEmailOtpApiCall,
    onSuccess(data, variables, context) {
      // refresh to hydrate ssr
      navigate(window.location.pathname, { keepScrollPosition: true });
    },
  });

  return {
    resendOtpCode,
    resendingOtpCode,
    errorResendingOtpCode,

    // verifying
    verifyEmailOtp,
    verifyingEmailOtp,
    errorVerifyingEmailOtp,
  };
};

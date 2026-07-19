import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApiCall } from "./service";

export type ForgotPasswordResult =
  | { status: "sent" }
  | { status: "error"; message?: string };

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: ["forgot_password"],
    mutationFn: async (email: string): Promise<ForgotPasswordResult> => {
      const res = await forgotPasswordApiCall(email);
      if (res.data?.success) return { status: "sent" };
      return { status: "error", message: res.data?.message };
    },
  });
};

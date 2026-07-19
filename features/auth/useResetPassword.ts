import { useMutation } from "@tanstack/react-query";
import { resetPasswordApiCall } from "./service";

export type ResetPasswordResult =
  | { status: "success" }
  | { status: "token_invalid" }
  | { status: "error"; message?: string };

export const useResetPassword = () => {
  return useMutation({
    mutationKey: ["reset_password"],
    mutationFn: async (data: { token: string; newPassword: string }): Promise<ResetPasswordResult> => {
      try {
        const res = await resetPasswordApiCall(data);
        if (res.data?.success) return { status: "success" };
        if (res.data?.code === "auth.password.token_invalid") return { status: "token_invalid" };
        return { status: "error", message: res.data?.message };
      } catch (err: any) {
        if (err?.response?.data?.code === "auth.password.token_invalid") {
          return { status: "token_invalid" };
        }
        // Anything else (network error, unexpected 5xx) is surfaced as a generic
        // failure — the caller falls back to a translated network-error message.
        return { status: "error" };
      }
    },
  });
};

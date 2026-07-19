import { useMutation } from "@tanstack/react-query";
import { checkTfaApiCall } from "@/features/profileSettings/service";

export interface TfaChallengeResult {
  success: boolean;
}

// Verifies the 6-digit code from the post-login 2FA challenge screen (pages/tfa).
// Distinct from features/profileSettings/useTfaSettings.ts, which manages 2FA
// enrollment/backup-codes from the account settings page — a different flow.
export const useTfaChallenge = () => {
  return useMutation({
    mutationKey: ["verify_tfa_challenge"],
    mutationFn: async (code: string): Promise<TfaChallengeResult> => {
      const res = await checkTfaApiCall(code);
      return { success: !!res.data.success };
    },
  });
};

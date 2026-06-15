import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disableTfaApiCall,
  getTfaStatusApiCall,
  initializeTfaSetupApiCall,
  validateTfaSetupApiCall,
  regenerateBackupCodesApiCall,
} from "./service";
import { TfaStatus } from "@/models/TfaStatus";
import { toast } from "sonner";
import { useState } from "react";

const REGEN_COOLDOWN_KEY = "tfa_regen_cooldown_until";

const getStoredCooldown = (): number => {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(REGEN_COOLDOWN_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

export const triggerPdfDownload = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "flairsync-backup-codes.pdf";
  a.click();
  URL.revokeObjectURL(url);
};

export const useTfaSettings = () => {
  const queryClient = useQueryClient();

  const [regenCooldownUntil, setRegenCooldownUntil] = useState<number>(getStoredCooldown);
  const regenDisabled = regenCooldownUntil > Date.now();

  const { data: userTfaStatus } = useQuery({
    queryKey: ["user_tfa_status"],
    queryFn: async () => {
      const data = await getTfaStatusApiCall();
      return TfaStatus.parseApiResponse(data);
    },
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const {
    mutate: validateTfaCode,
    isSuccess: validatedTfaCode,
    data: recoverWords,
  } = useMutation({
    mutationKey: ["user_tfa_validation"],
    mutationFn: async (code: string) => {
      const res = await validateTfaSetupApiCall(code);
      if (res.data.success) {
        return res.data.data.recovery as string;
      } else {
        throw res;
      }
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["user_tfa_status"],
      });
    },
  });

  const {
    mutate: disableTfaCode,
    isPending: disablingTfaCode,
    isSuccess: disabledTfa,
  } = useMutation({
    mutationKey: ["user_tfa_disable"],
    mutationFn: async (code: string) => {
      return disableTfaApiCall(code);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["user_tfa_status"],
      });
    },
  });

  const {
    mutate: regenerateBackupCodes,
    isPending: regeneratingBackupCodes,
  } = useMutation({
    mutationKey: ["tfa_regenerate_backup_codes"],
    mutationFn: regenerateBackupCodesApiCall,
    onSuccess(blob) {
      triggerPdfDownload(blob);
      const cooldownUntil = Date.now() + 60 * 60 * 1000;
      localStorage.setItem(REGEN_COOLDOWN_KEY, String(cooldownUntil));
      setRegenCooldownUntil(cooldownUntil);
    },
    onError(error) {
      toast.error((error as Error).message || "Failed to regenerate backup codes");
    },
  });

  return {
    userTfaStatus,
    validateTfaCode,
    validatedTfaCode,
    recoverWords,
    initializeTfaSetupApiCall,
    disableTfaCode,
    disablingTfaCode,
    disabledTfa,
    regenerateBackupCodes,
    regeneratingBackupCodes,
    regenDisabled,
  };
};

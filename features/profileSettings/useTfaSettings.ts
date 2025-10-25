import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disableTfaApiCall,
  getTfaStatusApiCall,
  initializeTfaSetupApiCall,
  validateTfaSetupApiCall,
} from "./service";
import { TfaStatus } from "@/models/TfaStatus";

export const useTfaSettings = () => {
  const queryClient = useQueryClient();
  const { data: userTfaStatus } = useQuery({
    queryKey: ["user_tfa_status"],
    queryFn: async () => {
      const respD = await getTfaStatusApiCall();
      if (respD.data.success) {
        return TfaStatus.parseApiResponse(respD.data.data);
      }
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

  return {
    userTfaStatus,
    validateTfaCode,
    validatedTfaCode,
    recoverWords,
    initializeTfaSetupApiCall,
    disableTfaCode,
    disablingTfaCode,
    disabledTfa,
  };
};

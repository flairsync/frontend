import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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

  const { mutate: validateTfaCode, isSuccess: validatedTfaCode } = useMutation({
    mutationKey: ["user_tfa_validation"],
    mutationFn: async (code: string) => {
      return validateTfaSetupApiCall(code);
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
    initializeTfaSetupApiCall,
  };
};

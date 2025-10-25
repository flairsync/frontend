import { useMutation } from "@tanstack/react-query";
import { updateUserPasswordApiCall } from "./service";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const usePasswordSettings = () => {
  const {
    mutate: updateUserPassword,
    isPending: updatingUserPassword,
    error: errorUpdatingUserPassword,
  } = useMutation({
    mutationKey: ["update_user_password"],
    mutationFn: updateUserPasswordApiCall,
    onSuccess(data, variables, context) {
      toast("Updated password !!!");
    },
    onError(error, variables, context) {
      if (error instanceof AxiosError) {
        toast(error.response?.data.message);
      }
    },
  });

  return {
    updateUserPassword,
    updatingUserPassword,
    errorUpdatingUserPassword,
  };
};

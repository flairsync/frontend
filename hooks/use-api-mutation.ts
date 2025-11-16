// use-api-mutation.ts
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useApiMutation<TData = any, TVars = any>(
  options: UseMutationOptions<TData, AxiosError<{ message: string }>, TVars>
) {
  return useMutation<TData, AxiosError<{ message: string }>, TVars>(options);
}

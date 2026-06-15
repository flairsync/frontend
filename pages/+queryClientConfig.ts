import { AxiosError } from "axios";

export default {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: (failureCount: number, error: unknown) => {
        if ((error as AxiosError)?.response?.status === 403) return false;
        return failureCount < 1;
      },
      staleTime: 1000 * 60 * 5,
    },
  },
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDataExportStatusApiCall, requestDataExportApiCall } from "@/features/profile/service";
import { useState } from "react";

export type DataExportStatus = {
  status: "none" | "pending" | "ready";
  requestedAt?: string;
  downloadUrl?: string;
};

export const useDataExport = () => {
  const queryClient = useQueryClient();
  const [cooldownError, setCooldownError] = useState<string | null>(null);

  const {
    data: exportStatus,
    isLoading: loadingExportStatus,
  } = useQuery({
    queryKey: ["data_export_status"],
    queryFn: async (): Promise<DataExportStatus> => {
      return await getDataExportStatusApiCall() as DataExportStatus;
    },
    refetchInterval: (query) => {
      if (query.state.data?.status === "pending") return 30_000;
      return false;
    },
  });

  const { mutate: requestExport, isPending: requestingExport } = useMutation({
    mutationKey: ["request_data_export"],
    mutationFn: requestDataExportApiCall,
    onSuccess() {
      setCooldownError(null);
      queryClient.invalidateQueries({ queryKey: ["data_export_status"] });
    },
    onError(error: any) {
      const message: string =
        error?.response?.data?.message ?? "Something went wrong. Please try again.";
      setCooldownError(message);
    },
  });

  return {
    exportStatus,
    loadingExportStatus,
    requestExport,
    requestingExport,
    cooldownError,
  };
};

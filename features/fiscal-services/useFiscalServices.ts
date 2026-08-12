import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchFiscalPeriodSummaryApiCall,
  issueFullInvoiceApiCall,
  IssueFullInvoiceDto,
} from "./service";

export const useFiscalPeriodSummary = (businessId: string, from: string, to: string) => {
  return useQuery({
    queryKey: ["fiscal_period_summary", businessId, from, to],
    queryFn: () => fetchFiscalPeriodSummaryApiCall(businessId, from, to),
    enabled: !!businessId && !!from && !!to,
    staleTime: 1000 * 60 * 2,
  });
};

export const useIssueFullInvoice = (businessId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: IssueFullInvoiceDto }) =>
      issueFullInvoiceApiCall(businessId, orderId, data),
    onSuccess: () => {
      toast.success("Full invoice issued successfully");
      queryClient.invalidateQueries({ queryKey: ["fiscal_invoices", "list"] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to issue full invoice";
      toast.error(msg);
    },
  });
};

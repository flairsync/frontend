import { useQuery } from "@tanstack/react-query";
import { fetchFiscalInvoicesApiCall, FiscalInvoice, FetchFiscalInvoicesParams } from "./service";

export const useFiscalInvoices = (params: FetchFiscalInvoicesParams) => {
  return useQuery({
    queryKey: ["fiscal_invoices", "list", params],
    queryFn: async () => {
      const response = await fetchFiscalInvoicesApiCall(params);
      return response as { data: FiscalInvoice[]; current: number; pages: number };
    },
    enabled: !!params.businessId,
    staleTime: 1000 * 60 * 2,
  });
};

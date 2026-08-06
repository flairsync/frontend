import { useQuery } from "@tanstack/react-query";
import { fetchFiscalInvoicesApiCall, fetchFiscalInvoiceApiCall, FiscalInvoice, FetchFiscalInvoicesParams } from "./service";

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

// Used to jump to a specific invoice by id (e.g. following a correction's "corrects" link)
// that may not be on the currently loaded list page.
export const useFiscalInvoice = (businessId: string, id: string | null) => {
  return useQuery({
    queryKey: ["fiscal_invoices", "detail", businessId, id],
    queryFn: () => fetchFiscalInvoiceApiCall(businessId, id as string),
    enabled: !!businessId && !!id,
    staleTime: 1000 * 60 * 2,
  });
};

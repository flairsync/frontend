import { useQuery } from "@tanstack/react-query";
import {
  getSubscriptionInvoicesApiCall,
  downloadSubscriptionInvoiceApiCall,
} from "./service";
import { SubscriptionInvoice } from "@/models/SubscriptionInvoice";
import { toast } from "sonner";

export const useSubscriptionInvoices = (subId?: string) => {
  const {
    data: invoices,
    isPending: loadingInvoices,
    refetch: refreshInvoices,
  } = useQuery({
    queryKey: ["subscription_invoices", subId],
    queryFn: async () => {
      if (!subId) return [];
      const resp = await getSubscriptionInvoicesApiCall(subId);
      if (resp.data.success) {
        return SubscriptionInvoice.parseApiArrayResponse(
          resp.data.data.data || resp.data.data
        );
      }
      return [];
    },
    enabled: !!subId,
  });

  const downloadInvoice = async (invoiceId: string) => {
    if (!subId) return;
    try {
      toast.loading("Fetching invoice...", { id: "download_invoice_toast" });
      const resp = await downloadSubscriptionInvoiceApiCall(subId, invoiceId);
      const url =
        resp.data?.data?.data?.invoiceUrl ||
        resp.data?.data?.invoiceUrl ||
        resp.data?.invoiceUrl;
      toast.dismiss("download_invoice_toast");
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Invoice download URL not available.");
      }
    } catch (error) {
      toast.dismiss("download_invoice_toast");
      toast.error("Failed to download invoice.");
    }
  };

  return {
    invoices: invoices || [],
    loadingInvoices,
    refreshInvoices,
    downloadInvoice,
  };
};

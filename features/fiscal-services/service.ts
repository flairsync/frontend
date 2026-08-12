import flairapi from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";

const baseUrl = `${'https://api.flairsync.com/api/v1'}`;
const fiscalInvoicesUrl = `${baseUrl}/fiscal-invoices`;
const getOrdersUrl = (businessId: string) => `${baseUrl}/businesses/${businessId}/orders`;

export interface FiscalPeriodSummary {
  from: string;
  to: string;
  invoiceCount: number;
  correctionCount: number;
  unamountedCount: number;
  totalTaxableBase: number;
  totalTaxAmount: number;
  totalAmount: number;
}

export interface IssueFullInvoiceDto {
  recipientName: string;
  recipientTaxId: string;
  recipientAddress: string;
}

export const fetchFiscalPeriodSummaryApiCall = async (businessId: string, from: string, to: string) =>
  unwrap<FiscalPeriodSummary>(
    await flairapi.get(`${fiscalInvoicesUrl}/period-summary`, { params: { businessId, from, to } }),
  );

export const getFiscalPeriodSummaryExportUrl = (businessId: string, from: string, to: string) => {
  const params = new URLSearchParams({ businessId, from, to });
  return `${fiscalInvoicesUrl}/period-summary/export?${params.toString()}`;
};

export const issueFullInvoiceApiCall = (businessId: string, orderId: string, data: IssueFullInvoiceDto) =>
  flairapi.post(`${getOrdersUrl(businessId)}/${orderId}/full-invoice`, data);

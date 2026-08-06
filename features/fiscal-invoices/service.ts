import flairapi from "@/lib/flairapi";
import { unwrapPaginated, unwrap } from "../shared/api-response";

const baseUrl = `${'https://api.flairsync.com/api/v1'}`;
const fiscalInvoicesUrl = `${baseUrl}/fiscal-invoices`;

export enum FiscalInvoiceType {
  STANDARD = 'STANDARD',
  CORRECTION = 'CORRECTION',
}

export interface FiscalInvoice {
  id: string;
  businessId: string;
  orderId: string;
  type: FiscalInvoiceType;
  receiptId: string | null;
  correctsInvoiceId: string | null;
  invoiceNumber: string;
  status: string;
  issuedAt: string | null;
  previousHash: string | null;
  hash: string;
  createdAt: string;
}

export interface FetchFiscalInvoicesParams {
  businessId: string;
  from?: string;
  to?: string;
  type?: FiscalInvoiceType;
  page?: number;
  limit?: number;
}

export const fetchFiscalInvoicesApiCall = async (params: FetchFiscalInvoicesParams) =>
  unwrapPaginated<FiscalInvoice>(await flairapi.get(fiscalInvoicesUrl, { params }));

export const fetchFiscalInvoiceApiCall = async (businessId: string, id: string) =>
  unwrap<FiscalInvoice>(await flairapi.get(`${fiscalInvoicesUrl}/${id}`, { params: { businessId } }));

export const getFiscalInvoicesExportUrl = (
  businessId: string,
  from?: string,
  to?: string,
  type?: FiscalInvoiceType,
) => {
  const params = new URLSearchParams({ businessId });
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (type) params.append('type', type);
  return `${fiscalInvoicesUrl}/export?${params.toString()}`;
};

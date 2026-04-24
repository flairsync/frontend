import dayjs from "dayjs";

export enum InvoiceStatus {
  PENDING = "pending",
  PAID = "paid",
  VOID = "void",
  REFUNDED = "refunded",
  PARTIAL_REFUND = "partial_refund",
}

export enum InvoiceBillingReason {
  INITIAL = "initial",
  RENEWAL = "renewal",
  UPDATED = "updated",
}

export class SubscriptionInvoice {
  id: string;
  subscriptionId: string;
  billingReason: InvoiceBillingReason;
  status: InvoiceStatus;
  totalFormatted: string;
  subtotalFormatted: string;
  discountTotalFormatted: string;
  taxFormatted: string;
  total: number;
  subtotal: number;
  discountTotal: number;
  tax: number;
  invoiceUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  refundedAt: Date | null;
  cardBrand: string | null;
  cardLastFour: string | null;
  currency: string | null;

  constructor(data: {
    id: string;
    subscriptionId: string;
    billingReason: InvoiceBillingReason;
    status: InvoiceStatus;
    totalFormatted: string;
    subtotalFormatted: string;
    discountTotalFormatted: string;
    taxFormatted: string;
    total: number;
    subtotal: number;
    discountTotal: number;
    tax: number;
    invoiceUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    refundedAt: Date | null;
    cardBrand: string | null;
    cardLastFour: string | null;
    currency: string | null;
  }) {
    this.id = data.id;
    this.subscriptionId = data.subscriptionId;
    this.billingReason = data.billingReason;
    this.status = data.status;
    this.totalFormatted = data.totalFormatted;
    this.subtotalFormatted = data.subtotalFormatted;
    this.discountTotalFormatted = data.discountTotalFormatted;
    this.taxFormatted = data.taxFormatted;
    this.total = data.total;
    this.subtotal = data.subtotal;
    this.discountTotal = data.discountTotal;
    this.tax = data.tax;
    this.invoiceUrl = data.invoiceUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.refundedAt = data.refundedAt;
    this.cardBrand = data.cardBrand;
    this.cardLastFour = data.cardLastFour;
    this.currency = data.currency;
  }

  static parseApiResponse(data: any): SubscriptionInvoice | null {
    try {
      if (data == null) return null;
      return new SubscriptionInvoice({
        id: data.id,
        subscriptionId: data.subscriptionId,
        billingReason:
          (data.billingReason as InvoiceBillingReason) ||
          InvoiceBillingReason.INITIAL,
        status: (data.status as InvoiceStatus) || InvoiceStatus.PENDING,
        totalFormatted: data.totalFormatted || data.total_formatted || "",
        subtotalFormatted:
          data.subtotalFormatted || data.subtotal_formatted || "",
        discountTotalFormatted:
          data.discountTotalFormatted ||
          data.discount_total_formatted ||
          "",
        taxFormatted: data.taxFormatted || data.tax_formatted || "",
        total: (data.total ?? 0) / 100,
        subtotal: (data.subtotal ?? 0) / 100,
        discountTotal: (data.discountTotal ?? data.discount_total ?? 0) / 100,
        tax: (data.tax ?? 0) / 100,
        invoiceUrl: data.invoiceUrl ?? data.invoice_url ?? null,
        createdAt: new Date(data.createdAt || data.created_at),
        updatedAt: new Date(data.updatedAt || data.updated_at),
        refundedAt: data.refundedAt || data.refunded_at
          ? new Date(data.refundedAt || data.refunded_at)
          : null,
        cardBrand: data.cardBrand ?? data.card_brand ?? null,
        cardLastFour: data.cardLastFour ?? data.card_last_four ?? null,
        currency: data.currency ?? null,
      });
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): SubscriptionInvoice[] {
    const arr: SubscriptionInvoice[] = [];
    data.forEach((val) => {
      const invoice = this.parseApiResponse(val);
      if (invoice) arr.push(invoice);
    });
    return arr;
  }

  getCreatedDate(format?: string): string {
    return dayjs(this.createdAt).format(format || "DD/MM/YYYY");
  }

  getCreatedDateTime(format?: string): string {
    return dayjs(this.createdAt).format(format || "DD/MM/YYYY HH:mm");
  }

  getBillingReasonLabel(): string {
    switch (this.billingReason) {
      case InvoiceBillingReason.INITIAL:
        return "Initial";
      case InvoiceBillingReason.RENEWAL:
        return "Renewal";
      case InvoiceBillingReason.UPDATED:
        return "Plan Change";
      default:
        return this.billingReason;
    }
  }

  getStatusLabel(): string {
    switch (this.status) {
      case InvoiceStatus.PAID:
        return "Paid";
      case InvoiceStatus.PENDING:
        return "Pending";
      case InvoiceStatus.VOID:
        return "Void";
      case InvoiceStatus.REFUNDED:
        return "Refunded";
      case InvoiceStatus.PARTIAL_REFUND:
        return "Partial Refund";
      default:
        return this.status;
    }
  }

  canDownload(): boolean {
    return this.invoiceUrl != null && this.status !== InvoiceStatus.PENDING;
  }

  getFormattedTotal(): string {
    if (this.totalFormatted) return this.totalFormatted;
    const amount = this.total.toFixed(2);
    return this.currency ? `${amount} ${this.currency}` : amount;
  }
}

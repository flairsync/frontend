import dayjs from "dayjs";
import { SubscriptionPack } from "./SubscriptionPack";

export enum SubscriptionStatus {
  PENDING = "pending",
  ACTIVE = "active",
  TRIALING = "trialing",
  CANCELED = "canceled",
  EXPIRED = "expired",
  PAST_DUE = "past_due",
}

export class Subscription {
  id: string;
  pack: SubscriptionPack; // You can replace 'any' with a proper Pack class/interface if you have one
  lemonSubscriptionId: string | null;
  lemonCustomerId: string | null;
  lemonOrderId: string | null;
  status: SubscriptionStatus;
  startedAt: Date | null;
  trialEndsAt: Date | null;
  renewsAt: Date | null;
  endsAt: Date | null;
  isAutoRenew: boolean;
  price: number | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    pack: any,
    lemonSubscriptionId: string | null,
    lemonCustomerId: string | null,
    lemonOrderId: string | null,
    status: SubscriptionStatus,
    startedAt: Date | null,
    trialEndsAt: Date | null,
    renewsAt: Date | null,
    endsAt: Date | null,
    isAutoRenew: boolean,
    price: number | null,
    currency: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.pack = pack;
    this.lemonSubscriptionId = lemonSubscriptionId;
    this.lemonCustomerId = lemonCustomerId;
    this.lemonOrderId = lemonOrderId;
    this.status = status;
    this.startedAt = startedAt;
    this.trialEndsAt = trialEndsAt;
    this.renewsAt = renewsAt;
    this.endsAt = endsAt;
    this.isAutoRenew = isAutoRenew;
    this.price = price;
    this.currency = currency;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static parseApiResponse(data: any): Subscription | null {
    try {
      if (data == null) return null;
      return new Subscription(
        data.id,
        data.pack,
        data.lemonSubscriptionId ?? null,
        data.lemonCustomerId ?? null,
        data.lemonOrderId ?? null,
        data.status,
        data.startedAt ? new Date(data.startedAt) : null,
        data.trialEndsAt ? new Date(data.trialEndsAt) : null,
        data.renewsAt ? new Date(data.renewsAt) : null,
        data.endsAt ? new Date(data.endsAt) : null,
        data.isAutoRenew ?? false,
        data.price ?? null,
        data.currency ?? "EUR",
        new Date(data.createdAt),
        new Date(data.updatedAt)
      );
    } catch (error) {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): Subscription[] {
    const arr: Subscription[] = [];
    data.forEach((val) => {
      const pack = this.parseApiResponse(val);
      if (pack) arr.push(pack);
    });
    return arr;
  }

  // Optional helper
  get isActive(): boolean {
    const now = new Date();
    return (
      [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING].includes(
        this.status
      ) &&
      (!this.endsAt || this.endsAt > now)
    );
  }

  getRenewalDate(format?: string) {
    if (this.renewsAt) {
      return dayjs(this.renewsAt).format(format ? format : "DD/MM/YYYY");
    } else {
      return null;
    }
  }
  getStartDate(format?: string) {
    if (this.startedAt) {
      return dayjs(this.startedAt).format(format ? format : "DD/MM/YYYY");
    } else {
      return null;
    }
  }
}

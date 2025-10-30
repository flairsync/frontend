import dayjs from "dayjs";

export enum PricingType {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

export class SubscriptionPack {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  maxBusinesses: number;
  maxEmployees: number;
  maxMenus: number;
  maxProducts: number;
  features: string[];
  isActive?: boolean;
  pricingType: PricingType;
  lemonVariantId?: string | null;
  lemonProductId?: string | null;

  constructor(
    id: string,
    name: string,
    description: string | undefined,
    price: number,
    currency: string,
    maxBusinesses: number,
    maxEmployees: number,
    maxMenus: number,
    maxProducts: number,
    features: string[],
    pricingType: PricingType,
    isActive?: boolean,
    lemonVariantId?: string | null,
    lemonProductId?: string | null
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.currency = currency;
    this.maxBusinesses = maxBusinesses;
    this.maxEmployees = maxEmployees;
    this.maxMenus = maxMenus;
    this.maxProducts = maxProducts;
    this.features = features;
    this.pricingType = pricingType;
    this.isActive = isActive;
    this.lemonVariantId = lemonVariantId ?? null;
    this.lemonProductId = lemonProductId ?? null;
  }

  // --- Static parsing methods ---

  static parseApiResponse(data: any): SubscriptionPack | null {
    try {
      return new SubscriptionPack(
        data.id,
        data.name,
        data.description,
        parseFloat(data.price),
        data.currency,
        data.maxBusinesses,
        data.maxEmployees,
        data.maxMenus,
        data.maxProducts,
        Array.isArray(data.features)
          ? data.features
          : typeof data.features === "object"
          ? Object.keys(data.features)
          : [],
        data.pricingType as PricingType,
        data.isActive,
        data.lemonVariantId,
        data.lemonProductId
      );
    } catch {
      return null;
    }
  }

  static parseApiArrayResponse(data: any[]): SubscriptionPack[] {
    const arr: SubscriptionPack[] = [];
    data.forEach((val) => {
      const pack = this.parseApiResponse(val);
      if (pack) arr.push(pack);
    });
    return arr;
  }

  // --- Utility methods ---

  getFormattedPrice(): string {
    return `${this.price.toFixed(2)} ${this.currency}`;
  }

  getPlanDuration(): string {
    switch (this.pricingType) {
      case PricingType.MONTHLY:
        return "per month";
      case PricingType.QUARTERLY:
        return "per quarter";
      case PricingType.YEARLY:
        return "per year";
      default:
        return "";
    }
  }

  getFeatureList(): string {
    return this.features.join(", ");
  }

  getDisplayName(): string {
    return `${this.name} (${this.getPlanDuration()})`;
  }

  getShortDescription(): string {
    if (!this.description) return "No description provided.";
    return this.description.length > 100
      ? this.description.slice(0, 100) + "..."
      : this.description;
  }
}

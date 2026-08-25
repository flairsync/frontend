import dayjs from "dayjs";

export enum PricingType {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

const MONTHS_BY_PRICING_TYPE: Record<PricingType, number> = {
  [PricingType.MONTHLY]: 1,
  [PricingType.QUARTERLY]: 3,
  [PricingType.YEARLY]: 12,
};

/**
 * Normalizes a pack's price to a per-month cost so plans on different billing
 * intervals (monthly/quarterly/yearly) can be compared on a like-for-like basis.
 * Accepts plain pack-shaped objects since `Subscription.pack` from the API is
 * not always a `SubscriptionPack` class instance.
 */
export function getMonthlyEquivalentPrice(pack: { price: number; pricingType: PricingType }): number {
  return pack.price / (MONTHS_BY_PRICING_TYPE[pack.pricingType] ?? 1);
}

/**
 * Two packs are the "same plan family" (e.g. Starter Monthly vs Starter Yearly)
 * if they share the same Lemon Squeezy product id, or the same name as a fallback
 * when the product id isn't set (e.g. the Free pack).
 */
export function isSamePlanFamily(
  a: { lemonProductId?: string | null; name: string },
  b: { lemonProductId?: string | null; name: string }
): boolean {
  if (a.lemonProductId && b.lemonProductId) return a.lemonProductId === b.lemonProductId;
  return a.name === b.name;
}

export class SubscriptionPack {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  maxBusinesses: number;
  minBusinesses: number;
  includedBusinesses: number;
  extraBusinessPrice: number;
  maxEmployees: number;
  maxMenus: number;
  maxProducts: number;
  features: string[];
  isActive?: boolean;
  pricingType: PricingType;
  lemonVariantId?: string | null;
  lemonProductId?: string | null;
  isDefault: boolean;

  constructor(
    id: string,
    name: string,
    description: string | undefined,
    price: number,
    currency: string,
    maxBusinesses: number,
    minBusinesses: number,
    includedBusinesses: number,
    extraBusinessPrice: number,
    maxEmployees: number,
    maxMenus: number,
    maxProducts: number,
    features: string[],
    pricingType: PricingType,
    isActive?: boolean,
    lemonVariantId?: string | null,
    lemonProductId?: string | null,
    isDefault: boolean = false
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.currency = currency;
    this.maxBusinesses = maxBusinesses;
    this.minBusinesses = minBusinesses;
    this.includedBusinesses = includedBusinesses;
    this.extraBusinessPrice = extraBusinessPrice;
    this.maxEmployees = maxEmployees;
    this.maxMenus = maxMenus;
    this.maxProducts = maxProducts;
    this.features = features;
    this.pricingType = pricingType;
    this.isActive = isActive;
    this.lemonVariantId = lemonVariantId ?? null;
    this.lemonProductId = lemonProductId ?? null;
    this.isDefault = isDefault;
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
        data.minBusinesses ?? 1,
        data.includedBusinesses ?? 1,
        parseFloat(data.extraBusinessPrice ?? 0),
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
        data.lemonProductId,
        data.isDefault ?? false
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

  /** `price` covers up to `includedBusinesses`; each business selected beyond
   * that is billed at `extraBusinessPrice`. Selection is clamped to this
   * pack's own minimum — a pack with a 3-business minimum always prices at
   * least 3, even if fewer are selected — and to its maximum, so the price
   * stops climbing once `businessCount` exceeds what the plan supports
   * (see `exceedsMaxBusinesses`). */
  getTotalPrice(businessCount: number): number {
    let count = Math.max(businessCount, this.minBusinesses);
    if (this.maxBusinesses !== -1) count = Math.min(count, this.maxBusinesses);
    return this.price + this.extraBusinessPrice * Math.max(0, count - this.includedBusinesses);
  }

  getFormattedTotalPrice(businessCount: number): string {
    return `${this.getTotalPrice(businessCount).toFixed(2)} ${this.currency}`;
  }

  /** Whether `businessCount` is more than this pack allows (`-1` = unlimited). */
  exceedsMaxBusinesses(businessCount: number): boolean {
    return this.maxBusinesses !== -1 && businessCount > this.maxBusinesses;
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

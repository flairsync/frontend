// Named "Kind" (not "Type") to avoid colliding with the route-level
// MarketplaceItemType in components/marketplace/types.ts ('guest'|'b2b'|'saas')
// — that one names which storefront page is active, this one is the actual
// backend item classification. routeSegmentForType() bridges the two.
export type MarketplaceItemKind = 'BUSINESS' | 'PLATFORM_SAAS' | 'PLATFORM_B2B';
export type MarketplaceDiscountType = 'PERCENTAGE' | 'FIXED';

export function routeSegmentForType(type?: MarketplaceItemKind): 'saas' | 'b2b' | 'guest' {
    if (type === 'PLATFORM_B2B') return 'b2b';
    if (type === 'BUSINESS') return 'guest';
    return 'saas';
}

export class MarketplaceItem {
    constructor(
        public id: string,
        public businessId: string | null,
        public name: string,
        public description: string,
        public price: number,
        public currency: string,
        public images: string[],
        public isActive: boolean,
        public stock: number,
        public createdAt: string,
        public updatedAt: string,
        public type: MarketplaceItemKind,
        public effectivePrice: number,
        public discountActive: boolean,
        public discountType: MarketplaceDiscountType | null,
        public discountValue: number | null,
        public discountExpiresAt: string | null,

        // Cosmetic only — no backend field for this yet.
        public category?: string,
    ) {
    }

    static parseApiResponse(data: any): MarketplaceItem {
        const price = typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0;
        return new MarketplaceItem(
            data.id,
            data.businessId || null,
            data.name || "",
            data.description || "",
            price,
            data.currency || "USD",
            Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
            data.isActive ?? true,
            typeof data.stock === 'number' ? data.stock : parseInt(data.stock) || 0,
            data.createdAt || new Date().toISOString(),
            data.updatedAt || new Date().toISOString(),
            data.type || 'BUSINESS',
            typeof data.effectivePrice === 'number' ? data.effectivePrice : price,
            data.discountActive ?? false,
            data.discountType ?? null,
            data.discountValue != null ? (typeof data.discountValue === 'number' ? data.discountValue : parseFloat(data.discountValue)) : null,
            data.discountExpiresAt ?? null,
            data.category,
        );
    }
}

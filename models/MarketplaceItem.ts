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
        public createdAt: string,
        public updatedAt: string,

        // Frontend specific visual/mapping fields (from existing types)
        public type?: 'guest' | 'b2b' | 'saas',
        public category?: string,
    ) {
    }

    static parseApiResponse(data: any): MarketplaceItem {
        return new MarketplaceItem(
            data.id,
            data.businessId || null,
            data.name || "",
            data.description || "",
            typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
            data.currency || "USD",
            Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
            data.isActive ?? true,
            data.createdAt || new Date().toISOString(),
            data.updatedAt || new Date().toISOString(),
            data.type,
            data.category
        );
    }
}

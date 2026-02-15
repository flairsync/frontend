export type MarketplaceItemType = 'guest' | 'b2b' | 'saas';

export interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    type: MarketplaceItemType;
    image?: string;
    icon?: string;
    category?: string;
    customizable?: boolean;
}

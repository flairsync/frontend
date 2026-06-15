import { BusinessTag } from "../business/BusinessTag";
import { BusinessType } from "../business/BusinessType";
import { BusinessMedia } from "../business/BusinessMedia";

export class DiscoveryBusiness {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    distance?: number;
    type: BusinessType | null;
    tags: BusinessTag[];
    media: BusinessMedia[];
    address?: string;
    city?: string;
    state?: string;
    priceLevel?: number;
    timezone?: string;
    currency?: string;
    country?: { id: number; name: string };
    isOpen?: boolean;
    isFavorite?: boolean;
    rating?: number | null;
    reviewCount?: number;
    location?: {
        type: string;
        coordinates: number[];
    };

    constructor(
        id: string,
        name: string,
        description: string | undefined,
        logo: string | undefined,
        distance: number | undefined,
        type: BusinessType | null,
        tags: BusinessTag[],
        media: BusinessMedia[],
        address?: string,
        city?: string,
        state?: string,
        priceLevel?: number,
        timezone?: string,
        currency?: string,
        country?: { id: number; name: string },
        isOpen?: boolean,
        isFavorite?: boolean,
        rating?: number | null,
        reviewCount?: number,
        location?: { type: string; coordinates: number[] }
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.logo = logo;
        this.distance = distance;
        this.type = type;
        this.tags = tags;
        this.media = media;
        this.address = address;
        this.city = city;
        this.state = state;
        this.priceLevel = priceLevel;
        this.timezone = timezone;
        this.currency = currency;
        this.country = country;
        this.isOpen = isOpen;
        this.isFavorite = isFavorite;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.location = location;
    }

    static parseApiResponse(data: any): DiscoveryBusiness | null {
        if (!data) return null;
        try {
            return new DiscoveryBusiness(
                data.id,
                data.name,
                data.description,
                data.logo,
                data.distance,
                BusinessType.parseApiResponse(data.type),
                BusinessTag.parseApiArrayResponse(data.tags || []),
                BusinessMedia.parseApiArrayResponse(data.media || []),
                data.address,
                data.city,
                data.state,
                data.priceLevel,
                data.timezone,
                data.currency,
                typeof data.country === 'string' ? { id: 0, name: data.country } : data.country,
                data.isOpen,
                data.isFavorite ?? true,
                data.rating ?? null,
                data.reviewCount ?? 0,
                data.location
            );
        } catch {
            return null;
        }
    }

    static parseApiArrayResponse(data: any[]): DiscoveryBusiness[] {
        if (!Array.isArray(data)) return [];
        const arr: DiscoveryBusiness[] = [];
        data.forEach((val) => {
            const b = this.parseApiResponse(val);
            if (b) arr.push(b);
        });
        return arr;
    }
}

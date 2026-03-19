import { BusinessTag } from "../business/BusinessTag";
import { BusinessType } from "../business/BusinessType";
import { BusinessMedia } from "../business/BusinessMedia";
import { OpeningHours, Country } from "../business/MyBusinessFullDetails";

export class DiscoveryBusinessProfile {
    id: string;
    name: string;
    description?: string;
    logo?: string;
    type: BusinessType | null;
    tags: BusinessTag[];
    media: BusinessMedia[];

    // Important Flags for UI
    allowReservations: boolean;
    allowOrders: boolean;
    isFavorite?: boolean;

    requireReservationConfirmation: boolean;
    requireOrderConfirmation: boolean;
    allowOnlyNearbyOrders: boolean;
    allowTableOrdering: boolean;
    allowTakeawayOrdering: boolean;
    reservationCancellationWindow: number;
    reservationModificationLimit: number;
    reservationTimeoutMinutes: number;
    defaultReservationDurationMinutes: number;
    maxOrderDistanceMeters: number;

    // Location
    country: Country | null;
    city?: string;
    state?: string;
    address?: string;
    location?: { type: string; coordinates: number[] };
    timezone: string;
    currency?: string;

    // Extras
    priceLevel: number;
    openingHours: OpeningHours[];
    facebook?: string;
    instagram?: string;
    email?: string;
    phone?: string;
    website?: string;

    constructor(
        id: string,
        name: string,
        description: string | undefined,
        logo: string | undefined,
        type: BusinessType | null,
        tags: BusinessTag[],
        media: BusinessMedia[],
        allowReservations: boolean,
        allowOrders: boolean,
        isFavorite: boolean | undefined,
        country: Country | null,
        city: string | undefined,
        state: string | undefined,
        address: string | undefined,
        location: { type: string; coordinates: number[] } | undefined,
        timezone: string,
        currency: string | undefined,
        priceLevel: number,
        openingHours: OpeningHours[],
        facebook: string | undefined,
        instagram: string | undefined,
        email: string | undefined,
        phone: string | undefined,
        website: string | undefined,
        requireReservationConfirmation: boolean,
        requireOrderConfirmation: boolean,
        allowOnlyNearbyOrders: boolean,
        allowTableOrdering: boolean,
        allowTakeawayOrdering: boolean,
        reservationCancellationWindow: number,
        reservationModificationLimit: number,
        reservationTimeoutMinutes: number,
        defaultReservationDurationMinutes: number,
        maxOrderDistanceMeters: number
    ) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.logo = logo;
        this.type = type;
        this.tags = tags;
        this.media = media;
        this.allowReservations = allowReservations;
        this.allowOrders = allowOrders;
        this.isFavorite = isFavorite;
        this.country = country;
        this.city = city;
        this.state = state;
        this.address = address;
        this.location = location;
        this.timezone = timezone;
        this.currency = currency;
        this.priceLevel = priceLevel;
        this.openingHours = openingHours;
        this.facebook = facebook;
        this.instagram = instagram;
        this.email = email;
        this.phone = phone;
        this.website = website;
        this.requireReservationConfirmation = requireReservationConfirmation;
        this.requireOrderConfirmation = requireOrderConfirmation;
        this.allowOnlyNearbyOrders = allowOnlyNearbyOrders;
        this.allowTableOrdering = allowTableOrdering;
        this.allowTakeawayOrdering = allowTakeawayOrdering;
        this.reservationCancellationWindow = reservationCancellationWindow;
        this.reservationModificationLimit = reservationModificationLimit;
        this.reservationTimeoutMinutes = reservationTimeoutMinutes;
        this.defaultReservationDurationMinutes = defaultReservationDurationMinutes;
        this.maxOrderDistanceMeters = maxOrderDistanceMeters;
    }

    static parseApiArrayResponse(data: any[]): DiscoveryBusinessProfile[] {
        if (!Array.isArray(data)) return [];
        const arr: DiscoveryBusinessProfile[] = [];
        data.forEach((val) => {
            const b = this.parseApiResponse(val);
            if (b) arr.push(b);
        });
        return arr;
    }

    static parseApiResponse(data: any): DiscoveryBusinessProfile | null {
        if (!data) return null;
        try {
            return new DiscoveryBusinessProfile(
                data.id,
                data.name,
                data.description,
                data.logo,
                BusinessType.parseApiResponse(data.type),
                BusinessTag.parseApiArrayResponse(data.tags || []),
                BusinessMedia.parseApiArrayResponse(data.media || []),
                !!data.allowReservations,
                !!data.allowOrders,
                !!data.isFavorite,
                data.country,
                data.city,
                data.state,
                data.address,
                data.location,
                data.timezone || "UTC",
                data.currency,
                data.priceLevel || 1,
                OpeningHours.parseApiArrayResponse(data.openingHours || []),
                data.facebook,
                data.instagram,
                data.email,
                data.phone,
                data.website,
                !!data.requireReservationConfirmation,
                !!data.requireOrderConfirmation,
                !!data.allowOnlyNearbyOrders,
                data.allowTableOrdering !== undefined ? !!data.allowTableOrdering : true,
                data.allowTakeawayOrdering !== undefined ? !!data.allowTakeawayOrdering : true,
                data.reservationCancellationWindow !== undefined ? Number(data.reservationCancellationWindow) : 1,
                data.reservationModificationLimit !== undefined ? Number(data.reservationModificationLimit) : 120,
                data.reservationTimeoutMinutes !== undefined ? Number(data.reservationTimeoutMinutes) : 15,
                data.defaultReservationDurationMinutes !== undefined ? Number(data.defaultReservationDurationMinutes) : 120,
                data.maxOrderDistanceMeters !== undefined && data.maxOrderDistanceMeters !== null ? Number(data.maxOrderDistanceMeters) : 500
            );
        } catch {
            return null;
        }
    }
}

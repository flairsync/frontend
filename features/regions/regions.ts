import flairapi from "@/lib/flairapi";

export interface Region {
    id: string;
    name: string;
    ownerId: string;
    organizationId: string | null;
    createdAt: string;
    updatedAt: string;
    businessCount?: number;
}

export interface RegionBusiness {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    logo: string | null;
    timezone: string;
    currency: string;
    location: { coordinates: [number, number] } | null;
}

export interface RegionDetail {
    region: Region;
    businesses: RegionBusiness[];
    organizationName: string | null;
}

export interface RegionDashboardRow {
    businessId: string;
    name: string;
    sales: number;
    orderCount: number;
    lowStockCount: number;
    laborCost: number;
}

export interface RegionDashboard {
    businesses: RegionDashboardRow[];
    totals: {
        sales: number;
        orderCount: number;
        lowStockCount: number;
        laborCost: number;
    };
}

const baseUrl = `${'https://api.flairsync.com/api/v1'}/regions`;

export const regionsApi = {
    listMine: () =>
        flairapi.get(`${baseUrl}/my`).then((r) => r.data.data as Region[]),

    create: (name: string) =>
        flairapi.post(baseUrl, { name }).then((r) => r.data.data as Region),

    detail: (regionId: string) =>
        flairapi.get(`${baseUrl}/${regionId}`).then((r) => r.data.data as RegionDetail),

    dashboard: (regionId: string, start: string, end: string) =>
        flairapi
            .get(`${baseUrl}/${regionId}/dashboard`, { params: { start, end } })
            .then((r) => r.data.data as RegionDashboard),
};

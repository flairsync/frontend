import flairapi from "@/lib/flairapi";

export interface Organization {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    businessCount?: number;
}

export interface OrganizationBusiness {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    logo: string | null;
    timezone: string;
    currency: string;
    location: { coordinates: [number, number] } | null;
    regionId: string | null;
}

export interface OrganizationRegion {
    id: string;
    name: string;
}

export interface OrganizationDetail {
    organization: Organization;
    businesses: OrganizationBusiness[];
    regions: OrganizationRegion[];
}

export interface OrganizationDashboardRow {
    businessId: string;
    name: string;
    sales: number;
    orderCount: number;
    lowStockCount: number;
    laborCost: number;
}

export interface OrganizationDashboard {
    businesses: OrganizationDashboardRow[];
    totals: {
        sales: number;
        orderCount: number;
        lowStockCount: number;
        laborCost: number;
    };
}

const baseUrl = `${'https://api.flairsync.com/api/v1'}/organizations`;

export const organizationsApi = {
    listMine: () =>
        flairapi.get(`${baseUrl}/my`).then((r) => r.data.data as Organization[]),

    create: (name: string) =>
        flairapi.post(baseUrl, { name }).then((r) => r.data.data as Organization),

    detail: (orgId: string) =>
        flairapi.get(`${baseUrl}/${orgId}`).then((r) => r.data.data as OrganizationDetail),

    // Attaching/detaching a business or region now goes through the
    // join-requests handshake (features/join-requests) instead of a direct
    // endpoint here — linking across two different owners needs approval.

    dashboard: (orgId: string, start: string, end: string) =>
        flairapi
            .get(`${baseUrl}/${orgId}/dashboard`, { params: { start, end } })
            .then((r) => r.data.data as OrganizationDashboard),
};

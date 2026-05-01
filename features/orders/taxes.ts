import flairapi from "@/lib/flairapi";

export interface TaxRate {
    id: string;
    businessId: string;
    name: string;
    rate: number;
    isInclusive: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaxRatePayload {
    name: string;
    rate: number;
    isInclusive?: boolean;
    isActive?: boolean;
}

const getUrl = (businessId: string) =>
    `${import.meta.env.BASE_URL}/businesses/${businessId}/taxes`;

export const taxesApi = {
    list: (businessId: string) =>
        flairapi.get(getUrl(businessId)).then((r) => r.data.data as TaxRate[]),

    create: (businessId: string, payload: CreateTaxRatePayload) =>
        flairapi.post(getUrl(businessId), payload).then((r) => r.data.data as TaxRate),

    update: (businessId: string, taxId: string, payload: Partial<CreateTaxRatePayload>) =>
        flairapi.patch(`${getUrl(businessId)}/${taxId}`, payload).then((r) => r.data.data as TaxRate),

    remove: (businessId: string, taxId: string) =>
        flairapi.delete(`${getUrl(businessId)}/${taxId}`),
};

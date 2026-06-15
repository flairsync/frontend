import flairapi from "@/lib/flairapi"

export interface BusinessTax {
    id: string
    businessId: string
    name: string
    rate: number
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface BusinessTaxGroup {
    id: string
    businessId: string
    name: string
    taxes: BusinessTax[]
    createdAt: string
    updatedAt: string
}

const taxUrl = (businessId: string) =>
    `${import.meta.env.BASE_URL}/business/my/${businessId}/taxes`

const groupUrl = (businessId: string) =>
    `${import.meta.env.BASE_URL}/business/my/${businessId}/taxes/groups`

const parseTax = (t: any): BusinessTax => ({ ...t, rate: Number(t.rate) })
const parseGroup = (g: any): BusinessTaxGroup => ({ ...g, taxes: (g.taxes ?? []).map(parseTax) })

export const businessTaxApi = {
    listTaxes: (businessId: string) =>
        flairapi.get(taxUrl(businessId)).then((r) => (r.data.data as any[]).map(parseTax)),

    createTax: (businessId: string, payload: { name: string; rate: number; isDefault?: boolean }) =>
        flairapi.post(taxUrl(businessId), payload).then((r) => parseTax(r.data.data)),

    updateTax: (businessId: string, taxId: string, payload: { name?: string; rate?: number; isDefault?: boolean }) =>
        flairapi.patch(`${taxUrl(businessId)}/${taxId}`, payload).then((r) => parseTax(r.data.data)),

    setDefault: (businessId: string, taxId: string) =>
        flairapi.patch(`${taxUrl(businessId)}/${taxId}/set-default`).then((r) => parseTax(r.data.data)),

    deleteTax: (businessId: string, taxId: string) =>
        flairapi.delete(`${taxUrl(businessId)}/${taxId}`),

    listGroups: (businessId: string) =>
        flairapi.get(groupUrl(businessId)).then((r) => (r.data.data as any[]).map(parseGroup)),

    createGroup: (businessId: string, payload: { name: string; taxIds: string[] }) =>
        flairapi.post(groupUrl(businessId), payload).then((r) => parseGroup(r.data.data)),

    updateGroup: (businessId: string, groupId: string, payload: { name?: string; taxIds?: string[] }) =>
        flairapi.patch(`${groupUrl(businessId)}/${groupId}`, payload).then((r) => parseGroup(r.data.data)),

    deleteGroup: (businessId: string, groupId: string) =>
        flairapi.delete(`${groupUrl(businessId)}/${groupId}`),
}

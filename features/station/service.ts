import flairapi from "@/lib/flairapi";

const base = (businessId: string) =>
  `${import.meta.env.VITE_API_BASE_URL}/station/businesses/${businessId}`;

export const stationService = {
  generatePairingCode: (businessId: string) =>
    flairapi.post<{ data: { code: string; expiresAt: string } }>(
      `${base(businessId)}/pairing-codes`
    ),

  listStations: (businessId: string) =>
    flairapi.get<{ data: StationRecord[] }>(`${base(businessId)}/stations`),

  updateStation: (
    businessId: string,
    stationId: string,
    payload: { name?: string; type?: "pos" | "kds"; kitchenStationId?: string | null }
  ) =>
    flairapi.patch<{ data: StationRecord }>(
      `${base(businessId)}/stations/${stationId}`,
      payload
    ),

  revokeStation: (businessId: string, stationId: string) =>
    flairapi.delete(`${base(businessId)}/stations/${stationId}`),
};

const ksBase = (businessId: string) =>
  `${import.meta.env.VITE_API_BASE_URL}/businesses/${businessId}/kitchen-stations`;

export const kitchenStationService = {
  list: (businessId: string) =>
    flairapi.get<{ data: KitchenStation[] }>(ksBase(businessId)),

  create: (businessId: string, name: string) =>
    flairapi.post<{ data: KitchenStation }>(ksBase(businessId), { name }),

  update: (
    businessId: string,
    ksId: string,
    payload: { name?: string; status?: KitchenStationStatus; active?: boolean }
  ) =>
    flairapi.patch<{ data: KitchenStation }>(`${ksBase(businessId)}/${ksId}`, payload),

  remove: (businessId: string, ksId: string) =>
    flairapi.delete(`${ksBase(businessId)}/${ksId}`),

  reorder: (businessId: string, order: { id: string; sortOrder: number }[]) =>
    flairapi.patch<{ data: KitchenStation[] }>(`${ksBase(businessId)}/reorder`, { order }),
};

export type KitchenStationStatus = "getting_ready" | "ready" | "broken" | "offline";

export interface KitchenStation {
  id: string;
  name: string;
  status: KitchenStationStatus;
  active: boolean;
  sortOrder: number;
}

const catRuleBase = (businessId: string) =>
  `${ksBase(businessId)}/category-rules`;

export interface CategoryRule {
  id: string;
  businessId: string;
  categoryId: string;
  kitchenStationId: string;
  createdAt: string;
  updatedAt: string;
}

export const categoryRuleService = {
  list: (businessId: string) =>
    flairapi.get<{ data: CategoryRule[] }>(catRuleBase(businessId)),

  upsert: (businessId: string, categoryId: string, kitchenStationId: string) =>
    flairapi.post<{ data: CategoryRule }>(catRuleBase(businessId), { categoryId, kitchenStationId }),

  remove: (businessId: string, ruleId: string) =>
    flairapi.delete(`${catRuleBase(businessId)}/${ruleId}`),
};

export interface StationRecord {
  id: string;
  name: string;
  type: "pos" | "kds";
  isActive: boolean;
  lastSeenAt: string | null;
  deviceUuid: string;
  kitchenStationId?: string | null;
}

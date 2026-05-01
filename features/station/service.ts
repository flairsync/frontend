import flairapi from "@/lib/flairapi";

const base = (businessId: string) =>
  `${import.meta.env.BASE_URL}/station/businesses/${businessId}`;

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
    payload: { name?: string; type?: "pos" | "kds" }
  ) =>
    flairapi.patch<{ data: StationRecord }>(
      `${base(businessId)}/stations/${stationId}`,
      payload
    ),

  revokeStation: (businessId: string, stationId: string) =>
    flairapi.delete(`${base(businessId)}/stations/${stationId}`),
};

export interface StationRecord {
  id: string;
  name: string;
  type: "pos" | "kds";
  isActive: boolean;
  lastSeenAt: string | null;
  deviceUuid: string;
}

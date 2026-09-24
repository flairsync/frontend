export interface StationInfo {
  id: string;
  deviceUuid: string;
  name: string;
  type: "pos" | "kds";
  businessId: string;
  isActive: boolean;
  lastSeenAt: string;
  kitchenStationId?: string | null;
  // GAP-08: already present on the raw /station/me response (StationService.getMyStation
  // returns the full Station entity) — just never typed here until the WebUSB path needed
  // the frontend to branch on it before deciding how to print.
  printerType: "none" | "escpos_network" | "webusb";
  printerHost: string | null;
  printerPort: number | null;
  hasCashDrawer: boolean;
  printerConfig?: Record<string, any> | null;
  business: {
    id: string;
    name: string;
    currency: string;
    timezone: string;
    allowTableOrdering: boolean;
    allowTakeawayOrdering: boolean;
    taxIncluded: boolean;
    // `rate` is a Postgres decimal column, so /station/me sends it as a string ("10.00").
    // normalizeStationInfo (features/station/bootstrap.service.ts) coerces it on the way in,
    // which is what makes `number` true here — don't bypass that parse step.
    taxes: { id: string; name: string; rate: number; isDefault: boolean }[];
  };
}

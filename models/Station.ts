export interface StationInfo {
  id: string;
  deviceUuid: string;
  name: string;
  type: "pos" | "kds";
  businessId: string;
  isActive: boolean;
  lastSeenAt: string;
  business: {
    id: string;
    name: string;
    currency: string;
    timezone: string;
    allowTableOrdering: boolean;
    allowTakeawayOrdering: boolean;
  };
}

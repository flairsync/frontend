import { staffApi } from "./station-api";

export interface ExpoItem {
  id: string;
  nameSnapshot: string;
  quantity: number;
  status: string;
}

export interface ExpoStation {
  kitchenStationId: string | null;
  done: boolean;
  items: ExpoItem[];
}

export interface ExpoOrder {
  id: string;
  status: string;
  tableName: string | null;
  kitchenNotes: string | null;
  priority: number;
  readyAt: string | null;
  createdAt: string;
  allStationsDone: boolean;
  requiresExpoConfirm: boolean;
  stations: ExpoStation[];
}

export const fetchExpoOrdersApiCall = async (): Promise<ExpoOrder[]> => {
  const params: Record<string, string> = { expo: "true" };
  const maxAge = localStorage.getItem("kds_ready_max_age");
  if (maxAge) params.readyMaxAgeMinutes = maxAge;

  const res = await staffApi.get<{ data: ExpoOrder[] }>("/station/kds-orders", { params });
  return res.data.data ?? [];
};

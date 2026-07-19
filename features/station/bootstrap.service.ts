import { stationApi } from "./station-api";
import type { StationInfo } from "@/models/Station";
import type { PosBootstrapData, PosMenu } from "@/features/pos/types";

// Map raw API response fields to the PosMenu shape expected by the UI
export function normalizePosMenus(raw: any[]): PosMenu[] {
  return raw.map((menu) => ({
    id: menu.id,
    name: menu.name,
    isActive: !menu.deletedAt,
    categories: (menu.categories ?? []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      items: (cat.items ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? null,
        basePrice: parseFloat(item.price ?? item.basePrice ?? "0"),
        images: Array.isArray(item.images) ? item.images : item.imageUrl ? [item.imageUrl] : [],
        isAvailable: item.isActive ?? item.isAvailable ?? true,
        variants: (item.variants ?? []).map((v: any) => ({
          id: v.id,
          name: v.name,
          price: parseFloat(v.price ?? "0"),
        })),
        modifierGroups: (item.modifierGroups ?? []).map((mg: any) => ({
          id: mg.id,
          name: mg.name,
          required: mg.required ?? (mg.minSelections > 0),
          minSelections: mg.minSelections ?? 0,
          maxSelections: mg.maxSelections ?? 1,
          items: (mg.items ?? []).map((mgi: any) => ({
            id: mgi.id,
            name: mgi.name,
            price: parseFloat(mgi.price ?? "0"),
          })),
        })),
      })),
    })),
  }));
}

export interface StationBootstrapResult {
  stationInfo: StationInfo;
  bootstrapData: PosBootstrapData;
}

export const fetchStationBootstrapApiCall = async (): Promise<StationBootstrapResult> => {
  const [stationRes, menuRes, tableRes] = await Promise.all([
    stationApi.get("/station/me"),
    stationApi.get("/station/menu"),
    stationApi.get("/station/tables"),
  ]);

  const rawMenuArray: any[] = Array.isArray(menuRes.data)
    ? menuRes.data
    : Array.isArray(menuRes.data?.data)
    ? menuRes.data.data
    : [];

  const tables = tableRes.data?.data ?? [];

  return {
    stationInfo: stationRes.data.data,
    bootstrapData: { menus: normalizePosMenus(rawMenuArray), tables },
  };
};

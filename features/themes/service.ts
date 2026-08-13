import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "../shared/api-response";
import { ThemeCatalogItem } from "./types";

const baseUrl = `${API_URL}/businesses`;

export const fetchThemeCatalogApiCall = async (businessId: string) =>
  unwrap<ThemeCatalogItem[]>(await flairapi.get(`${baseUrl}/${businessId}/themes`));

export const applyThemeApiCall = (businessId: string, themeId: string) =>
  flairapi.patch(`${baseUrl}/${businessId}/themes/${themeId}/apply`);

export const purchaseThemeApiCall = async (businessId: string, themeId: string) =>
  unwrap<{ url: string }>(
    await flairapi.post(`${baseUrl}/${businessId}/themes/${themeId}/checkout`),
  );

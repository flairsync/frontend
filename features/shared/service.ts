import flairapi, { API_URL } from "@/lib/flairapi";
import { unwrap } from "./api-response";
const baseUrl = `${API_URL}/countries`;
const permissionsUrl = `${API_URL}/permissions`;

const countriesListUrl = `${baseUrl}/list`;

export const getCountriesListApiCall = async (includeAll?: boolean) =>
  unwrap(await flairapi.get(countriesListUrl, {
    params: { includeAll: includeAll ? 'true' : undefined },
  }));

export const getPermissionsListApiCall = async () =>
  unwrap(await flairapi.get(permissionsUrl));

export const fetchAllergiesApiCall = async () =>
  unwrap(await flairapi.get(`${API_URL}/allergy`));

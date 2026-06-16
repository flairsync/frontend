import flairapi from "@/lib/flairapi";
import { unwrap } from "./api-response";
const baseUrl = `${import.meta.env.PUBLIC_ENV__BASE_URL}/countries`;
const permissionsUrl = `${import.meta.env.PUBLIC_ENV__BASE_URL}/permissions`;

const countriesListUrl = `${baseUrl}/list`;

export const getCountriesListApiCall = async (includeAll?: boolean) =>
  unwrap(await flairapi.get(countriesListUrl, {
    params: { includeAll: includeAll ? 'true' : undefined },
  }));

export const getPermissionsListApiCall = async () =>
  unwrap(await flairapi.get(permissionsUrl));

export const fetchAllergiesApiCall = async () =>
  unwrap(await flairapi.get(`${import.meta.env.PUBLIC_ENV__BASE_URL}/allergy`));

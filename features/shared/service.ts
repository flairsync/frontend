import flairapi from "@/lib/flairapi";
import { unwrap } from "./api-response";
const baseUrl = `${'https://api.flairsync.com/api/v1'}/countries`;
const permissionsUrl = `${'https://api.flairsync.com/api/v1'}/permissions`;

const countriesListUrl = `${baseUrl}/list`;

export const getCountriesListApiCall = async (includeAll?: boolean) =>
  unwrap(await flairapi.get(countriesListUrl, {
    params: { includeAll: includeAll ? 'true' : undefined },
  }));

export const getPermissionsListApiCall = async () =>
  unwrap(await flairapi.get(permissionsUrl));

export const fetchAllergiesApiCall = async () =>
  unwrap(await flairapi.get(`${'https://api.flairsync.com/api/v1'}/allergy`));

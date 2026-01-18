import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/countries`;
const permissionsUrl = `${import.meta.env.BASE_URL}/permissions`;

const countriesListUrl = `${baseUrl}/list`;

export const getCountriesListApiCall = () => {
  return flairapi.get(countriesListUrl);
};

export const getPermissionsListApiCall = () => {
  return flairapi.get(permissionsUrl);
};

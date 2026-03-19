import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/countries`;
const permissionsUrl = `${import.meta.env.BASE_URL}/permissions`;

const countriesListUrl = `${baseUrl}/list`;

export const getCountriesListApiCall = (includeAll?: boolean) => {
  return flairapi.get(countriesListUrl, {
    params: {
      includeAll: includeAll ? 'true' : undefined
    }
  });
};

export const getPermissionsListApiCall = () => {
  return flairapi.get(permissionsUrl);
};

export const fetchAllergiesApiCall = () => {
  return flairapi.get(`${import.meta.env.BASE_URL}/allergy`);
};

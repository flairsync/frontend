import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}/countries`;

const countriesListUrl = `${baseUrl}/list`;

export const getCountriesListApiCall = () => {
  return flairapi.get(countriesListUrl);
};

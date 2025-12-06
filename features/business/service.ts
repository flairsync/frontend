import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}`;

const getBusinessTagsUrl = `${baseUrl}/business-tags`;
const getBusinessTypesUrl = `${baseUrl}/business-types`;

// Public business Routes

export const getBusinessTagsApiCall = () => {
  return flairapi.get(getBusinessTagsUrl);
};
export const getBusinessTypesApiCall = () => {
  return flairapi.get(getBusinessTypesUrl);
};

import flairapi from "@/lib/flairapi";
const baseUrl = `${import.meta.env.BASE_URL}`;
const baseBusinessUrl = `${import.meta.env.BASE_URL}/business`;

const getBusinessTagsUrl = `${baseUrl}/business-tags`;
const getBusinessTypesUrl = `${baseUrl}/business-types`;

const createNewBusinessTypesUrl = `${baseBusinessUrl}/new`;

// Public business Routes

export const getBusinessTagsApiCall = () => {
  return flairapi.get(getBusinessTagsUrl);
};
export const getBusinessTypesApiCall = () => {
  return flairapi.get(getBusinessTypesUrl);
};

// Private business routes

export const createNewBusinessApiCall = (data: any) => {
  return flairapi.post(createNewBusinessTypesUrl, data);
};

import flairapi from "@/lib/flairapi";
import { UpdateBusinessDetailsDto } from "@/models/business/MyBusinessFullDetails";
const baseUrl = `${import.meta.env.BASE_URL}`;
const baseBusinessUrl = `${import.meta.env.BASE_URL}/business`;

const getBusinessTagsUrl = `${baseUrl}/business-tags`;
const getBusinessTypesUrl = `${baseUrl}/business-types`;

const createNewBusinessTypesUrl = `${baseBusinessUrl}/new`;
const getMyBusinessUrl = `${baseBusinessUrl}/my`;

const updateMyBusinessLogoSuffix = "media/logo";

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

export const fetchMyBusinessesApiCall = (page: number, limit: number) => {
  return flairapi.get(getMyBusinessUrl, {
    params: {
      page,
      limit,
    },
  });
};

export const fetchMyBuysinessFullDetailsApiCall = (businessId: string) => {
  return flairapi.get(`${getMyBusinessUrl}/${businessId}`);
};

export const updateMyBusinessDetailsApiCall = (
  businessId: string,
  data: UpdateBusinessDetailsDto
) => {
  return flairapi.patch(`${getMyBusinessUrl}/${businessId}`, data);
};

export const updateMyBusinessLogoApiCall = (businessId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  flairapi.post(
    `${getMyBusinessUrl}/${businessId}/${updateMyBusinessLogoSuffix}`,
    formData
  );
};

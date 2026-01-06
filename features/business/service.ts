import flairapi from "@/lib/flairapi";
import { UpdateBusinessDetailsDto } from "@/models/business/MyBusinessFullDetails";
const baseUrl = `${import.meta.env.BASE_URL}`;
const baseBusinessUrl = `${import.meta.env.BASE_URL}/business`;

const getBusinessTagsUrl = `${baseUrl}/business-tags`;
const getBusinessTypesUrl = `${baseUrl}/business-types`;

const createNewBusinessTypesUrl = `${baseBusinessUrl}/new`;
const MyBusinessUrl = `${baseBusinessUrl}/my`;

const updateMyBusinessLogoSuffix = "media/logo";
const updateMyBusinessGallerySuffix = "media/gallery";

const businessOpenHoursSuffix = "open-hours";

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
  return flairapi.get(MyBusinessUrl, {
    params: {
      page,
      limit,
    },
  });
};

export const fetchMyBuysinessFullDetailsApiCall = (businessId: string) => {
  return flairapi.get(`${MyBusinessUrl}/${businessId}`);
};

export const updateMyBusinessDetailsApiCall = (
  businessId: string,
  data: UpdateBusinessDetailsDto
) => {
  return flairapi.patch(`${MyBusinessUrl}/${businessId}`, data);
};

export const updateMyBusinessLogoApiCall = (businessId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  flairapi.post(
    `${MyBusinessUrl}/${businessId}/${updateMyBusinessLogoSuffix}`,
    formData
  );
};

export type UpdateBusinessGalleryDataType = {
  files: File[];
  delete: string[];
  order: {
    id: string;
    order: number;
  }[];
};

export const updateMyBusienssGalleryApiCall = (
  businessId: string,
  data: UpdateBusinessGalleryDataType
) => {
  const formData = new FormData();
  // FILES
  data.files.forEach((file: File) => {
    formData.append("files", file);
  });

  // DELETE (array of UUIDs)
  if (data.delete?.length) {
    formData.append("delete", JSON.stringify(data.delete));
  }

  // ORDER
  if (data.order?.length) {
    formData.append("order", JSON.stringify(data.order));
  }

  flairapi.post(
    `${MyBusinessUrl}/${businessId}/${updateMyBusinessGallerySuffix}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const updateMyBusinessOpenHoursApiCall = (
  businessId: string,
  payload: any
) => {
  return flairapi.patch(
    `${MyBusinessUrl}/${businessId}/${businessOpenHoursSuffix}`,
    payload
  );
};

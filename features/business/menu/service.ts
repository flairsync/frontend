import flairapi from "@/lib/flairapi";
const baseBusinessUrl = `${import.meta.env.BASE_URL}/businesses`;

const getMenusUrl = (businessId: string) => {
  return `${baseBusinessUrl}/${businessId}/menus`;
};

export const fetchBusinessBasicMenusApiCall = (businessId: string) => {
  return flairapi.get(`${getMenusUrl(businessId)}/all`);
};

export type CreateMenuDto = {
  name: string;

  description?: string;

  startDate?: string;

  endDate?: string;

  startTime?: string; // "HH:MM:SS"

  endTime?: string; // "HH:MM:SS"

  repeatYearly?: boolean;

  repeatDaysOfWeek?: number[];
};

export const createBusinessMenuApiCall = (
  businessId: string,
  data: CreateMenuDto,
) => {
  return flairapi.post(getMenusUrl(businessId), data);
};

export const fetchBusinessSingleMenuApiCall = (
  businessId: string,
  menuId: string,
) => {
  return flairapi.get(`${getMenusUrl(businessId)}/${menuId}`);
};

export type CreateMenuCategoryDto = {
  name: string;
  description: string;
};

export const createNewMenuCategoryApiCall = (
  businessId: string,
  menuId: string,
  data: CreateMenuCategoryDto,
) => {
  return flairapi.post(`${getMenusUrl(businessId)}/${menuId}/category`, data);
};

export type CreateMenuItemDto = {
  name: string;
  description: string;
  price: number;
  allergies: string[];
  files: File[];
};

export const createNewMenuItemApiCall = (
  businessId: string,
  menuId: string,
  catId: string,
  data: CreateMenuItemDto,
) => {
  const payload = new FormData();

  payload.append("name", data.name);
  payload.append("description", data.description);
  payload.append("price", data.price.toString());

  // allergies[] → backend-friendly
  data.allergies.forEach((allergyId) => {
    payload.append("allergies", allergyId);
  });

  // files[]
  data.files.forEach((file) => {
    payload.append("files", file);
  });

  return flairapi.post(
    `${getMenusUrl(businessId)}/${menuId}/${catId}/item`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

export const deleteMenuItemApiCall = (
  businessId: string,
  menuId: string,
  catId: string,
  itemId: string,
) => {
  return flairapi.delete(
    `${getMenusUrl(businessId)}/${menuId}/${catId}/${itemId}`,
  );
};

export type UpdateMenuItemDto = {
  name?: string;
  description?: string;
  price?: number;
  allergies?: string[];
  files?: File[];
};

export const updateMenuItemApiCall = (
  businessId: string,
  menuId: string,
  catId: string,
  itemId: string,
  data: UpdateMenuItemDto,
) => {
  const payload = new FormData();

  if (data.name !== undefined) payload.append("name", data.name);
  if (data.description !== undefined)
    payload.append("description", data.description);
  if (data.price !== undefined) payload.append("price", data.price.toString());

  // allergies[] → backend-friendly
  if (data.allergies) {
    data.allergies.forEach((allergyId) => {
      payload.append("allergies", allergyId);
    });
  }

  // files[] → only append new files
  if (data.files) {
    data.files.forEach((file) => {
      payload.append("files", file);
    });
  }

  return flairapi.patch(
    `${getMenusUrl(businessId)}/${menuId}/${catId}/${itemId}`,
    payload,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
};

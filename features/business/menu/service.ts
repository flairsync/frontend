import flairapi from "@/lib/flairapi";
const baseBusinessUrl = `${import.meta.env.BASE_URL}/businesses`;

const getMenusUrl = (businessId: string) => {
  return `${baseBusinessUrl}/${businessId}/menus`;
};

// Types

export type OrderChange = {
  id: string;
  order: number;
};

export type ItemParentChange = {
  itemId: string;
  fromCategoryId: string;
  toCategoryId: string;
};

export type MenuChanges = {
  categoryOrderChanges: OrderChange[];
  itemOrderChanges: OrderChange[];
  itemParentChanges: ItemParentChange[];
};

//#region Menu
export const fetchBusinessBasicMenusApiCall = (businessId: string) => {
  return flairapi.get(`${getMenusUrl(businessId)}/all`);
};

export type CreateMenuDto = {
  name: string | null;
  description: string | null;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD"
  startTime: string | null; // "HH:MM:SS"
  endTime: string | null; // "HH:MM:SS"
  repeatYearly: boolean | null;
  repeatDaysOfWeek: number[] | null;
  icon: string | null;
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

export type UpdateMenuDto = {
  name: string | null;
  description: string | null;
  startDate: string | null; // "YYYY-MM-DD"
  endDate: string | null; // "YYYY-MM-DD"
  startTime: string | null; // "HH:MM:SS"
  endTime: string | null; // "HH:MM:SS"
  repeatYearly: boolean | null;
  repeatDaysOfWeek: number[] | null;
  icon: string | null;
};

export const updateBusinessMenuApiCall = (
  businessId: string,
  menuId: string,
  data: UpdateMenuDto,
) => {
  return flairapi.patch(`${getMenusUrl(businessId)}/${menuId}`, data);
};

export const updateBusinessMenuStructureApiCall = (
  businessId: string,
  menuId: string,
  data: MenuChanges,
) => {
  return flairapi.patch(`${getMenusUrl(businessId)}/${menuId}/structure`, data);
};

//#region Categories
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

export type UpdateMenuCategoriesOrder = {
  categoryId: string;
  order: number;
};

export const updateMenuCategoriesOrderApiCall = (
  businessId: string,
  menuId: string,
  data: UpdateMenuCategoriesOrder[],
) => {
  return flairapi.patch(`${getMenusUrl(businessId)}/${menuId}/category/order`, {
    newOrder: data,
  });
};

export const updateMenuCategoryApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  data: {
    name?: string;
    description?: string;
  },
) => {
  return flairapi.patch(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}`,
    data,
  );
};

export const deleteMenuCategoryApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
) => {
  return flairapi.delete(`${getMenusUrl(businessId)}/${menuId}/${categoryId}`);
};

export type DuplicateItemsInCatDto = {
  id: string;
  useMedia: boolean;
};

export const duplicateItemsIntoCategoryApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  data: DuplicateItemsInCatDto[],
) => {
  return flairapi.post(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/duplicate`,
    {
      items: data,
    },
  );
};

//#endregion

//#region Items

export type CreateMenuItemDto = {
  name: string;
  description: string;
  price: number;
  allergies: string[];
  files: File[];
  inventoryTrackingMode?: string;
  inventoryItemId?: string;
  createInventoryItem?: boolean;
  inventoryUnitId?: string | number;
  quantityPerSale?: number;
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

  if (data.inventoryTrackingMode) {
    payload.append("inventoryTrackingMode", data.inventoryTrackingMode);
  }
  if (data.inventoryItemId) {
    payload.append("inventoryItemId", data.inventoryItemId);
  }
  if (data.createInventoryItem !== undefined) {
    payload.append("createInventoryItem", data.createInventoryItem.toString());
  }
  if (data.inventoryUnitId !== undefined) {
    payload.append("inventoryUnitId", data.inventoryUnitId.toString());
  }
  if (data.quantityPerSale !== undefined) {
    payload.append("quantityPerSale", data.quantityPerSale.toString());
  }

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
  inventoryTrackingMode?: string;
  inventoryItemId?: string;
  createInventoryItem?: boolean;
  inventoryUnitId?: string | number;
  quantityPerSale?: number;
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

  if (data.inventoryTrackingMode) {
    payload.append("inventoryTrackingMode", data.inventoryTrackingMode);
  }
  if (data.inventoryItemId) {
    payload.append("inventoryItemId", data.inventoryItemId);
  }
  if (data.createInventoryItem !== undefined) {
    payload.append("createInventoryItem", data.createInventoryItem.toString());
  }
  if (data.inventoryUnitId !== undefined) {
    payload.append("inventoryUnitId", data.inventoryUnitId.toString());
  }
  if (data.quantityPerSale !== undefined) {
    payload.append("quantityPerSale", data.quantityPerSale.toString());
  }

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


//#endregion

//#region Variants

export type CreateVariantDto = {
  name: string;
  price: number;
};

export const createVariantApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  data: CreateVariantDto,
) => {
  return flairapi.post(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/variants`,
    data,
  );
};

export const updateVariantApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  variantId: string,
  data: Partial<CreateVariantDto>,
) => {
  return flairapi.patch(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/variants/${variantId}`,
    data,
  );
};

export const deleteVariantApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  variantId: string,
) => {
  return flairapi.delete(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/variants/${variantId}`,
  );
};

//#endregion

//#region Modifier Groups

export type CreateModifierGroupDto = {
  name: string;
  selectionMode: 'single' | 'multiple';
  minSelections: number;
  maxSelections: number;
  order?: number;
};

export const createModifierGroupApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  data: CreateModifierGroupDto,
) => {
  return flairapi.post(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/modifier-groups`,
    data,
  );
};

export const updateModifierGroupApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  groupId: string,
  data: Partial<CreateModifierGroupDto>,
) => {
  return flairapi.patch(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/modifier-groups/${groupId}`,
    data,
  );
};

export const deleteModifierGroupApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  groupId: string,
) => {
  return flairapi.delete(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/modifier-groups/${groupId}`,
  );
};

//#endregion

//#region Modifier Items

export type CreateModifierItemDto = {
  name: string;
  price: number;
};

export const createModifierItemApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  groupId: string,
  data: CreateModifierItemDto,
) => {
  return flairapi.post(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/modifier-groups/${groupId}/items`,
    data,
  );
};

export const updateModifierItemApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  groupId: string,
  modifierItemId: string,
  data: Partial<CreateModifierItemDto>,
) => {
  return flairapi.patch(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/modifier-groups/${groupId}/items/${modifierItemId}`,
    data,
  );
};

export const deleteModifierItemApiCall = (
  businessId: string,
  menuId: string,
  categoryId: string,
  itemId: string,
  groupId: string,
  modifierItemId: string,
) => {
  return flairapi.delete(
    `${getMenusUrl(businessId)}/${menuId}/${categoryId}/${itemId}/modifier-groups/${groupId}/items/${modifierItemId}`,
  );
};

//#endregion

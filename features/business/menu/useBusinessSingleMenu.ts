import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateMenuCategoryDto,
  CreateMenuItemDto,
  createNewMenuCategoryApiCall,
  createNewMenuItemApiCall,
  deleteMenuItemApiCall,
  fetchBusinessSingleMenuApiCall,
  updateMenuItemApiCall,
  UpdateMenuItemDto,
} from "./service";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";

export const useBusinessSingleMenu = (businessId: string, menuId: string) => {
  const queryClient = useQueryClient();

  const { data: businessMenu, refetch: refreshBusinessMenu } = useQuery({
    queryKey: ["business_menu", businessId, menuId],
    queryFn: async () => {
      const resp = await fetchBusinessSingleMenuApiCall(businessId, menuId);
      if (resp.data.success) {
        return BusinessMenu.parseApiResponse(resp.data.data) || undefined;
      }
    },
    enabled: businessId != null && menuId != null,
  });

  const { mutate: createNewCategory } = useMutation({
    mutationKey: ["menu_create_cat", businessId, menuId],
    mutationFn: async (data: CreateMenuCategoryDto) => {
      return createNewMenuCategoryApiCall(businessId, menuId, data);
    },
    onSuccess(data, variables, context) {
      refreshBusinessMenu();
    },
  });

  //#region Menu item management

  const { mutate: createNewItem } = useMutation({
    mutationKey: ["menu_create_item", businessId, menuId],
    mutationFn: async (data: { catid: string; data: CreateMenuItemDto }) => {
      return createNewMenuItemApiCall(
        businessId,
        menuId,
        data.catid,
        data.data,
      );
    },
    onSuccess(data, variables, context) {
      refreshBusinessMenu();
    },
  });

  const { mutate: removeItem } = useMutation({
    mutationKey: ["menu_delete_item", businessId, menuId],
    mutationFn: async (data: { categoryId: string; itemId: string }) => {
      return deleteMenuItemApiCall(
        businessId,
        menuId,
        data.categoryId,
        data.itemId,
      );
    },
    onSuccess(data, variables, context) {
      refreshBusinessMenu();
    },
  });

  const { mutate: updateItem } = useMutation({
    mutationKey: ["menu_update_item", businessId, menuId],
    mutationFn: async (data: {
      categoryId: string;
      itemId: string;
      data: UpdateMenuItemDto;
    }) => {
      return updateMenuItemApiCall(
        businessId,
        menuId,
        data.categoryId,
        data.itemId,
        data.data,
      );
    },
    onSuccess(data, variables, context) {
      refreshBusinessMenu();
    },
  });

  //#endregion
  return {
    businessMenu,
    createNewCategory,
    createNewItem,
    removeItem,
    updateItem,
  };
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreateMenuCategoryDto,
  CreateMenuItemDto,
  createNewMenuCategoryApiCall,
  createNewMenuItemApiCall,
  deleteMenuCategoryApiCall,
  deleteMenuItemApiCall,
  fetchBusinessSingleMenuApiCall,
  updateBusinessMenuApiCall,
  UpdateMenuCategoriesOrder,
  updateMenuCategoriesOrderApiCall,
  updateMenuCategoryApiCall,
  UpdateMenuDto,
  updateMenuItemApiCall,
  UpdateMenuItemDto,
} from "./service";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";
import { toast } from "sonner";

export const useBusinessSingleMenu = (businessId: string, menuId: string) => {
  const queryClient = useQueryClient();

  //#region Menu
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

  const { mutate: updateMenu } = useMutation({
    mutationKey: ["menu_up", businessId, menuId],
    mutationFn: async (data: UpdateMenuDto) => {
      return updateBusinessMenuApiCall(businessId, menuId, data);
    },
    onSuccess(data, variables, context) {
      toast.success("Menu updated !");
      refreshBusinessMenu();
    },
  });

  //#endregion

  //#region Categories management

  const { mutate: createNewCategory } = useMutation({
    mutationKey: ["menu_create_cat", businessId, menuId],
    mutationFn: async (data: CreateMenuCategoryDto) => {
      return createNewMenuCategoryApiCall(businessId, menuId, data);
    },
    onSuccess(data, variables, context) {
      refreshBusinessMenu();
    },
  });

  const { mutate: updateCategoriesOrder } = useMutation({
    mutationKey: ["menu_cat_order_up", businessId, menuId],
    mutationFn: async (data: UpdateMenuCategoriesOrder[]) => {
      return updateMenuCategoriesOrderApiCall(businessId, menuId, data);
    },
    onSuccess(data, variables, context) {
      toast.success("Categories order updated !");
    },
  });

  const { mutate: updateCategory } = useMutation({
    mutationKey: ["menu_cat_up", businessId, menuId],
    mutationFn: async (data: {
      categoryId: string;
      data: {
        name: string;
        description: string;
      };
    }) => {
      return updateMenuCategoryApiCall(
        businessId,
        menuId,
        data.categoryId,
        data.data,
      );
    },
    onSuccess(data, variables, context) {
      toast.success("Category Updated !");
      refreshBusinessMenu();
    },
  });

  const { mutate: removeCategory } = useMutation({
    mutationKey: ["menu_cat_del", businessId, menuId],
    mutationFn: async (categoryId: string) => {
      return deleteMenuCategoryApiCall(businessId, menuId, categoryId);
    },
    onSuccess(data, variables, context) {
      toast.success("Category Removed !");
      refreshBusinessMenu();
    },
  });

  //#endregion

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
    // Menu
    businessMenu,
    updateMenu,
    // Categories
    createNewCategory,
    updateCategoriesOrder,
    updateCategory,
    removeCategory,
    // Items
    createNewItem,
    removeItem,
    updateItem,
  };
};

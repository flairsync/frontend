import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBusinessMenuApiCall,
  CreateMenuDto,
  fetchBusinessAllMenuItemsApiCall,
  fetchBusinessBasicMenusApiCall,
} from "./service";
import { BusinessMenuBasic } from "@/models/business/menu/BusinessMenuBasic";
import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";

export const useBusinessMenus = (businessId: string) => {
  const queryClient = useQueryClient();

  const { data: businessBasicMenus } = useQuery({
    queryKey: ["business_menus", businessId],
    queryFn: async () => {
      try {
        const resp = await fetchBusinessBasicMenusApiCall(businessId);
        return BusinessMenuBasic.parseApiArrayResponse(resp.data.data);
      } catch (error) {
        return [];
      }
    },
  });

  const { mutate: createNewMenu } = useMutation({
    mutationKey: ["create_new_menu", businessId],
    mutationFn: async (data: CreateMenuDto) => {
      return createBusinessMenuApiCall(businessId, data);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["business_menus", businessId],
      });
    },
  });

  const { data: businessAllItems } = useQuery({
    queryKey: ["business_menu_items", businessId],
    queryFn: async () => {
      const resp = await fetchBusinessAllMenuItemsApiCall(businessId);
      return BusinessMenuItem.parseApiArrayResponse(resp.data.data.items);
    },
  });

  return {
    businessBasicMenus,
    createNewMenu,
    businessAllItems,
  };
};

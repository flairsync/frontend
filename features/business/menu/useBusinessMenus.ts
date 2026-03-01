import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBusinessMenuApiCall,
  CreateMenuDto,
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!businessId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
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
      const resp = await fetchBusinessBasicMenusApiCall(businessId);
      const menus = resp.data.data;
      const allItems: BusinessMenuItem[] = [];

      menus.forEach((menu: any) => {
        const categories = menu.categories || [];
        categories.forEach((cat: any) => {
          const items = BusinessMenuItem.parseApiArrayResponse(cat.items || []);
          allItems.push(...items);
        });
      });

      return allItems;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!businessId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: businessAllCategories } = useQuery({
    queryKey: ["business_menu_categories", businessId],
    queryFn: async () => {
      const resp = await fetchBusinessBasicMenusApiCall(businessId);
      const menus = resp.data.data;
      const allCategories: { id: string; name: string; items: BusinessMenuItem[] }[] = [];

      menus.forEach((menu: any) => {
        const categories = menu.categories || [];
        categories.forEach((cat: any) => {
          const items = BusinessMenuItem.parseApiArrayResponse(cat.items || []);
          // if category already exists, merge items (though ideally IDs are unique)
          allCategories.push({
            id: cat.id,
            name: cat.name,
            items: items,
          });
        });
      });

      return allCategories;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!businessId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  return {
    businessBasicMenus,
    createNewMenu,
    businessAllItems,
    businessAllCategories,
  };
};

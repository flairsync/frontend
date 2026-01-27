import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBusinessMenuApiCall,
  CreateMenuDto,
  fetchBusinessBasicMenusApiCall,
} from "./service";
import { BusinessMenuBasic } from "@/models/business/menu/BusinessMenuBasic";

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

  return {
    businessBasicMenus,
    createNewMenu,
  };
};

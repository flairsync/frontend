import { useQuery } from "@tanstack/react-query";
import { fetchBusinessPlanApiCall } from "./service";

export interface BusinessPlanData {
  allowed: {
    businesses: number;
    menus: number;
    products: number;
    employees: number;
  };
  current: {
    businesses: number;
    menus: number;
    products: number;
    employees: number;
  };
  canCreateBusiness: boolean;
  canCreateMenu: boolean;
  canCreateProduct: boolean;
  canAddEmployee: boolean;
}

export const useBusinessPlan = (businessId: string | null | undefined) => {
  const { data: plan, isLoading } = useQuery<BusinessPlanData | null>({
    queryKey: ["business_plan", businessId],
    queryFn: async () => {
      if (!businessId) return null;
      return await fetchBusinessPlanApiCall(businessId) as unknown as BusinessPlanData;
    },
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return { plan, isLoading };
};

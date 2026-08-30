import { useQuery } from "@tanstack/react-query";
import { fetchBusinessEmployeesApiCall } from "../service";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";

export const useBusinessEmployment = (businessId: string, enabled: boolean = true) => {
  const { data: businessEmployees, isPending: loadingBusinessEmployees } =
    useQuery({
      queryKey: ["business_emps", businessId],
      queryFn: async () => {
        const resp = await fetchBusinessEmployeesApiCall(businessId);
        return BusinessEmployee.parseApiArrayResponse(resp.data);
      },
      enabled: !!businessId && enabled,
    });

  return {
    businessEmployees,
    loadingBusinessEmployees,
  };
};

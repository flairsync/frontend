import { useQuery } from "@tanstack/react-query";
import { fetchBusinessEmployeesApiCall } from "../service";
import { BusinessEmployee } from "@/models/business/BusinessEmployee";

export const useBusinessEmployment = (businessId: string) => {
  const { data: businessEmployees, isPending: loadingBusinessEmployees } =
    useQuery({
      queryKey: ["business_emps", businessId],
      queryFn: async () => {
        const resp = await fetchBusinessEmployeesApiCall(businessId);
        return BusinessEmployee.parseApiArrayResponse(resp.data.data);
      },
    });

  return {
    businessEmployees,
    loadingBusinessEmployees,
  };
};

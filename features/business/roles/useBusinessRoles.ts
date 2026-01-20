import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNewBusinessRoleApiCall,
  CreateRoleDataType,
  getBusinessRolesApiCall,
  updateBusinessEmployeeRolesApiCall,
} from "../service";
import { Role } from "@/models/business/roles/Role";

export const useBusinessRoles = (businessId?: string) => {
  const queryClient = useQueryClient();

  const { data: businessRoles, isPending: loadingBusinessRoles } = useQuery({
    queryKey: ["business_roles", businessId],
    queryFn: async () => {
      if (!businessId) return;
      const resp = await getBusinessRolesApiCall(businessId);
      return Role.parseApiArrayResponse(resp.data.data);
    },
  });

  const { mutate: createNewRole, isPending: creatingNewRole } = useMutation({
    mutationKey: ["create_role", businessId],
    mutationFn: async (data: CreateRoleDataType) => {
      if (!businessId) return;
      return createNewBusinessRoleApiCall(businessId, data);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["business_roles", businessId],
      });
    },
  });

  //#region Roles & Staff

  const { mutate: updateEmployeeRoles } = useMutation({
    mutationFn: async (data: { employmentId: string; roles: string[] }) => {
      if (!businessId) return;
      return updateBusinessEmployeeRolesApiCall(
        businessId,
        data.employmentId,
        data.roles,
      );
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["business_emps", businessId],
      });
    },
  });

  //#endregion

  return {
    businessRoles,
    loadingBusinessRoles,

    createNewRole,
    creatingNewRole,

    updateEmployeeRoles,
  };
};

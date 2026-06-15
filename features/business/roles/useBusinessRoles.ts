import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkAssignRoleToEmployeesApiCall,
  createNewBusinessRoleApiCall,
  CreateRoleDataType,
  deleteBusinessRoleApiCall,
  getBusinessRolesApiCall,
  updateBusinessEmployeeRolesApiCall,
  updateBusinessRoleApiCall,
  updateBusinessRolePermissionApiCall,
  deleteBusinessRolePermissionApiCall,
} from "../service";
import { Role } from "@/models/business/roles/Role";

export const useBusinessRoles = (businessId?: string) => {
  const queryClient = useQueryClient();

  const { data: businessRoles, isPending: loadingBusinessRoles } = useQuery({
    queryKey: ["business_roles", businessId],
    queryFn: async () => {
      if (!businessId) return;
      const resp = await getBusinessRolesApiCall(businessId);
      return Role.parseApiArrayResponse(resp.data as any);
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

  const { mutate: updateRole, isPending: updatingRole } = useMutation({
    mutationKey: ["update_role", businessId],
    mutationFn: async (data: { roleId: string; data: CreateRoleDataType }) => {
      if (!businessId) return;
      return updateBusinessRoleApiCall(businessId, data.roleId, data.data);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["business_roles", businessId],
      });
    },
  });

  const { mutate: deleteRole, isPending: deletingRole } = useMutation({
    mutationKey: ["delete_role", businessId],
    mutationFn: async (roleId: string) => {
      if (!businessId) return;
      return deleteBusinessRoleApiCall(businessId, roleId);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["business_roles", businessId],
      });
    },
  });

  const { mutate: updateRolePermission, isPending: updatingRolePermission } = useMutation({
    mutationKey: ["update_role_permission", businessId],
    mutationFn: async (data: {
      roleId: string;
      permission: {
        permissionKey: string;
        canRead: boolean;
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
      };
    }) => {
      if (!businessId) return;
      return updateBusinessRolePermissionApiCall(businessId, data.roleId, data.permission);
    },
    onSuccess(data, variables, context) {
      queryClient.refetchQueries({
        queryKey: ["business_roles", businessId],
      });
    },
  });

  const { mutate: deleteRolePermission, isPending: deletingRolePermission } = useMutation({
    mutationKey: ["delete_role_permission", businessId],
    mutationFn: async (data: { roleId: string; permissionKey: string }) => {
      if (!businessId) return;
      return deleteBusinessRolePermissionApiCall(businessId, data.roleId, data.permissionKey);
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

  const { mutate: bulkAssignRole, isPending: bulkAssigningRole } = useMutation({
    mutationKey: ["bulk_assign_role", businessId],
    mutationFn: async (data: { roleId: string; employmentIds: string[] }) => {
      if (!businessId) return;
      return bulkAssignRoleToEmployeesApiCall(businessId, data.roleId, data.employmentIds);
    },
    onSuccess() {
      queryClient.refetchQueries({ queryKey: ["business_emps", businessId] });
    },
  });

  //#endregion

  return {
    businessRoles,
    loadingBusinessRoles,

    createNewRole,
    creatingNewRole,

    updateRole,
    updatingRole,

    deleteRole,
    deletingRole,

    updateRolePermission,
    updatingRolePermission,

    deleteRolePermission,
    deletingRolePermission,

    updateEmployeeRoles,

    bulkAssignRole,
    bulkAssigningRole,
  };
};
